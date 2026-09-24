import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'jest-axe'
import Menu from '../src/menu/index.jsx'
import A11yMenu from '../src/menu/a11y.jsx'

// jsdom implements no Popover API, so the panel never actually opens
// here and focus never moves into it. What that leaves testable is the
// wiring the browser acts on, the menu semantics, and the keyboard
// handling, which is attached to the panel and can be driven directly.
// Opening, light-dismiss and Escape are the browser's and are checked in
// a real browser on the docs site.

const ITEMS = [
  { label: 'Duplicate', onSelect: () => {} },
  { label: 'Rename', onSelect: () => {} },
  { label: 'Archive', disabled: true },
  { label: 'Delete', onSelect: () => {} },
]

describe('Menu (normal tier)', () => {
  it('wires a trigger to a panel by id, with no wrapper element', () => {
    const { container } = render(<Menu id="m" trigger="Actions" items={ITEMS} />)
    expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute('popovertarget', 'm')
    expect(document.getElementById('m')).toHaveAttribute('popover', 'auto')
    expect(container.children).toHaveLength(2)
  })

  it('renders actions as buttons and links as anchors', () => {
    render(<Menu id="m" trigger="Actions" items={[{ label: 'Go', href: '/x' }, { label: 'Do' }]} />)
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '/x')
    expect(screen.getByRole('button', { name: 'Do' })).toHaveAttribute('type', 'button')
  })

  it('mints a matching anchor-name and position-anchor', () => {
    render(<Menu id="m" trigger="Actions" items={ITEMS} />)
    expect(screen.getByRole('button', { name: 'Actions' }).style.getPropertyValue('anchor-name'))
      .toBe('--abaabil-menu-m')
    expect(document.getElementById('m').style.getPropertyValue('position-anchor'))
      .toBe('--abaabil-menu-m')
  })

  it('merges a triggerProps className with the trigger class rather than replacing it', () => {
    render(<Menu id="m" trigger="Actions" items={ITEMS} triggerProps={{ className: 'abaabil-button' }} />)
    expect(screen.getByRole('button', { name: 'Actions' })).toHaveClass('abaabil-menu__trigger', 'abaabil-button')
  })

  it('drops the href from a disabled link and marks it with data-disabled', () => {
    render(<Menu id="m" trigger="Actions" items={[{ label: 'Go', href: '/x', disabled: true }]} />)
    const item = screen.getByText('Go')
    expect(item).not.toHaveAttribute('href')
    expect(item).toHaveAttribute('data-disabled')
  })

  it('adds no menu semantics at the normal tier', () => {
    render(<Menu id="m" trigger="Actions" items={ITEMS} />)
    expect(document.getElementById('m')).not.toHaveAttribute('role')
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Actions' })).not.toHaveAttribute('aria-expanded')
  })
})

