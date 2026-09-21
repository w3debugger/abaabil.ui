/**
 * Pagination, normal tier. A <nav> around an ordered list of page links.
 * Structure only: no styles, no ARIA logic. Contains no hooks, so it
 * renders in both server and client trees.
 *
 * An ordered list, because the order is the information, and real links
 * rather than buttons, because each page is a URL you can open in a new
 * tab, bookmark and share. A paginator built from buttons takes all of
 * that away for no gain.
 *
 * @param {object} props
 * @param {number} props.page Current page, 1-based.
 * @param {number} props.pageCount Total pages.
 * @param {(page: number) => string} props.href Builds each page's URL.
 * @param {number} [props.siblings=1] Pages shown either side of the
 *   current one before the list collapses to an ellipsis.
 * @param {string} [props.className] Merged with the base class.
 */
export default function Pagination({
  page,
  pageCount,
  href,
  siblings = 1,
  className,
  ...props
}) {
  const cls = className ? `abaabil-pagination ${className}` : 'abaabil-pagination'
  const pages = pageWindow(page, pageCount, siblings)

  return (
    <nav className={cls} {...props}>
      <ol className="abaabil-pagination__list">
        <li className="abaabil-pagination__item">
          <Step to={page - 1} page={page} pageCount={pageCount} href={href} kind="prev">
            Previous
          </Step>
        </li>
        {pages.map((p, i) =>
          p === GAP ? (
            <li key={`gap-${i}`} className="abaabil-pagination__item">
              {/* Drawn in CSS, not rendered as text, so it never
                  reaches the accessibility tree at all. An ellipsis read
                  aloud between numbers is noise, and drawing it is how
                  breadcrumb handles its separators for the same
                  reason. It also means no tier needs aria-hidden. */}
              <span className="abaabil-pagination__gap" />
            </li>
          ) : (
            <li key={p} className="abaabil-pagination__item">
              {p === page ? (
                <span className="abaabil-pagination__current">{p}</span>
              ) : (
                <a href={href(p)} className="abaabil-pagination__link">
                  {p}
                </a>
              )}
            </li>
          )
        )}
        <li className="abaabil-pagination__item">
          <Step to={page + 1} page={page} pageCount={pageCount} href={href} kind="next">
            Next
          </Step>
        </li>
      </ol>
    </nav>
  )
}

/**
 * Previous/next. At either end there is nowhere to go, and a link to
 * nowhere is worse than no link: it stays in the tab order and does
 * nothing when followed. So it renders as plain text instead.
 */
function Step({ to, page, pageCount, href, kind, children }) {
  const available = to >= 1 && to <= pageCount
  const cls = `abaabil-pagination__step abaabil-pagination__step--${kind}`

  if (!available) {
    return <span className={`${cls} abaabil-pagination__step--unavailable`}>{children}</span>
  }
  return (
    <a href={href(to)} className={cls}>
      {children}
    </a>
  )
}

export const GAP = 'gap'

/**
 * The page numbers to show: always the first and last, always a window
 * around the current page, and a gap standing in for whatever is
 * skipped. Returns numbers and GAP markers.
 */
export function pageWindow(page, pageCount, siblings = 1) {
  // Short enough to show whole. The 5 is the fixed furniture: first,
  // last, current, and a gap on each side. Below that a gap would take
  // up as much room as the numbers it replaces.
  if (pageCount <= siblings * 2 + 5) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }

  const start = Math.max(2, page - siblings)
  const end = Math.min(pageCount - 1, page + siblings)
  const out = [1]

  // A gap that stands in for exactly one page is worse than the page:
  // it takes the same room and says less. So the gap appears only when
  // it hides two or more, and otherwise the single page is drawn.
  if (start > 3) out.push(GAP)
  else if (start === 3) out.push(2)

  for (let p = start; p <= end; p++) out.push(p)

  if (end < pageCount - 2) out.push(GAP)
  else if (end === pageCount - 2) out.push(pageCount - 1)

  out.push(pageCount)
  return out
}
