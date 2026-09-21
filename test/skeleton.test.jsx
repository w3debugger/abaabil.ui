import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Skeleton from '../src/skeleton/index.jsx'
import A11ySkeleton from '../src/skeleton/a11y.jsx'

describe('Skeleton (normal tier)', () => {
  it('renders one bar with the shape as data', () => {
    render(<Skeleton data-testid="s" />)
    const el = screen.getByTestId('s')
    expect(el).toHaveClass('abaabil-skeleton')
    expect(el).toHaveAttribute('data-shape', 'text')
  })

  it('draws one bar per line when asked for several', () => {
    const { container } = render(<Skeleton lines={3} />)
    expect(container.querySelectorAll('.abaabil-skeleton')).toHaveLength(3)
  })

  it('passes width and height through as custom properties, not fixed variants', () => {
    render(<Skeleton shape="rect" width="12rem" height="4rem" data-testid="s" />)
    const el = screen.getByTestId('s')
    expect(el.style.getPropertyValue('--skeleton-width')).toBe('12rem')
    expect(el.style.getPropertyValue('--skeleton-height')).toBe('4rem')
  })

  it('adds no ARIA at the normal tier', () => {
    render(<Skeleton data-testid="s" />)
    expect(screen.getByTestId('s')).not.toHaveAttribute('aria-hidden')
  })
})

describe('Skeleton (a11y tier)', () => {
  // Grey bars are a picture of a layout. Read aloud they are noise, so
  // hiding them is not an option the consumer gets to turn off.
  it('always hides the bars from assistive technology', () => {
    const { container } = render(<A11ySkeleton />)
    expect(container.querySelector('.abaabil-skeleton')).toHaveAttribute('aria-hidden', 'true')
  })

  it('hides every bar of a multi-line block, not only the first', () => {
    const { container } = render(<A11ySkeleton lines={4} label="Loading" />)
    const group = container.querySelector('.abaabil-skeleton-lines')
    expect(group).toHaveAttribute('aria-hidden', 'true')
  })

  it('announces once for the region when given a label', () => {
    render(<A11ySkeleton lines={3} label="Loading messages" />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading messages')
  })

  it('announces nothing without a label, so ten skeletons are not ten announcements', () => {
    render(<A11ySkeleton />)
    expect(screen.queryByRole('status')).toBeNull()
  })

  // aria-busy belongs on the container whose content is loading, not on
  // the placeholder inside it.
  it('does not set aria-busy on itself', () => {
    const { container } = render(<A11ySkeleton label="Loading" />)
    expect(container.querySelector('[aria-busy]')).toBeNull()
  })
})