describe('Menu (a11y tier)', () => {
  const open = (ui) => {
    const result = render(ui)
    const panel = document.getElementById('m')
    // Stand in for the Popover API jsdom does not have, then fire the
    // event the real one would, which is what the component listens to.
    panel.showPopover = vi.fn()
    panel.hidePopover = vi.fn()
    return { ...result, panel }
  }

  it('builds the APG structure: a menu, and a menuitem per entry', () => {
    open(<A11yMenu id="m" trigger="Actions" items={ITEMS} />)
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getAllByRole('menuitem')).toHaveLength(4)
  })

  it('declares the popup on the trigger and starts collapsed', () => {
    open(<A11yMenu id="m" trigger="Actions" items={ITEMS} />)
    const trigger = screen.getByRole('button', { name: 'Actions' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('tracks aria-expanded from the panel\'s own toggle event, not a second copy of the state', () => {
    const { panel } = open(<A11yMenu id="m" trigger="Actions" items={ITEMS} />)
    const trigger = screen.getByRole('button', { name: 'Actions' })
    fireEvent(panel, Object.assign(new Event('toggle'), { newState: 'open' }))
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    fireEvent(panel, Object.assign(new Event('toggle'), { newState: 'closed' }))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('merges a triggerProps className, so the menubar can still find the trigger', () => {
    open(<A11yMenu id="m" trigger="Actions" items={ITEMS} triggerProps={{ className: 'abaabil-button' }} />)
    expect(screen.getByRole('button', { name: 'Actions' })).toHaveClass('abaabil-menu__trigger', 'abaabil-button')
  })

  it('opens on the first item that is enabled now, not the one enabled at mount', () => {
    const { panel, rerender } = open(
      <A11yMenu id="m" trigger="Actions" items={[{ label: 'Undo' }, { label: 'Redo' }]} />
    )
    rerender(<A11yMenu id="m" trigger="Actions" items={[{ label: 'Undo', disabled: true }, { label: 'Redo' }]} />)
    fireEvent(panel, Object.assign(new Event('toggle'), { newState: 'open' }))
    expect(screen.getByRole('menuitem', { name: 'Redo' })).toHaveFocus()
    expect(screen.getByRole('menuitem', { name: 'Redo' })).toHaveAttribute('tabindex', '0')
  })

  it('names the menu by its trigger when no label is given', () => {
    open(<A11yMenu id="m" trigger="Actions" items={ITEMS} />)
    expect(screen.getByRole('menu', { name: 'Actions' })).toBeInTheDocument()
  })

  it('a disabled link keeps its role but loses its href and says so', () => {
    open(<A11yMenu id="m" trigger="Actions" items={[{ label: 'Go', href: '/x', disabled: true }, { label: 'Do' }]} />)
    const item = screen.getByRole('menuitem', { name: 'Go' })
    expect(item).not.toHaveAttribute('href')
    expect(item).toHaveAttribute('aria-disabled', 'true')
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('uses a roving tabindex, so Tab leaves the menu rather than walking it', () => {
    open(<A11yMenu id="m" trigger="Actions" items={ITEMS} />)
    expect(screen.getAllByRole('menuitem').map((i) => i.getAttribute('tabindex')))
      .toEqual(['0', '-1', '-1', '-1'])
  })

  it('moves down with ArrowDown and wraps at the end', () => {
    const { panel } = open(<A11yMenu id="m" trigger="Actions" items={ITEMS} />)
    fireEvent.keyDown(panel, { key: 'ArrowDown' })
    expect(screen.getAllByRole('menuitem')[1]).toHaveFocus()
    fireEvent.keyDown(panel, { key: 'ArrowDown' })
    // Archive is disabled, so it is skipped rather than focused.
    expect(screen.getAllByRole('menuitem')[3]).toHaveFocus()
    fireEvent.keyDown(panel, { key: 'ArrowDown' })
    expect(screen.getAllByRole('menuitem')[0]).toHaveFocus()
  })

  it('handles two keydowns arriving in the same tick, which key repeat does', () => {
    const { panel } = open(<A11yMenu id="m" trigger="Actions" items={ITEMS} />)
    // Dispatched raw, not through fireEvent, so React does not re-render
    // between them. Reading the active index from state rather than a ref
    // made both events move a single step from the same origin, so
    // holding ArrowDown moved one item and stopped. Browser-only bug:
    // fireEvent flushes between calls and never reproduced it.
    act(() => {
      panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
      panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    })
    // Two steps from Duplicate, skipping the disabled Archive, is Delete.
    expect(screen.getAllByRole('menuitem')[3]).toHaveFocus()
  })

  it('moves up with ArrowUp and wraps at the start', () => {
    const { panel } = open(<A11yMenu id="m" trigger="Actions" items={ITEMS} />)
    fireEvent.keyDown(panel, { key: 'ArrowUp' })
    expect(screen.getAllByRole('menuitem')[3]).toHaveFocus()
  })

  it('jumps to the ends with Home and End, skipping disabled items', () => {
    const { panel } = open(<A11yMenu id="m" trigger="Actions" items={ITEMS} />)
    fireEvent.keyDown(panel, { key: 'End' })
    expect(screen.getAllByRole('menuitem')[3]).toHaveFocus()
    fireEvent.keyDown(panel, { key: 'Home' })
    expect(screen.getAllByRole('menuitem')[0]).toHaveFocus()
  })

  it('jumps to the next item starting with a typed character, wrapping', () => {
    const { panel } = open(<A11yMenu id="m" trigger="Actions" items={ITEMS} />)
    // Starts on Duplicate, so searching "d" finds Delete rather than
    // matching the item already focused.
    fireEvent.keyDown(panel, { key: 'd' })
    expect(screen.getAllByRole('menuitem')[3]).toHaveFocus()
  })

  it('accumulates characters typed in quick succession into one search', () => {
    const { panel } = open(<A11yMenu id="m" trigger="Actions" items={ITEMS} />)
    fireEvent.keyDown(panel, { key: 'r' })
    expect(screen.getAllByRole('menuitem')[1]).toHaveFocus()
    // "re", not a fresh search for "e": the APG asks for multi-character
    // typeahead, which is what makes Rename reachable past Delete.
    fireEvent.keyDown(panel, { key: 'e' })
    expect(screen.getAllByRole('menuitem')[1]).toHaveFocus()
  })

  it('starts a fresh search once the buffer has gone stale', () => {
    const { panel } = open(<A11yMenu id="m" trigger="Actions" items={ITEMS} />)
    const realNow = Date.now
    try {
      let t = 1_000
      Date.now = () => t
      fireEvent.keyDown(panel, { key: 'r' })
      expect(screen.getAllByRole('menuitem')[1]).toHaveFocus()
      t += 600 // past the 500ms window
      fireEvent.keyDown(panel, { key: 'd' })
      expect(screen.getAllByRole('menuitem')[3]).toHaveFocus()
    } finally {
      Date.now = realNow
    }
  })

  it('ignores keys with a modifier, so browser shortcuts still work', () => {
    const { panel } = open(<A11yMenu id="m" trigger="Actions" items={ITEMS} />)
    const before = document.activeElement
    fireEvent.keyDown(panel, { key: 'r', metaKey: true })
    expect(document.activeElement).toBe(before)
  })

  it('closes on Tab, as the APG requires, without swallowing the Tab', () => {
    const { panel } = open(<A11yMenu id="m" trigger="Actions" items={ITEMS} />)
    fireEvent.keyDown(panel, { key: 'Tab' })
    expect(panel.hidePopover).toHaveBeenCalled()
  })

  it('runs onSelect and closes when an item is chosen', () => {
    const onSelect = vi.fn()
    const { panel } = open(
      <A11yMenu id="m" trigger="Actions" items={[{ label: 'Duplicate', onSelect }]} />
    )
    fireEvent.click(screen.getByRole('menuitem', { name: 'Duplicate' }))
    expect(onSelect).toHaveBeenCalled()
    expect(panel.hidePopover).toHaveBeenCalled()
  })

  it('marks a disabled item disabled rather than merely styling it', () => {
    open(<A11yMenu id="m" trigger="Actions" items={ITEMS} />)
    expect(screen.getByRole('menuitem', { name: 'Archive', hidden: true })).toBeDisabled()
  })

  it('accepts an accessible name for the menu itself', () => {
    open(<A11yMenu id="m" trigger="Actions" items={ITEMS} label="File actions" />)
    expect(screen.getByRole('menu', { name: 'File actions' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = open(<A11yMenu id="m" trigger="Actions" items={ITEMS} label="Actions" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
