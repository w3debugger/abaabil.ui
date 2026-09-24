import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { axe } from 'jest-axe'
import ContextMenu from '../src/context-menu/index.jsx'
import A11yContextMenu from '../src/context-menu/a11y.jsx'

// jsdom has no Popover API. The panel is a plain div here, so focus can
// move into it, and showPopover/hidePopover are stubbed on the prototype
// so the calls the browser would act on can be asserted.

const ITEMS = [
  { label: 'Duplicate', onSelect: () => {} },
  { label: 'Rename', onSelect: () => {} },
  { label: 'Archive', disabled: true },
  { label: 'Delete', onSelect: () => {} },
]

beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn()
  HTMLElement.prototype.hidePopover = vi.fn()
})
afterEach(() => vi.restoreAllMocks())

const region = () => screen.getByText('Region').parentElement

describe('ContextMenu (normal tier)', () => {
  it('wraps the region and renders a popover panel by id', () => {
    render(<ContextMenu id="m" items={ITEMS}><p>Region</p></ContextMenu>)
    expect(document.getElementById('m')).toHaveAttribute('popover', 'auto')
    expect(region()).toContainElement(document.getElementById('m'))
  })

  it('right-click shows the panel at the pointer and swallows the native menu', () => {
    render(<ContextMenu id="m" items={ITEMS}><p>Region</p></ContextMenu>)
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 120, clientY: 80 })
    fireEvent(screen.getByText('Region'), event)
    const panel = document.getElementById('m')
    expect(panel.showPopover).toHaveBeenCalled()
    expect(panel.style.left).toBe('120px')
    expect(panel.style.top).toBe('80px')
    expect(event.defaultPrevented).toBe(true)
  })

  it('clamps the panel inside the viewport', () => {
    render(<ContextMenu id="m" items={ITEMS}><p>Region</p></ContextMenu>)
    fireEvent.contextMenu(screen.getByText('Region'), { clientX: 5000, clientY: 5000 })
    const panel = document.getElementById('m')
    expect(parseInt(panel.style.left)).toBeLessThanOrEqual(window.innerWidth)
    expect(parseInt(panel.style.top)).toBeLessThanOrEqual(window.innerHeight)
  })

  it('renders actions as buttons and links as anchors', () => {
    render(<ContextMenu id="m" items={[{ label: 'Go', href: '/x' }, { label: 'Do' }]}><p>Region</p></ContextMenu>)
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '/x')
    expect(screen.getByRole('button', { name: 'Do' })).toHaveAttribute('type', 'button')
  })

  it('drops the href from a disabled link and marks it with data-disabled', () => {
    render(<ContextMenu id="m" items={[{ label: 'Go', href: '/x', disabled: true }]}><p>Region</p></ContextMenu>)
    const item = screen.getByText('Go')
    expect(item).not.toHaveAttribute('href')
    expect(item).toHaveAttribute('data-disabled')
  })

  it('closes after an item is chosen, since a click inside is not a light-dismiss', () => {
    const onSelect = vi.fn()
    render(<ContextMenu id="m" items={[{ label: 'Do', onSelect }]}><p>Region</p></ContextMenu>)
    fireEvent.click(screen.getByRole('button', { name: 'Do' }))
    expect(onSelect).toHaveBeenCalled()
    expect(document.getElementById('m').hidePopover).toHaveBeenCalled()
  })

  it('adds no menu semantics and no tab stop at the normal tier', () => {
    render(<ContextMenu id="m" items={ITEMS}><p>Region</p></ContextMenu>)
    expect(document.getElementById('m')).not.toHaveAttribute('role')
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0)
    expect(region()).not.toHaveAttribute('tabindex')
  })
})

