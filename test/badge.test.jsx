import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'jest-axe'
import Badge from '../src/badge/index.jsx'
import A11yBadge from '../src/badge/a11y.jsx'

describe('Badge (normal tier)', () => {
  it('renders a span carrying the variant as data', () => {
    render(<Badge data-testid="b">Beta</Badge>)
    const el = screen.getByTestId('b')
    expect(el.tagName).toBe('SPAN')
    expect(el).toHaveClass('abaabil-badge')
    expect(el).toHaveAttribute('data-variant', 'neutral')
  })

  it('carries the variant it is given', () => {
    render(<Badge variant="danger" data-testid="b">3</Badge>)
    expect(screen.getByTestId('b')).toHaveAttribute('data-variant', 'danger')
  })

  it('adds no ARIA attributes and no role at the normal tier', () => {
    render(<Badge data-testid="b">3</Badge>)
    const el = screen.getByTestId('b')
    expect([...el.attributes].map((a) => a.name).filter((a) => a.startsWith('aria-'))).toEqual([])
    expect(el).not.toHaveAttribute('role')
  })
})

describe('Badge (a11y tier)', () => {
  it('reads as the full sentence while drawing only the shorthand', () => {
    render(<A11yBadge context="unread messages" data-testid="b">3</A11yBadge>)
    const el = screen.getByTestId('b')
    // Everything a screen reader would get, hidden text included.
    expect(el.textContent.replace(/\s+/g, ' ').trim()).toBe('3 unread messages')
  })

  it('draws only the shorthand: the context is visually hidden', () => {
    const { container } = render(<A11yBadge context="unread messages">3</A11yBadge>)
    const hidden = container.querySelector('.abaabil-visually-hidden')
    expect(hidden).toHaveTextContent('unread messages')
    expect(container.querySelector('.abaabil-badge').firstChild.textContent).toBe('3')
  })

  it('uses hidden text rather than aria-label, which a span discards', () => {
    // A <span> has no role, and aria-label is prohibited on a generic
    // element: it would be dropped, leaving the badge unlabelled while
    // looking fixed. That shipped once in this library's popover.
    render(<A11yBadge context="unread messages" data-testid="b">3</A11yBadge>)
    expect(screen.getByTestId('b')).not.toHaveAttribute('aria-label')
  })

  it('renders nothing extra when there is no context to add', () => {
    const { container } = render(<A11yBadge>Beta</A11yBadge>)
    expect(container.querySelector('.abaabil-visually-hidden')).toBeNull()
    expect(container.querySelector('.abaabil-badge')).toHaveTextContent('Beta')
  })

  it('is not a live region: a changing count should not interrupt', () => {
    render(<A11yBadge context="unread messages" data-testid="b">3</A11yBadge>)
    const el = screen.getByTestId('b')
    expect(el).not.toHaveAttribute('role')
    expect(el).not.toHaveAttribute('aria-live')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <A11yBadge variant="danger" context="unread messages">3</A11yBadge>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
