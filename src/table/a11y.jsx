'use client'

import { useEffect, useId, useRef, useState } from 'react'
import './table.css'
import Table from './styled.jsx'

// The missing-name warning fires once per page load, not once per render.
let warned

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
 * this tier carries 'use client' and the other two do not. The stop is
 * only there while something overflows: a ResizeObserver on the wrapper
 * and the table flips tabIndex to -1 when every column fits, so a page
 * of narrow tables is not a page of empty tab stops. Server markup
 * carries tabIndex 0 until the observer runs.
 *
 * A consumer's `scrollProps` and `captionProps` are merged with the
 * wiring above, not spread over it: the documented `stickyHeader`
 * recipe passes `scrollProps={{ style: { maxBlockSize } }}`, and that
 * used to replace the role, the tab stop and the label wholesale.
 *
 * Sortable columns. A column with `sortable: true` draws its header
 * inside a real <button>, and the <th> carries aria-sort so a screen
 * reader announces "Price, sorted ascending" rather than a button that
 * appears to do nothing. The arrow is drawn in CSS from that same
 * attribute, so the state has one source and is never read out twice.
 * Sorting is uncontrolled, as combobox and tabs are: the component
 * owns `{ key, direction }`, cycles none, ascending, descending, and
 * reports each change through `onSort`. The default comparator uses
 * localeCompare when either side is a string and subtraction otherwise.
 * Null and undefined sort last in both directions, decided before the
 * comparator runs, so empty cells never scatter through the order and a
 * column's own `compare(a, b)` never sees them.
 *
 * @param {object} props
 * @param {Array<{ key: string, header: import('react').ReactNode, align?: 'start'|'end'|'center', width?: string|number, cell?: (row: object) => import('react').ReactNode, sortable?: boolean, compare?: (a: any, b: any) => number }>} props.columns
 *   `compare` is never called with null or undefined; those sort last.
 * @param {object[]} props.rows
 * @param {import('react').ReactNode} [props.caption] Names the table and
 *   the scroll region. Without it pass `aria-label`.
 * @param {(sort: { key: string|null, direction: 'none'|'ascending'|'descending' }) => void} [props.onSort]
 * @param {boolean} [props.stickyHeader=false] Header row stays put while
 *   the wrapper scrolls. Give the wrapper a max-block-size for it to matter.
 *   It sticks to the wrapper, never the page: the wrapper is a scroll
 *   container. A header that follows the page needs the wrapper's
 *   overflow removed.
 * @param {object} [props.scrollProps] Merged onto the scroll wrapper, under
 *   the role, tab stop and label this tier sets.
 * @param {object} [props.captionProps] Merged onto the <caption>, under its id.
 * @param {string|((row: object, index: number) => React.Key)} [props.rowKey='id']
 * @param {string} [props.className]
 */
export default function Table_a11y({
  columns,
  rows,
  caption,
  onSort,
  stickyHeader = false,
  scrollProps,
  captionProps,
  className,
  ...props
}) {
  const captionId = useId()
  const scrollRef = useRef(null)
  const [sort, setSort] = useState({ key: null, direction: 'none' })
  const named = Boolean(caption || props['aria-label'] || props['aria-labelledby'])

  if (process.env.NODE_ENV !== 'production' && !named && !warned) {
    warned = true
    console.warn(
      'abaabil/table: no `caption` given, so the table and its scroll region ' +
        'have no accessible name. Pass `caption`, or `aria-label`.'
    )
  }

  useEffect(() => {
    const el = scrollRef.current
    // Absent in jsdom and nothing older than the browser floor; the stop
    // simply stays.
    if (!globalThis.ResizeObserver) return
    const observer = new ResizeObserver(() => {
      el.tabIndex = el.scrollWidth > el.clientWidth ? 0 : -1
    })
    observer.observe(el)
    observer.observe(el.firstElementChild)
    return () => observer.disconnect()
  }, [])

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
        const x = a[active.key]
        const y = b[active.key]
        // Empties last in both directions, so they never scatter:
        // decided before the direction flip, and before a column's own
        // compare, which therefore never sees null or undefined.
        if (x == null || y == null) return (x == null) - (y == null)
        const r = (active.compare ?? compare)(x, y)
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
      captionProps={{ ...captionProps, id: captionId }}
      scrollProps={{
        tabIndex: 0,
        role: 'region',
        'aria-labelledby': caption ? captionId : undefined,
        'aria-label': caption ? undefined : props['aria-label'],
        ...scrollProps,
        ref: scrollRef,
      }}
      className={cls}
      {...props}
    />
  )
}

function compare(a, b) {
  return typeof a === 'string' || typeof b === 'string'
    ? String(a).localeCompare(String(b))
    : a - b
}