describe('ContextMenu (a11y tier)', () => {
  const open = (items = ITEMS) => {
    const result = render(
      <A11yContextMenu id="m" label="File actions" items={items}><p>Region</p></A11yContextMenu>
    )
    fireEvent.contextMenu(screen.getByText('Region'), { clientX: 10, clientY: 10 })
    return { ...result, panel: document.getElementById('m') }
  }

  it('builds the APG structure: a named menu and a menuitem per entry', () => {
    open()
    expect(screen.getByRole('menu', { name: 'File actions' })).toBeInTheDocument()
    expect(screen.getAllByRole('menuitem')).toHaveLength(4)
  })

  it('moves focus to the first enabled item on open', () => {
    open()
    expect(screen.getAllByRole('menuitem')[0]).toHaveFocus()
  })

  it('uses a roving tabindex, so Tab leaves the menu rather than walking it', () => {
    open()
    expect(screen.getAllByRole('menuitem').map((i) => i.getAttribute('tabindex')))
      .toEqual(['0', '-1', '-1', '-1'])
  })

  it('moves with ArrowDown, skips disabled, and wraps at both ends', async () => {
    open()
    const items = screen.getAllByRole('menuitem')
    await userEvent.keyboard('{ArrowDown}')
    expect(items[1]).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    expect(items[3]).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    expect(items[0]).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    expect(items[3]).toHaveFocus()
  })

  it('jumps to the ends with Home and End', async () => {
    open()
    const items = screen.getAllByRole('menuitem')
    await userEvent.keyboard('{End}')
    expect(items[3]).toHaveFocus()
    await userEvent.keyboard('{Home}')
    expect(items[0]).toHaveFocus()
  })

  it('jumps to the next item starting with typed characters, wrapping', async () => {
    open()
    const items = screen.getAllByRole('menuitem')
    // Starts on Duplicate, so "d" finds Delete, not the item already focused.
    await userEvent.keyboard('d')
    expect(items[3]).toHaveFocus()
  })

  it('accumulates characters typed in quick succession into one search', async () => {
    open()
    // "re", not a fresh search for "e", which matches nothing.
    await userEvent.keyboard('re')
    expect(screen.getAllByRole('menuitem')[1]).toHaveFocus()
  })

  it('runs onSelect on Enter, from the real button, and closes', async () => {
    const onSelect = vi.fn()
    const { panel } = open([{ label: 'Duplicate', onSelect }])
    await userEvent.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalled()
    expect(panel.hidePopover).toHaveBeenCalled()
  })

  it('closes on Escape and returns focus to where it was', async () => {
    render(
      <>
        <button>Before</button>
        <A11yContextMenu id="m" label="File actions" items={ITEMS}><p>Region</p></A11yContextMenu>
      </>
    )
    screen.getByRole('button', { name: 'Before' }).focus()
    fireEvent.contextMenu(screen.getByText('Region'), { clientX: 10, clientY: 10 })
    expect(screen.getAllByRole('menuitem')[0]).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    expect(document.getElementById('m').hidePopover).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus()
  })

  it('closes on Tab without restoring focus, so Tab carries on out', async () => {
    const { panel } = open()
    fireEvent.keyDown(screen.getAllByRole('menuitem')[0], { key: 'Tab' })
    expect(panel.hidePopover).toHaveBeenCalled()
  })

  it('opens from the keyboard with Shift+F10 at the region\'s corner', async () => {
    render(<A11yContextMenu id="m" label="File actions" items={ITEMS}><p>Region</p></A11yContextMenu>)
    const wrapper = region()
    expect(wrapper).toHaveAttribute('tabindex', '0')
    wrapper.focus()
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    const panel = document.getElementById('m')
    expect(panel.showPopover).toHaveBeenCalled()
    expect(panel.style.left).toBe('0px')
    expect(screen.getAllByRole('menuitem')[0]).toHaveFocus()
  })

  it('opens from the ContextMenu key too', () => {
    render(<A11yContextMenu id="m" label="File actions" items={ITEMS}><p>Region</p></A11yContextMenu>)
    fireEvent.keyDown(region(), { key: 'ContextMenu' })
    expect(document.getElementById('m').showPopover).toHaveBeenCalled()
  })

  it('a disabled link keeps its role but loses its href and says so', () => {
    const { panel } = open([{ label: 'Go', href: '/x', disabled: true }, { label: 'Do' }])
    const item = screen.getByRole('menuitem', { name: 'Go' })
    expect(item).not.toHaveAttribute('href')
    expect(item).toHaveAttribute('aria-disabled', 'true')
    expect(screen.queryByRole('link')).toBeNull()
    fireEvent.click(item)
    expect(panel.hidePopover).not.toHaveBeenCalled()
  })

  it('does not put aria-haspopup on the region, which is not a control', () => {
    open()
    expect(region()).not.toHaveAttribute('aria-haspopup')
  })

  it('warns when the menu has no name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yContextMenu id="m" items={ITEMS}><p>Region</p></A11yContextMenu>)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('has no axe violations with the panel rendered', async () => {
    const { container } = open()
    expect(await axe(container)).toHaveNoViolations()
  })
})
