import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { axe } from 'jest-axe'
import Toolbar from '../src/toolbar/index.jsx'
import A11yToolbar from '../src/toolbar/a11y.jsx'

const Buttons = () => (
  <>
    <button type="button">Bold</button>
    <button type="button">Italic</button>
    <button type="button" disabled>Strike</button>
    <button type="button">Link</button>
  </>
)

describe('Toolbar (normal tier)', () => {
  it('renders a container and leaves its children alone', () => {
    const { container } = render(<Toolbar><Buttons /></Toolbar>)
    expect(container.querySelector('.abaabil-toolbar')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })

  it('adds no role and no ARIA at the normal tier', () => {
    const { container } = render(<Toolbar><Buttons /></Toolbar>)
    const root = container.querySelector('.abaabil-toolbar')
    expect(root).not.toHaveAttribute('role')
    expect([...root.attributes].map((a) => a.name).filter((n) => n.startsWith('aria-'))).toEqual([])
  })

  it('leaves the tab order alone, so every button is still a stop', () => {
    render(<Toolbar><Buttons /></Toolbar>)
    for (const b of screen.getAllByRole('button')) {
      expect(b).not.toHaveAttribute('tabindex')
    }
  })
})

describe('Toolbar (a11y tier)', () => {
  let warn
  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { warn.mockRestore() })

  it('is a named toolbar', () => {
    render(<A11yToolbar label="Formatting"><Buttons /></A11yToolbar>)
    expect(screen.getByRole('toolbar', { name: 'Formatting' })).toBeInTheDocument()
  })

  it('collapses the whole toolbar to one tab stop', () => {
    render(<A11yToolbar label="Formatting"><Buttons /></A11yToolbar>)
    const enabled = screen.getAllByRole('button').filter((b) => !b.disabled)
    expect(enabled.map((b) => b.tabIndex)).toEqual([0, -1, -1])
  })

  it('never puts a disabled control in the sequence', () => {
    render(<A11yToolbar label="Formatting"><Buttons /></A11yToolbar>)
    const strike = screen.getByRole('button', { name: 'Strike' })
    // `disabled` already takes it out of the tab order, so the roving
    // tabindex leaves it alone entirely rather than writing -1 onto it.
    // What matters is that it is never the one stop.
    expect(strike).toBeDisabled()
    expect(document.querySelectorAll('[tabindex="0"]')).toHaveLength(1)
    expect(document.querySelector('[tabindex="0"]')).not.toBe(strike)
  })

  it('moves with the arrows, skipping disabled, and wraps', () => {
    render(<A11yToolbar label="Formatting"><Buttons /></A11yToolbar>)
    const [bold, italic, , link] = screen.getAllByRole('button')
    bold.focus()
    fireEvent.keyDown(bold, { key: 'ArrowRight' })
    expect(italic).toHaveFocus()
    fireEvent.keyDown(italic, { key: 'ArrowRight' })
    expect(link).toHaveFocus()
    fireEvent.keyDown(link, { key: 'ArrowRight' })
    expect(bold).toHaveFocus()
  })

  it('moves backwards with ArrowLeft, wrapping at the start', () => {
    render(<A11yToolbar label="Formatting"><Buttons /></A11yToolbar>)
    const [bold, , , link] = screen.getAllByRole('button')
    bold.focus()
    fireEvent.keyDown(bold, { key: 'ArrowLeft' })
    expect(link).toHaveFocus()
  })

  it('jumps to the ends with Home and End', () => {
    render(<A11yToolbar label="Formatting"><Buttons /></A11yToolbar>)
    const [bold, , , link] = screen.getAllByRole('button')
    bold.focus()
    fireEvent.keyDown(bold, { key: 'End' })
    expect(link).toHaveFocus()
    fireEvent.keyDown(link, { key: 'Home' })
    expect(bold).toHaveFocus()
  })

  it('uses the vertical arrow pair and says so, when vertical', () => {
    render(<A11yToolbar label="Formatting" orientation="vertical"><Buttons /></A11yToolbar>)
    const bar = screen.getByRole('toolbar')
    expect(bar).toHaveAttribute('aria-orientation', 'vertical')
    const [bold, italic] = screen.getAllByRole('button')
    bold.focus()
    fireEvent.keyDown(bold, { key: 'ArrowDown' })
    expect(italic).toHaveFocus()
    // The horizontal pair must not also work, or the announced
    // orientation is a lie.
    fireEvent.keyDown(italic, { key: 'ArrowRight' })
    expect(italic).toHaveFocus()
  })

  it('leaves the arrows to a control that needs them itself', () => {
    // A select inside a toolbar would be unusable if every arrow press
    // moved focus out of it.
    render(
      <A11yToolbar label="Formatting">
        <button type="button">Bold</button>
        <select aria-label="Size"><option>1</option><option>2</option></select>
      </A11yToolbar>
    )
    const select = screen.getByRole('combobox')
    select.focus()
    fireEvent.keyDown(select, { key: 'ArrowRight' })
    expect(select).toHaveFocus()
  })

  it('keeps a custom focusable in the arrow sequence after the roving tabindex writes -1 onto it', () => {
    render(
      <A11yToolbar label="Formatting">
        <button type="button">A</button>
        <div tabIndex={0} role="button">Custom</div>
        <button type="button">B</button>
      </A11yToolbar>
    )
    const [a, custom] = screen.getAllByRole('button')
    expect(custom.tabIndex).toBe(-1)
    a.focus()
    fireEvent.keyDown(a, { key: 'ArrowRight' })
    expect(custom).toHaveFocus()
  })

  it('moves the stop to a control focused by a click, so the next Tab in returns there', () => {
    render(<A11yToolbar label="Formatting"><Buttons /></A11yToolbar>)
    const [bold, italic] = screen.getAllByRole('button')
    act(() => italic.focus())
    expect(italic.tabIndex).toBe(0)
    expect(bold.tabIndex).toBe(-1)
  })

  it('moves the stop off a control that disables itself without a re-render', async () => {
    render(<A11yToolbar label="Formatting"><Buttons /></A11yToolbar>)
    const [bold, italic] = screen.getAllByRole('button')
    expect(bold.tabIndex).toBe(0)
    bold.disabled = true
    // MutationObserver callbacks are microtasks.
    await act(async () => {})
    expect(italic.tabIndex).toBe(0)
    expect(document.querySelectorAll('button:not([disabled])[tabindex="0"]')).toHaveLength(1)
  })

  it('swaps the arrows in a right-to-left document, so ArrowRight moves visually right', () => {
    render(<A11yToolbar label="Formatting"><Buttons /></A11yToolbar>)
    // jsdom's getComputedStyle does not inherit direction, so it goes on
    // the toolbar itself rather than on the document.
    screen.getByRole('toolbar').style.direction = 'rtl'
    const [bold, italic] = screen.getAllByRole('button')
    bold.focus()
    fireEvent.keyDown(bold, { key: 'ArrowLeft' })
    expect(italic).toHaveFocus()
    fireEvent.keyDown(italic, { key: 'ArrowRight' })
    expect(bold).toHaveFocus()
  })

  it('still calls a consumer onKeyDown and onFocus', () => {
    const onKeyDown = vi.fn()
    const onFocus = vi.fn()
    render(
      <A11yToolbar label="Formatting" onKeyDown={onKeyDown} onFocus={onFocus}><Buttons /></A11yToolbar>
    )
    const [bold, italic] = screen.getAllByRole('button')
    act(() => bold.focus())
    fireEvent.keyDown(bold, { key: 'ArrowRight' })
    expect(onFocus).toHaveBeenCalled()
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(italic).toHaveFocus()
  })

  it('picks up a control that appears after the first render', () => {
    const { rerender } = render(
      <A11yToolbar label="Formatting"><button type="button">Bold</button></A11yToolbar>
    )
    rerender(
      <A11yToolbar label="Formatting">
        <button type="button">Bold</button>
        <button type="button">Italic</button>
      </A11yToolbar>
    )
    // Arriving with the default tabindex would add a second stop.
    expect(screen.getByRole('button', { name: 'Italic' }).tabIndex).toBe(-1)
  })

  it('warns once when the toolbar has no accessible name, not once per render', () => {
    const { rerender } = render(<A11yToolbar><Buttons /></A11yToolbar>)
    rerender(<A11yToolbar><Buttons /></A11yToolbar>)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('abaabil/toolbar'))
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations', async () => {
    const { container } = render(<A11yToolbar label="Formatting"><Buttons /></A11yToolbar>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
