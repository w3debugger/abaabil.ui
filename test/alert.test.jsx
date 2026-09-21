import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'jest-axe'
import Alert from '../src/alert/index.jsx'
import A11yAlert from '../src/alert/a11y.jsx'

describe('Alert (normal tier)', () => {
  it('renders a container with the base class and the variant as data', () => {
    render(<Alert data-testid="a">Saved</Alert>)
    const el = screen.getByTestId('a')
    expect(el).toHaveClass('abaabil-alert')
    expect(el).toHaveAttribute('data-variant', 'info')
  })

  it('carries the variant it is given', () => {
    render(<Alert variant="danger" data-testid="a">Failed</Alert>)
    expect(screen.getByTestId('a')).toHaveAttribute('data-variant', 'danger')
  })

  it('adds no ARIA attributes and no role at the normal tier', () => {
    render(<Alert data-testid="a">Saved</Alert>)
    const el = screen.getByTestId('a')
    expect([...el.attributes].map((a) => a.name).filter((a) => a.startsWith('aria-'))).toEqual([])
    expect(el).not.toHaveAttribute('role')
  })

  it('merges a consumer className instead of replacing the base class', () => {
    render(<Alert className="mine" data-testid="a">Saved</Alert>)
    expect(screen.getByTestId('a')).toHaveClass('abaabil-alert')
    expect(screen.getByTestId('a')).toHaveClass('mine')
  })
})

describe('Alert (a11y tier)', () => {
  it('announces info and success politely, via role="status"', () => {
    render(<A11yAlert variant="success">Saved</A11yAlert>)
    const el = screen.getByRole('status')
    expect(el).toHaveTextContent('Saved')
    // role="status" already implies polite, so spelling out aria-live
    // would only create a second source of truth.
    expect(el).not.toHaveAttribute('aria-live')
  })

  it('announces warning and danger immediately, via role="alert"', () => {
    render(<A11yAlert variant="danger">Could not save</A11yAlert>)
    const el = screen.getByRole('alert')
    expect(el).toHaveTextContent('Could not save')
    expect(el).not.toHaveAttribute('aria-live')
  })

  it('defaults to the polite variant', () => {
    render(<A11yAlert>Heads up</A11yAlert>)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('spells out aria-live only when the consumer overrides the implied politeness', () => {
    render(<A11yAlert variant="danger" live="polite">Could not save</A11yAlert>)
    const el = screen.getByRole('alert')
    expect(el).toHaveAttribute('aria-live', 'polite')
  })

  it('drops the role entirely when live is off', () => {
    render(<A11yAlert variant="danger" live="off" data-testid="a">Quiet</A11yAlert>)
    const el = screen.getByTestId('a')
    expect(el).not.toHaveAttribute('role')
    expect(el).toHaveAttribute('aria-live', 'off')
  })

  it('renders the title as text, not as a heading that would pollute the outline', () => {
    render(<A11yAlert variant="warning" title="Careful">Check the dates</A11yAlert>)
    const title = screen.getByText('Careful')
    expect(title.tagName).toBe('STRONG')
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('renders an empty live region, so it can exist before it has anything to say', () => {
    const { container } = render(<A11yAlert variant="success" />)
    const el = container.querySelector('.abaabil-alert')
    expect(el).toBeInTheDocument()
    expect(el).toHaveAttribute('role', 'status')
    expect(el).toBeEmptyDOMElement()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <A11yAlert variant="danger" title="Could not save">Check your connection.</A11yAlert>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
