import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import Drawer from '../src/drawer/index.jsx'
import A11yDrawer from '../src/drawer/a11y.jsx'

afterEach(() => vi.restoreAllMocks())

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

  it('locks page scroll while open and restores it after', () => {
    const { rerender } = render(<A11yDrawer open label="Filters">Body</A11yDrawer>)
    expect(document.body.style.overflow).toBe('hidden')
    rerender(<A11yDrawer label="Filters">Body</A11yDrawer>)
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('does not implement a focus trap, because showModal already contains focus', () => {
    render(<A11yDrawer open label="Filters" data-testid="d">Body</A11yDrawer>)
    const el = screen.getByTestId('d')
    expect(el).not.toHaveAttribute('tabindex')
    expect(el.querySelectorAll('[data-focus-guard]')).toHaveLength(0)
  })
})
