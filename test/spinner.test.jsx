import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Spinner from '../src/spinner/index.jsx'
import A11ySpinner from '../src/spinner/a11y.jsx'

describe('Spinner (normal tier)', () => {
  it('renders one empty element with the size as data', () => {
    render(<Spinner data-testid="s" />)
    const el = screen.getByTestId('s')
    expect(el.tagName).toBe('SPAN')
    expect(el).toHaveClass('abaabil-spinner')
    expect(el).toHaveAttribute('data-size', 'md')
    expect(el).toBeEmptyDOMElement()
  })

  it('adds no role and no label at the normal tier', () => {
    render(<Spinner data-testid="s" />)
    const el = screen.getByTestId('s')
    expect(el).not.toHaveAttribute('role')
    expect(el).not.toHaveAttribute('aria-label')
  })
})

describe('Spinner (a11y tier)', () => {
  it('announces through role="status", which is a polite live region', () => {
    render(<A11ySpinner />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading')
  })

  it('takes a label for what is loading', () => {
    render(<A11ySpinner label="Loading results" />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading results')
  })

  // A <span> is generic, and aria-label on a generic element is
  // prohibited and discarded. Hidden text is the only way that works,
  // and it is how badge solves the same problem.
  it('names itself with hidden text, not aria-label on a generic element', () => {
    const { container } = render(<A11ySpinner label="Loading results" />)
    const ring = container.querySelector('.abaabil-spinner')
    expect(ring).not.toHaveAttribute('aria-label')
    expect(container.querySelector('.abaabil-visually-hidden')).toHaveTextContent('Loading results')
  })

  it('says nothing at all when decorative, for a spinner beside its own caption', () => {
    const { container } = render(<A11ySpinner decorative />)
    expect(screen.queryByRole('status')).toBeNull()
    expect(container.querySelector('.abaabil-spinner')).toHaveAttribute('aria-hidden', 'true')
  })
})
