import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Separator from '../src/separator/index.jsx'
import A11ySeparator from '../src/separator/a11y.jsx'

describe('Separator (normal tier)', () => {
  it('renders an <hr>, which carries role="separator" for free', () => {
    render(<Separator data-testid="s" />)
    const el = screen.getByTestId('s')
    expect(el.tagName).toBe('HR')
    expect(el).toHaveClass('abaabil-separator')
    expect(el).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('carries the orientation it is given as data', () => {
    render(<Separator orientation="vertical" data-testid="s" />)
    expect(screen.getByTestId('s')).toHaveAttribute('data-orientation', 'vertical')
  })

  it('adds no ARIA at the normal tier', () => {
    render(<Separator orientation="vertical" data-testid="s" />)
    const el = screen.getByTestId('s')
    expect([...el.attributes].map((a) => a.name).filter((a) => a.startsWith('aria-'))).toEqual([])
  })
})

describe('Separator (a11y tier)', () => {
  // The bug this component exists for: <hr> has an implicit
  // aria-orientation of horizontal, and rotating it with CSS does not
  // change that, so a vertical rule is announced as a horizontal one.
  it('declares vertical orientation, which CSS rotation cannot do', () => {
    render(<A11ySeparator orientation="vertical" data-testid="s" />)
    expect(screen.getByTestId('s')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('leaves a horizontal rule alone, because the implicit value is already right', () => {
    render(<A11ySeparator data-testid="s" />)
    expect(screen.getByTestId('s')).not.toHaveAttribute('aria-orientation')
  })

  it('removes a decorative rule from the accessibility tree entirely', () => {
    render(<A11ySeparator decorative data-testid="s" />)
    expect(screen.getByTestId('s')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('separator')).toBeNull()
  })

  it('does not hide a rule that was not asked to be decorative', () => {
    render(<A11ySeparator data-testid="s" />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('does not set orientation on a decorative rule, which is not in the tree to orient', () => {
    render(<A11ySeparator orientation="vertical" decorative data-testid="s" />)
    const el = screen.getByTestId('s')
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el).not.toHaveAttribute('aria-orientation')
  })
})
