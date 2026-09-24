import { readFileSync } from 'node:fs'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import Dialog from '../src/dialog/index.jsx'
import A11yDialog from '../src/dialog/a11y.jsx'

const HERE = import.meta.url

describe('Dialog (normal tier)', () => {
  it('renders a native dialog element', () => {
    render(<Dialog data-testid="d">Body</Dialog>)
    const el = screen.getByTestId('d')
    expect(el.tagName).toBe('DIALOG')
    expect(el).toHaveClass('abaabil-dialog')
  })

  it('is closed until the consumer opens it', () => {
    render(<Dialog data-testid="d">Body</Dialog>)
    expect(screen.getByTestId('d').open).toBe(false)
  })

  it('lets the consumer drive it through a ref, with no hooks of its own', () => {
    let el = null
    render(<Dialog ref={(n) => { el = n }} data-testid="d">Body</Dialog>)
    el.showModal()
    expect(el.open).toBe(true)
    el.close()
    expect(el.open).toBe(false)
  })

  it('never sets tabindex on the dialog, which would break the focus model', () => {
    render(<Dialog data-testid="d">Body</Dialog>)
    expect(screen.getByTestId('d')).not.toHaveAttribute('tabindex')
  })

  it('adds no ARIA attributes at the normal tier', () => {
    render(<Dialog data-testid="d">Body</Dialog>)
    const attrs = [...screen.getByTestId('d').attributes].map((a) => a.name)
    expect(attrs.filter((a) => a.startsWith('aria-'))).toEqual([])
  })
})

describe('Dialog (a11y tier)', () => {
  it('opens modally when `open` becomes true', () => {
    const { rerender } = render(<A11yDialog label="Settings" data-testid="d">Body</A11yDialog>)
    expect(screen.getByTestId('d').open).toBe(false)
    rerender(<A11yDialog open label="Settings" data-testid="d">Body</A11yDialog>)
    expect(screen.getByTestId('d').open).toBe(true)
  })

  it('gives the dialog an accessible name via aria-labelledby', () => {
    render(<A11yDialog open label="Settings" data-testid="d">Body</A11yDialog>)
    const el = screen.getByTestId('d')
    const id = el.getAttribute('aria-labelledby')
    expect(id).toBeTruthy()
    const heading = document.getElementById(id)
    expect(heading).not.toBeNull()
    expect(heading).toHaveTextContent('Settings')
  })

  it('warns when no label is supplied, since a nameless dialog is unusable', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yDialog open data-testid="d">Body</A11yDialog>)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
    warn.mockRestore()
  })

  it('calls onClose when the dialog closes', async () => {
    const onClose = vi.fn()
    render(<A11yDialog open label="S" onClose={onClose} data-testid="d">Body</A11yDialog>)
    screen.getByTestId('d').close()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // The listener used to be bound in an effect keyed on onClose, so an
  // inline arrow rebound it on every render of the parent.
  it('does not rebind the close listener when onClose is a new function', () => {
    const { rerender } = render(<A11yDialog open label="S" onClose={() => {}} data-testid="d">Body</A11yDialog>)
    const el = screen.getByTestId('d')
    const add = vi.spyOn(el, 'addEventListener')
    const onClose = vi.fn()
    rerender(<A11yDialog open label="S" onClose={onClose} data-testid="d">Body</A11yDialog>)
    expect(add).not.toHaveBeenCalledWith('close', expect.anything())
    el.close()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // The padding and the gap under the title are the dialog's own box too,
  // so the event target alone cannot tell a backdrop click from one that
  // landed beside a button.
  it('light-dismisses on a click outside its box, not on one inside it', () => {
    render(<A11yDialog open label="S" data-testid="d">Body</A11yDialog>)
    const el = screen.getByTestId('d')
    el.getBoundingClientRect = () => ({ left: 100, top: 100, right: 300, bottom: 200 })
    fireEvent.mouseDown(el, { clientX: 150, clientY: 150 })
    expect(el.open).toBe(true)
    fireEvent.mouseDown(el, { clientX: 10, clientY: 10 })
    expect(el.open).toBe(false)
  })

  // Locking from CSS keys on :modal, the platform's own state, and keeps
  // the scrollbar gutter so the page does not jump sideways. Nothing on
  // body is touched.
  it('locks page scroll from the stylesheet, leaving body untouched', () => {
    render(<A11yDialog open label="S" data-testid="d">Body</A11yDialog>)
    expect(document.body.style.overflow).toBe('')
    const css = readFileSync(new URL('../src/dialog/dialog.css', HERE), 'utf8')
    expect(css).toMatch(/html:has\(\.abaabil-dialog:modal\)\s*\{[^}]*overflow:\s*hidden[^}]*scrollbar-gutter:\s*stable/)
  })

  it('transitions display and overlay out, so closing animates and reduced motion snaps', () => {
    const css = readFileSync(new URL('../src/dialog/dialog.css', HERE), 'utf8')
    expect(css).toMatch(/display var\(--duration-fast\) allow-discrete/)
    expect(css).toMatch(/overlay var\(--duration-fast\) allow-discrete/)
    expect(css).toMatch(/prefers-reduced-motion: reduce\)\s*\{\s*\.abaabil-dialog \{ transition: none; \}/)
  })

  it('never sets tabindex on the dialog element', () => {
    render(<A11yDialog open label="S" data-testid="d">Body</A11yDialog>)
    expect(screen.getByTestId('d')).not.toHaveAttribute('tabindex')
  })

  it('does not implement a focus trap: showModal handles containment natively', () => {
    const src = readFileSync(new URL('../src/dialog/a11y.jsx', HERE), 'utf8')
    expect(src).not.toMatch(/tabbable|focus-trap|focusTrap/i)
  })
})
