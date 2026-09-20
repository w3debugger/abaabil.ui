import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Button from '../src/button/index.jsx'

describe('Button (normal tier)', () => {
  it('renders a button element with the base class', () => {
    render(<Button>Save</Button>)
    const btn = screen.getByRole('button', { name: 'Save' })
    expect(btn.tagName).toBe('BUTTON')
    expect(btn).toHaveClass('abaabil-button')
  })

  it('defaults type to "button" so it never submits a form by accident', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('allows type to be overridden for real submit buttons', () => {
    render(<Button type="submit">Send</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('merges a consumer className instead of replacing the base class', () => {
    render(<Button className="mine">Save</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('abaabil-button')
    expect(btn).toHaveClass('mine')
  })

  it('renders as another element via `as` and omits type there', () => {
    render(<Button as="a" href="/x">Link</Button>)
    const link = screen.getByRole('link', { name: 'Link' })
    expect(link.tagName).toBe('A')
    expect(link).not.toHaveAttribute('type')
  })

  it('forwards arbitrary props including ref (React 19, no forwardRef)', () => {
    let captured = null
    render(<Button ref={(el) => { captured = el }} data-testid="b">Save</Button>)
    expect(captured).not.toBeNull()
    expect(captured.dataset.testid).toBe('b')
  })

  it('adds no ARIA attributes at the normal tier', () => {
    render(<Button>Save</Button>)
    const attrs = [...screen.getByRole('button').attributes].map((a) => a.name)
    expect(attrs.filter((a) => a.startsWith('aria-'))).toEqual([])
  })
})

describe('Button (styled tier)', () => {
  it('re-exports the same component contract', async () => {
    const { default: Styled } = await import('../src/button/styled.jsx')
    render(<Styled>Save</Styled>)
    const btn = screen.getByRole('button', { name: 'Save' })
    expect(btn).toHaveClass('abaabil-button')
    expect(btn).toHaveAttribute('type', 'button')
  })
})
