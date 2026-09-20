import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Dialog from '../src/dialog/index.jsx'

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
