import { readFileSync } from 'node:fs'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import AlertDialog from '../src/alert-dialog/index.jsx'
import A11yAlertDialog from '../src/alert-dialog/a11y.jsx'

afterEach(() => vi.restoreAllMocks())

const HERE = import.meta.url

describe('AlertDialog (normal tier)', () => {
  // The role is the component. It makes a screen reader announce the
  // description immediately rather than waiting to be navigated to.
  it('carries role="alertdialog" even at the normal tier', () => {
    render(<AlertDialog data-testid="d">Body</AlertDialog>)
    const el = screen.getByTestId('d')
    expect(el.tagName).toBe('DIALOG')
    expect(el).toHaveAttribute('role', 'alertdialog')
  })

  it('lets the consumer drive it through a ref, with no hooks of its own', () => {
    let el = null
    render(<AlertDialog ref={(n) => { el = n }} data-testid="d">Body</AlertDialog>)
    el.showModal()
    expect(el.open).toBe(true)
  })
})

describe('AlertDialog (a11y tier)', () => {
  const open = (extra = {}) =>
    render(
      <A11yAlertDialog
        open
        label="Delete this project?"
        description="Everything in it is removed permanently."
        data-testid="d"
        {...extra}
      >
        <button type="button" data-safe-action>Cancel</button>
        <button type="button">Delete</button>
      </A11yAlertDialog>
    )

  it('is named and described, which the role requires to be useful', () => {
    open()
    const el = screen.getByTestId('d')
    expect(document.getElementById(el.getAttribute('aria-labelledby'))).toHaveTextContent(
      'Delete this project?'
    )
    expect(document.getElementById(el.getAttribute('aria-describedby'))).toHaveTextContent(
      'removed permanently'
    )
  })

  it('warns without a description, because the role announces one on open', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yAlertDialog open label="Sure?">body</A11yAlertDialog>)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('description'))
  })

  it('warns without a label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yAlertDialog open description="Gone for good.">body</A11yAlertDialog>)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  // The whole point of the pattern: "delete everything?" must not be
  // dismissible by clicking slightly to the left of it.
  it('does not light-dismiss on a backdrop click', async () => {
    open()
    const el = screen.getByTestId('d')
    await userEvent.click(el)
    expect(el.open).toBe(true)
  })

  // The browser focuses the first focusable child, which in a
  // confirmation is one Enter away from the destructive action.
  it('focuses the safe action rather than whatever came first', () => {
    open()
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
  })

  it('calls onClose when the platform closes it', () => {
    const onClose = vi.fn()
    open({ onClose })
    screen.getByTestId('d').close()
    expect(onClose).toHaveBeenCalled()
  })

  // The listener used to be bound in an effect keyed on onClose, so an
  // inline arrow rebound it on every render of the parent.
  it('does not rebind the close listener when onClose is a new function', () => {
    const { rerender } = render(
      <A11yAlertDialog open label="Sure?" description="Gone." onClose={() => {}} data-testid="d">body</A11yAlertDialog>
    )
    const el = screen.getByTestId('d')
    const add = vi.spyOn(el, 'addEventListener')
    const onClose = vi.fn()
    rerender(
      <A11yAlertDialog open label="Sure?" description="Gone." onClose={onClose} data-testid="d">body</A11yAlertDialog>
    )
    expect(add).not.toHaveBeenCalledWith('close', expect.anything())
    el.close()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // Dialog and drawer lock page scroll; this one did not, so wheel and
  // trackpad scrolled the inert page behind "Delete this project?".
  it('locks page scroll from the stylesheet, as dialog and drawer do', () => {
    const css = readFileSync(new URL('../src/alert-dialog/alert-dialog.css', HERE), 'utf8')
    expect(css).toMatch(/html:has\(\.abaabil-alert-dialog:modal\)\s*\{[^}]*overflow:\s*hidden[^}]*scrollbar-gutter:\s*stable/)
  })

  it('transitions display and overlay out, so closing animates and reduced motion snaps', () => {
    const css = readFileSync(new URL('../src/alert-dialog/alert-dialog.css', HERE), 'utf8')
    expect(css).toMatch(/display var\(--duration-fast\) allow-discrete/)
    expect(css).toMatch(/overlay var\(--duration-fast\) allow-discrete/)
    expect(css).toMatch(/prefers-reduced-motion: reduce\)\s*\{\s*\.abaabil-alert-dialog \{ transition: none; \}/)
  })

  it('opens and closes from the open prop', () => {
    const { rerender } = render(
      <A11yAlertDialog label="Sure?" description="Gone." data-testid="d">body</A11yAlertDialog>
    )
    expect(screen.getByTestId('d').open).toBe(false)
    rerender(
      <A11yAlertDialog open label="Sure?" description="Gone." data-testid="d">body</A11yAlertDialog>
    )
    expect(screen.getByTestId('d').open).toBe(true)
  })
})
