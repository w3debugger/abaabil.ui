import { readFileSync } from 'node:fs'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import Drawer from '../src/drawer/index.jsx'
import A11yDrawer from '../src/drawer/a11y.jsx'

afterEach(() => vi.restoreAllMocks())

const HERE = import.meta.url

describe('Drawer (normal tier)', () => {
  // A <dialog>, not a fixed div: the top layer, focus containment, the
  // inert background and Escape are what showModal() already does.
  it('renders a native dialog carrying the side as data', () => {
    render(<Drawer data-testid="d">Body</Drawer>)
    const el = screen.getByTestId('d')
    expect(el.tagName).toBe('DIALOG')
    expect(el).toHaveAttribute('data-side', 'end')
  })

  it('takes the side it is given', () => {
    render(<Drawer side="start" data-testid="d">Body</Drawer>)
    expect(screen.getByTestId('d')).toHaveAttribute('data-side', 'start')
  })

  it('lets the consumer drive it through a ref, with no hooks of its own', () => {
    let el = null
    render(<Drawer ref={(n) => { el = n }} data-testid="d">Body</Drawer>)
    el.showModal()
    expect(el.open).toBe(true)
    el.close()
    expect(el.open).toBe(false)
  })
})

describe('Drawer (a11y tier)', () => {
  it('opens and closes from the open prop', () => {
    const { rerender } = render(<A11yDrawer label="Filters" data-testid="d">Body</A11yDrawer>)
    expect(screen.getByTestId('d').open).toBe(false)
    rerender(<A11yDrawer open label="Filters" data-testid="d">Body</A11yDrawer>)
    expect(screen.getByTestId('d').open).toBe(true)
  })

  it('names itself from its own heading', () => {
    render(<A11yDrawer open label="Filters" data-testid="d">Body</A11yDrawer>)
    const el = screen.getByTestId('d')
    const id = el.getAttribute('aria-labelledby')
    expect(document.getElementById(id)).toHaveTextContent('Filters')
  })

  it('warns when it would be announced as an unnamed dialog', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yDrawer open>Body</A11yDrawer>)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('does not warn when named through aria-label instead', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yDrawer open aria-label="Filters">Body</A11yDrawer>)
    expect(warn).not.toHaveBeenCalled()
  })

  it('calls onClose when the platform closes it', () => {
    const onClose = vi.fn()
    render(<A11yDrawer open label="Filters" onClose={onClose} data-testid="d">Body</A11yDrawer>)
    screen.getByTestId('d').close()
    expect(onClose).toHaveBeenCalled()
  })

  // Both were bugs waiting to happen: a consumer ref or handler that
  // silently replaced the component's own.
  it('composes a consumer ref rather than replacing its own', () => {
    let seen = null
    const { rerender } = render(
      <A11yDrawer label="Filters" ref={(n) => { seen = n }} data-testid="d">Body</A11yDrawer>
    )
    expect(seen).toBe(screen.getByTestId('d'))
    rerender(<A11yDrawer open label="Filters" ref={(n) => { seen = n }} data-testid="d">Body</A11yDrawer>)
    expect(screen.getByTestId('d').open).toBe(true)
  })

  // The listener used to be bound in an effect keyed on onClose, so an
  // inline arrow rebound it on every render of the parent.
  it('does not rebind the close listener when onClose is a new function', () => {
    const { rerender } = render(<A11yDrawer open label="Filters" onClose={() => {}} data-testid="d">Body</A11yDrawer>)
    const el = screen.getByTestId('d')
    const add = vi.spyOn(el, 'addEventListener')
    const onClose = vi.fn()
    rerender(<A11yDrawer open label="Filters" onClose={onClose} data-testid="d">Body</A11yDrawer>)
    expect(add).not.toHaveBeenCalledWith('close', expect.anything())
    el.close()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // The drawer scrolls, and a mousedown on its own scrollbar targets the
  // dialog element itself, so the target alone cannot tell a backdrop
  // click from a scrollbar drag or a click in the padding.
  it('light-dismisses on a click outside its box, not on one inside it', () => {
    render(<A11yDrawer open label="Filters" data-testid="d">Body</A11yDrawer>)
    const el = screen.getByTestId('d')
    el.getBoundingClientRect = () => ({ left: 100, top: 0, right: 400, bottom: 800 })
    fireEvent.mouseDown(el, { clientX: 395, clientY: 400 })
    expect(el.open).toBe(true)
    fireEvent.mouseDown(el, { clientX: 10, clientY: 400 })
    expect(el.open).toBe(false)
  })

  // Locking from CSS keys on :modal, the platform's own state, and keeps
  // the scrollbar gutter so the page does not jump sideways. Nothing on
  // body is touched.
  it('locks page scroll from the stylesheet, leaving body untouched', () => {
    render(<A11yDrawer open label="Filters">Body</A11yDrawer>)
    expect(document.body.style.overflow).toBe('')
    const css = readFileSync(new URL('../src/drawer/drawer.css', HERE), 'utf8')
    expect(css).toMatch(/html:has\(\.abaabil-drawer:modal\)\s*\{[^}]*overflow:\s*hidden[^}]*scrollbar-gutter:\s*stable/)
  })

  it('transitions display and overlay out, so closing slides and reduced motion snaps', () => {
    const css = readFileSync(new URL('../src/drawer/drawer.css', HERE), 'utf8')
    expect(css).toMatch(/display var\(--duration-fast\) allow-discrete/)
    expect(css).toMatch(/overlay var\(--duration-fast\) allow-discrete/)
    expect(css).toMatch(/prefers-reduced-motion: reduce\)\s*\{\s*\.abaabil-drawer \{ transition: none; \}/)
  })

  it('does not implement a focus trap, because showModal already contains focus', () => {
    render(<A11yDrawer open label="Filters" data-testid="d">Body</A11yDrawer>)
    const el = screen.getByTestId('d')
    expect(el).not.toHaveAttribute('tabindex')
    expect(el.querySelectorAll('[data-focus-guard]')).toHaveLength(0)
  })
})
