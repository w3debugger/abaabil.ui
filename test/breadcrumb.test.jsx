import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'jest-axe'
import Breadcrumb from '../src/breadcrumb/index.jsx'
import A11yBreadcrumb from '../src/breadcrumb/a11y.jsx'

const TRAIL = [
  { label: 'Home', href: '/' },
  { label: 'Components', href: '/components' },
  { label: 'Breadcrumb' },
]

describe('Breadcrumb (normal tier)', () => {
  it('renders a nav wrapping an ordered list, because the order is the information', () => {
    const { container } = render(<Breadcrumb items={TRAIL} />)
    expect(container.querySelector('nav > ol')).toBeInTheDocument()
    expect(container.querySelectorAll('li')).toHaveLength(3)
  })

  it('renders items with href as links and items without as text', () => {
    render(<Breadcrumb items={TRAIL} />)
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Breadcrumb' })).toBeNull()
  })

  it('renders no separator text, so a screen reader never reads punctuation', () => {
    const { container } = render(<Breadcrumb items={TRAIL} />)
    expect(container.textContent).toBe('HomeComponentsBreadcrumb')
  })

  it('adds no ARIA attributes at the normal tier', () => {
    const { container } = render(<Breadcrumb items={TRAIL} />)
    const aria = [...container.querySelectorAll('*')].flatMap((el) =>
      [...el.attributes].map((a) => a.name).filter((n) => n.startsWith('aria-'))
    )
    expect(aria).toEqual([])
  })
})

describe('Breadcrumb (a11y tier)', () => {
  it('names the nav, so it is distinguishable from other navigation landmarks', () => {
    render(<A11yBreadcrumb items={TRAIL} />)
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
  })

  it('allows the name to be overridden', () => {
    render(<A11yBreadcrumb items={TRAIL} label="You are here" />)
    expect(screen.getByRole('navigation', { name: 'You are here' })).toBeInTheDocument()
  })

  it('marks the last item aria-current="page"', () => {
    const { container } = render(<A11yBreadcrumb items={TRAIL} />)
    const current = container.querySelectorAll('[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveTextContent('Breadcrumb')
  })

  it('renders the last item as text even when it has an href', () => {
    const withHref = [...TRAIL.slice(0, 2), { label: 'Breadcrumb', href: '/components/breadcrumb' }]
    render(<A11yBreadcrumb items={withHref} />)
    expect(screen.queryByRole('link', { name: 'Breadcrumb' })).toBeNull()
  })

  it('keeps the last item a link when linkCurrent is set, still marked current', () => {
    const withHref = [...TRAIL.slice(0, 2), { label: 'Breadcrumb', href: '/components/breadcrumb' }]
    render(<A11yBreadcrumb items={withHref} linkCurrent />)
    const link = screen.getByRole('link', { name: 'Breadcrumb' })
    expect(link).toHaveAttribute('aria-current', 'page')
  })

  it('has no axe violations', async () => {
    const { container } = render(<A11yBreadcrumb items={TRAIL} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
