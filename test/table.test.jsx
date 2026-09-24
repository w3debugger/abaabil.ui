import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { axe } from 'jest-axe'
import Table from '../src/table/index.jsx'
import A11yTable from '../src/table/a11y.jsx'

afterEach(() => vi.restoreAllMocks())

const COLUMNS = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'price', header: 'Price', align: 'end', sortable: true },
]
const ROWS = [
  { id: 'b', name: 'Bread', price: 3 },
  { id: 'a', name: 'Apples', price: 5 },
  { id: 'c', name: 'Cheese', price: 4 },
]

const names = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((tr) => within(tr).getAllByRole('cell')[0].textContent)

describe('Table (normal tier)', () => {
  it('is a real table with a caption', () => {
    render(<Table caption="Groceries" columns={COLUMNS} rows={ROWS} />)
    expect(screen.getByRole('table', { name: 'Groceries' })).toBeInTheDocument()
  })

  it('renders one column header each, scoped to its column', () => {
    render(<Table caption="Groceries" columns={COLUMNS} rows={ROWS} />)
    const headers = screen.getAllByRole('columnheader')
    expect(headers.map((th) => th.textContent)).toEqual(['Name', 'Price'])
    for (const th of headers) expect(th).toHaveAttribute('scope', 'col')
  })

  it('renders one row per item', () => {
    render(<Table caption="Groceries" columns={COLUMNS} rows={ROWS} />)
    expect(names()).toEqual(['Bread', 'Apples', 'Cheese'])
  })

  it('lets a column render its own cell', () => {
    const cols = [{ key: 'name', header: 'Name', cell: (row) => <a href={`/${row.id}`}>{row.name}</a> }]
    render(<Table caption="Groceries" columns={cols} rows={ROWS} />)
    expect(screen.getByRole('link', { name: 'Apples' })).toHaveAttribute('href', '/a')
  })

  it('carries alignment as data, with no ARIA at this tier', () => {
    const { container } = render(<Table caption="Groceries" columns={COLUMNS} rows={ROWS} />)
    expect(screen.getByRole('columnheader', { name: 'Price' })).toHaveAttribute('data-align', 'end')
    expect(container.querySelector('[aria-sort], [aria-labelledby], [role]')).toBeNull()
    expect(container.firstChild).not.toHaveAttribute('tabindex')
  })
})

describe('Table (a11y tier)', () => {
  // A wide table in an overflow box scrolls with a wheel and not at all
  // from a keyboard unless the box is focusable and named.
  it('wraps the table in a focusable region named by the caption', async () => {
    render(<A11yTable caption="Groceries" columns={COLUMNS} rows={ROWS} />)
    const region = screen.getByRole('region', { name: 'Groceries' })
    await userEvent.tab()
    expect(region).toHaveFocus()
  })

  it('cycles a sortable header through none, ascending, descending', async () => {
    render(<A11yTable caption="Groceries" columns={COLUMNS} rows={ROWS} />)
    const th = screen.getByRole('columnheader', { name: 'Name' })
    const button = within(th).getByRole('button')
    expect(th).toHaveAttribute('aria-sort', 'none')

    await userEvent.click(button)
    expect(th).toHaveAttribute('aria-sort', 'ascending')
    expect(names()).toEqual(['Apples', 'Bread', 'Cheese'])

    await userEvent.click(button)
    expect(th).toHaveAttribute('aria-sort', 'descending')
    expect(names()).toEqual(['Cheese', 'Bread', 'Apples'])

    await userEvent.click(button)
    expect(th).toHaveAttribute('aria-sort', 'none')
    expect(names()).toEqual(['Bread', 'Apples', 'Cheese'])
  })

  it('sorts numbers numerically and clears the other column', async () => {
    render(<A11yTable caption="Groceries" columns={COLUMNS} rows={ROWS} />)
    await userEvent.click(screen.getByRole('button', { name: 'Name' }))
    await userEvent.click(screen.getByRole('button', { name: 'Price' }))
    expect(names()).toEqual(['Bread', 'Cheese', 'Apples'])
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'none')
  })

  it('reports each change through onSort', async () => {
    const onSort = vi.fn()
    render(<A11yTable caption="Groceries" columns={COLUMNS} rows={ROWS} onSort={onSort} />)
    await userEvent.click(screen.getByRole('button', { name: 'Price' }))
    expect(onSort).toHaveBeenCalledWith({ key: 'price', direction: 'ascending' })
  })

  it('leaves a non-sortable header as plain text', () => {
    render(<A11yTable caption="Groceries" columns={[{ key: 'name', header: 'Name' }]} rows={ROWS} />)
    const th = screen.getByRole('columnheader', { name: 'Name' })
    expect(th).not.toHaveAttribute('aria-sort')
    expect(within(th).queryByRole('button')).toBeNull()
  })

  it('warns when it has no name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yTable columns={COLUMNS} rows={ROWS} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('does not warn with an aria-label instead of a caption', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yTable aria-label="Groceries" columns={COLUMNS} rows={ROWS} />)
    expect(warn).not.toHaveBeenCalled()
    expect(screen.getByRole('region', { name: 'Groceries' })).toBeInTheDocument()
  })

  it('has no axe violations with a sorted column', async () => {
    const { container } = render(<A11yTable caption="Groceries" columns={COLUMNS} rows={ROWS} />)
    await userEvent.click(screen.getByRole('button', { name: 'Name' }))
    expect(await axe(container)).toHaveNoViolations()
  })
})
