import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { axe } from 'jest-axe'
import Menubar from '../src/menubar/index.jsx'
import A11yMenubar from '../src/menubar/a11y.jsx'
import A11yMenu from '../src/menu/a11y.jsx'

// jsdom has no Popover API, so as in menu.test.jsx the panels are given
// stub showPopover/hidePopover and are "opened" by firing the toggle
// event the real one would, which is what menu listens to.

const Menus = () => (
  <>
    <A11yMenu id="file" trigger="File" items={[{ label: 'New' }, { label: 'Open' }]} />
    <A11yMenu id="edit" trigger="Edit" items={[{ label: 'Undo' }]} />
    <A11yMenu id="view" trigger="View" items={[{ label: 'Zoom' }]} />
  </>
)

const stub = (id) => {
  const panel = document.getElementById(id)
  panel.showPopover = vi.fn()
  panel.hidePopover = vi.fn()
  return panel
}
const openPanel = (panel) =>
  fireEvent(panel, Object.assign(new Event('toggle'), { newState: 'open' }))
const trigger = (name) => screen.getByRole('menuitem', { name })

describe('Menubar (normal tier)', () => {
  it('is a plain div around the menus, with no role and no ARIA', () => {
    const { container } = render(<Menubar><Menus /></Menubar>)
    const root = container.querySelector('.abaabil-menubar')
    expect(root.tagName).toBe('DIV')
    expect(root).not.toHaveAttribute('role')
    expect([...root.attributes].map((a) => a.name).filter((n) => n.startsWith('aria-'))).toEqual([])
    expect(screen.getByRole('button', { name: 'File' })).not.toHaveAttribute('tabindex')
  })
})

describe('Menubar (a11y tier)', () => {
  let warn
  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { warn.mockRestore() })

  it('is a named horizontal menubar of menuitems', () => {
    render(<A11yMenubar label="Application"><Menus /></A11yMenubar>)
    const bar = screen.getByRole('menubar', { name: 'Application' })
    expect(bar).toHaveAttribute('aria-orientation', 'horizontal')
    expect(trigger('File')).toHaveAttribute('aria-haspopup', 'menu')
  })

  it('collapses the row to one tab stop', () => {
    render(<A11yMenubar label="Application"><Menus /></A11yMenubar>)
    expect([trigger('File'), trigger('Edit'), trigger('View')].map((t) => t.tabIndex)).toEqual([0, -1, -1])
  })

  it('moves with ArrowRight and wraps, ArrowLeft wraps at the start', () => {
    render(<A11yMenubar label="Application"><Menus /></A11yMenubar>)
    trigger('File').focus()
    fireEvent.keyDown(trigger('File'), { key: 'ArrowRight' })
    expect(trigger('Edit')).toHaveFocus()
    expect(trigger('Edit').tabIndex).toBe(0)
    fireEvent.keyDown(trigger('Edit'), { key: 'ArrowRight' })
    fireEvent.keyDown(trigger('View'), { key: 'ArrowRight' })
    expect(trigger('File')).toHaveFocus()
    fireEvent.keyDown(trigger('File'), { key: 'ArrowLeft' })
    expect(trigger('View')).toHaveFocus()
  })

  it('jumps to the ends with Home and End', () => {
    render(<A11yMenubar label="Application"><Menus /></A11yMenubar>)
    trigger('File').focus()
    fireEvent.keyDown(trigger('File'), { key: 'End' })
    expect(trigger('View')).toHaveFocus()
    fireEvent.keyDown(trigger('View'), { key: 'Home' })
    expect(trigger('File')).toHaveFocus()
  })

  it('opens the focused menu with ArrowDown, as the APG asks', () => {
    render(<A11yMenubar label="Application"><Menus /></A11yMenubar>)
    const file = stub('file')
    trigger('File').focus()
    fireEvent.keyDown(trigger('File'), { key: 'ArrowDown' })
    expect(file.showPopover).toHaveBeenCalled()
  })

  it('with a menu open, ArrowRight closes it and opens the neighbour', () => {
    render(<A11yMenubar label="Application"><Menus /></A11yMenubar>)
    const file = stub('file')
    const edit = stub('edit')
    openPanel(file)
    expect(trigger('File')).toHaveAttribute('aria-expanded', 'true')
    // Menu has moved focus to the first item, so the key comes from
    // inside the panel, not from the trigger.
    expect(screen.getByRole('menuitem', { name: 'New' })).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' })
    expect(file.hidePopover).toHaveBeenCalled()
    expect(edit.showPopover).toHaveBeenCalled()
    expect(trigger('Edit').tabIndex).toBe(0)
  })

  it('leaves Home and End to the open menu, which already claimed them', () => {
    render(<A11yMenubar label="Application"><Menus /></A11yMenubar>)
    const file = stub('file')
    const view = stub('view')
    openPanel(file)
    fireEvent.keyDown(document.activeElement, { key: 'End' })
    expect(screen.getByRole('menuitem', { name: 'Open' })).toHaveFocus()
    expect(view.showPopover).not.toHaveBeenCalled()
  })

  it('warns when the menubar has no accessible name', () => {
    render(<A11yMenubar><Menus /></A11yMenubar>)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('abaabil/menubar'))
  })

  it('has no axe violations', async () => {
    const { container } = render(<A11yMenubar label="Application"><Menus /></A11yMenubar>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
