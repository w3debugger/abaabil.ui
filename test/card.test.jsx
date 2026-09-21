import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import Card from '../src/card/index.jsx'
import A11yCard from '../src/card/a11y.jsx'

afterEach(() => vi.restoreAllMocks())

describe('Card (normal tier)', () => {
  it('renders only the body when given neither band', () => {
    const { container } = render(<Card>Content</Card>)
    expect(container.querySelector('.abaabil-card__body')).toHaveTextContent('Content')
    expect(container.querySelector('.abaabil-card__header')).toBeNull()
    expect(container.querySelector('.abaabil-card__footer')).toBeNull()
  })

  it('renders the bands it is given', () => {
    const { container } = render(<Card header="Top" footer="Bottom">Middle</Card>)
    expect(container.querySelector('.abaabil-card__header')).toHaveTextContent('Top')
    expect(container.querySelector('.abaabil-card__footer')).toHaveTextContent('Bottom')
  })

  it('adds no role at the normal tier', () => {
    render(<Card data-testid="c">Content</Card>)
    expect(screen.getByTestId('c')).not.toHaveAttribute('role')
  })
})

describe('Card (a11y tier)', () => {
  // A page of twelve cards announced as twelve named regions is twelve
  // extra stops on the way to the content, so the landmark is opt-in.
  it('stays a plain div with no heading', () => {
    render(<A11yCard data-testid="c">Content</A11yCard>)
    const el = screen.getByTestId('c')
    expect(el).not.toHaveAttribute('role')
    expect(el).not.toHaveAttribute('aria-labelledby')
  })

  it('becomes a region named by its heading', () => {
    render(<A11yCard heading="Billing" headingLevel={2}>Content</A11yCard>)
    expect(screen.getByRole('region', { name: 'Billing' })).toBeInTheDocument()
  })

  it('renders the heading at the level it was told, not one it guessed', () => {
    render(<A11yCard heading="Billing" headingLevel={4}>Content</A11yCard>)
    expect(screen.getByRole('heading', { level: 4, name: 'Billing' })).toBeInTheDocument()
  })

  // A page of h3s under no h2 is a broken outline that looks fine, so
  // the component refuses to pick a level rather than guessing one.
  it('warns rather than guessing a level, and renders no heading element', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yCard heading="Billing">Content</A11yCard>)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('headingLevel'))
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('keeps extra header content after the heading', () => {
    render(
      <A11yCard heading="Billing" headingLevel={2} header={<span>Past due</span>}>
        Content
      </A11yCard>
    )
    const header = screen.getByRole('region', { name: 'Billing' }).firstChild
    expect(header).toHaveTextContent('Billing')
    expect(header).toHaveTextContent('Past due')
  })
})
