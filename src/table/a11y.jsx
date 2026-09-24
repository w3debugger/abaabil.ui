'use client'

import { useId, useState } from 'react'
import './table.css'
import Table from './styled.jsx'

/**
 * Table, a11y tier. Two additions.
 *
 * The scroll wrapper becomes a keyboard stop. A wide table sits in an
 * overflow-x: auto box, and a box that scrolls with a mouse wheel but
 * cannot be focused is unreachable from a keyboard: the columns off
 * the right edge simply do not exist. So the wrapper gets tabIndex=0,
 * role="region" and aria-labelledby pointing at the caption, which is
 * the WAI recommended pattern. Focusing it announces the table's name
 * and the arrow keys scroll it. useId connects the two, which is why
 * this tier carries 'use client' and the other two do not.
 *
 * Sortable columns. A column with `sortable: true` draws its header
 * inside a real <button>, and the <th> carries aria-sort so a screen
 * reader announces "Price, sorted ascending" rather than a button that
 * appears to do nothing. The arrow is drawn in CSS from that same
 * attribute, so the state has one source and is never read out twice.
 * Sorting is uncontrolled, as combobox and tabs are: the component
 * owns `{ key, direction }`, cycles none, ascending, descending, and
 * reports each change through `onSort`. The default comparator uses
 * localeCompare for strings and subtraction for everything else; a
 * column may pass `compare(a, b)` to replace it.
 *
 * @param {object} props
 * @param {Array<{ key: string, header: import('react').ReactNode, align?: 'start'|'end'|'center', width?: string|number, cell?: (row: object) => import('react').ReactNode, sortable?: boolean, compare?: (a: any, b: any) => number }>} props.columns
 * @param {object[]} props.rows
 * @param {import('react').ReactNode} [props.caption] Names the table and
 *   the scroll region. Without it pass `aria-label`.
 * @param {(sort: { key: string|null, direction: 'none'|'ascending'|'descending' }) => void} [props.onSort]
 * @param {boolean} [props.stickyHeader=false] Header row stays put while
 *   the wrapper scrolls. Give the wrapper a max-block-size for it to matter.
 * @param {string|((row: object, index: number) => React.Key)} [props.rowKey='id']
 * @param {string} [props.className]
 */
export default function Table_a11y({
  columns,
  rows,
  caption,
  onSort,
  stickyHeader = false,
  className,
  ...props
}) {
  const captionId = useId()
  const [sort, setSort] = useState({ key: null, direction: 'none' })
  const named = Boolean(caption || props['aria-label'] || props['aria-labelledby'])

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !named) {
    console.warn(
      'abaabil/table: no `caption` given, so the table and its scroll region ' +
        'have no accessible name. Pass `caption`, or `aria-label`.'
    )
  }

  const cycle = (key) => {
    const direction =
      sort.key !== key || sort.direction === 'none'
        ? 'ascending'
        : sort.direction === 'ascending'
          ? 'descending'
          : 'none'
    const next = { key: direction === 'none' ? null : key, direction }
    setSort(next)
    onSort?.(next)
  }

  const active = columns.find((c) => c.key === sort.key)
  const sorted = active
    ? [...rows].sort((a, b) => {
        const r = (active.compare ?? compare)(a[active.key], b[active.key])
        return sort.direction === 'ascending' ? r : -r
      })
    : rows

  const cols = columns.map((c) =>
    c.sortable
      ? {
          ...c,
          header: (
            <button type="button" className="abaabil-table__sort" onClick={() => cycle(c.key)}>
              {c.header}
            </button>
          ),
          headerProps: {
            className: 'abaabil-table__sortable',
            'aria-sort': sort.key === c.key ? sort.direction : 'none',
            ...c.headerProps,
          },
        }
      : c
  )

  const cls = [stickyHeader && 'abaabil-table--sticky', className].filter(Boolean).join(' ') || undefined

  return (
    <Table
      columns={cols}
      rows={sorted}
      caption={caption}
      captionProps={{ id: captionId }}
      scrollProps={{
        tabIndex: 0,
        role: 'region',
        'aria-labelledby': caption ? captionId : undefined,
        'aria-label': caption ? undefined : props['aria-label'],
      }}
      className={cls}
      {...props}
    />
  )
}

function compare(a, b) {
  return typeof a === 'string' ? a.localeCompare(b) : a - b
}
