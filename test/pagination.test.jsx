import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'jest-axe'
import Pagination, { pageWindow, GAP } from '../src/pagination/index.jsx'
import A11yPagination from '../src/pagination/a11y.jsx'

const href = (p) => `?page=${p}`

describe('pageWindow', () => {
  it('shows every page when there are few enough to fit', () => {
    expect(pageWindow(1, 7, 1)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('collapses the far side to a gap', () => {
    expect(pageWindow(1, 20, 1)).toEqual([1, 2, GAP, 20])
  })

  it('collapses both sides when the current page is in the middle', () => {
    expect(pageWindow(10, 20, 1)).toEqual([1, GAP, 9, 10, 11, GAP, 20])
  })

  it('always keeps the first and last page reachable', () => {
    const w = pageWindow(10, 100, 2)
    expect(w[0]).toBe(1)
    expect(w[w.length - 1]).toBe(100)
  })

  it('never emits a gap standing in for a single page', () => {
    // A gap that replaces one number takes the same room and says less.
    for (let page = 1; page <= 12; page++) {
      const w = pageWindow(page, 12, 1)
      const numbers = w.filter((x) => x !== GAP)
      for (let i = 0; i < w.length - 1; i++) {
        if (w[i] === GAP) {
          const before = w[i - 1]
          const after = w[i + 1]
          expect(after - before, `page ${page}: gap hides only one number`).toBeGreaterThan(2)
        }
      }
      expect(new Set(numbers).size).toBe(numbers.length)
    }
  })
})

describe('Pagination (normal tier)', () => {
  it('renders a nav wrapping an ordered list', () => {
    const { container } = render(<Pagination page={2} pageCount={5} href={href} />)
    expect(container.querySelector('nav > ol')).toBeInTheDocument()
  })

  it('renders real links, so a page can be opened in a new tab', () => {
    render(<Pagination page={2} pageCount={5} href={href} />)
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute('href', '?page=3')
  })

  it('renders the current page as text rather than a link to itself', () => {
    render(<Pagination page={2} pageCount={5} href={href} />)
    expect(screen.queryByRole('link', { name: '2' })).toBeNull()
  })

  it('does not link Previous on the first page or Next on the last', () => {
    const { rerender } = render(<Pagination page={1} pageCount={5} href={href} />)
    expect(screen.queryByRole('link', { name: 'Previous' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Next' })).toBeInTheDocument()
    rerender(<Pagination page={5} pageCount={5} href={href} />)
    expect(screen.getByRole('link', { name: 'Previous' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Next' })).toBeNull()
  })

  it('draws the gap in CSS, so it never reaches the accessibility tree', () => {
    const { container } = render(<Pagination page={10} pageCount={20} href={href} />)
    const gaps = [...container.querySelectorAll('.abaabil-pagination__gap')]
    expect(gaps.length).toBeGreaterThan(0)
    for (const gap of gaps) {
      // Empty in the DOM: the glyph is a ::before, so there is no text
      // to announce and no aria-hidden needed to suppress it.
      expect(gap).toBeEmptyDOMElement()
      expect(gap).not.toHaveAttribute('aria-hidden')
    }
  })

  it('adds no ARIA beyond that at the normal tier', () => {
    const { container } = render(<Pagination page={2} pageCount={5} href={href} />)
    const aria = [...container.querySelectorAll('*')].flatMap((el) =>
      [...el.attributes].map((a) => a.name).filter((n) => n.startsWith('aria-'))
    )
    expect(aria).toEqual([])
    expect(container.querySelector('[role]')).toBeNull()
  })
})

describe('Pagination (a11y tier)', () => {
  it('names the nav', () => {
    render(<A11yPagination page={2} pageCount={5} href={href} />)
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
  })

  it('gives every number a real name, not a bare digit', () => {
    render(<A11yPagination page={2} pageCount={5} href={href} />)
    expect(screen.getByRole('link', { name: 'Page 3' })).toHaveAttribute('href', '?page=3')
  })

  it('marks the current page with aria-current', () => {
    const { container } = render(<A11yPagination page={2} pageCount={5} href={href} />)
    const current = container.querySelectorAll('[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveTextContent('2')
  })

  it('says where Previous and Next go', () => {
    render(<A11yPagination page={3} pageCount={9} href={href} />)
    expect(screen.getByRole('link', { name: 'Previous page, Page 2' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Next page, Page 4' })).toBeInTheDocument()
  })

  it('allows every label to be replaced, for translation', () => {
    render(
      <A11yPagination
        page={2}
        pageCount={5}
        href={href}
        label="Sahifalar"
        pageLabel={(n) => `Sahifa ${n}`}
        previousLabel="Oldingi"
        nextLabel="Keyingi"
      />
    )
    expect(screen.getByRole('navigation', { name: 'Sahifalar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sahifa 3' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Oldingi, Sahifa 1' })).toBeInTheDocument()
  })

  it('keeps dead ends out of the tab order entirely', () => {
    render(<A11yPagination page={1} pageCount={5} href={href} />)
    expect(screen.queryByRole('link', { name: /Previous/ })).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(<A11yPagination page={10} pageCount={20} href={href} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
