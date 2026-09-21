import './pagination.css'
import { pageWindow, GAP } from './styled.jsx'

/**
 * Pagination, a11y tier. Four additions, each of which a hand-rolled
 * paginator usually misses.
 *
 * - The <nav> gets a name. A page often has more than one navigation
 *   landmark, and unnamed ones are announced as "navigation,
 *   navigation, navigation".
 * - The current page gets aria-current="page". Visually it is the one
 *   that is not a link; nothing conveys that otherwise.
 * - Every number gets a real name. A link whose entire content is "7"
 *   is announced as "7", which in a list of links is meaningless. Each
 *   becomes "Page 7", with the number still the only thing drawn.
 * - Previous and next say what they move to, so "Previous" becomes
 *   "Previous page, 3". At the ends they are not links at all, so
 *   nothing keeps a dead control in the tab order.
 *
 * No hooks, so this renders inside a React Server Component tree. All
 * three pagination tiers ship zero runtime JavaScript.
 *
 * @param {object} props
 * @param {number} props.page Current page, 1-based.
 * @param {number} props.pageCount
 * @param {(page: number) => string} props.href
 * @param {number} [props.siblings=1]
 * @param {string} [props.label='Pagination'] Accessible name for the nav.
 *   Pass a distinct one to each paginator if a page has two of them, as
 *   a list with controls above and below does. Two navigation landmarks
 *   sharing a name is a real finding (axe reports landmark-unique), and
 *   it is not one the component can fix from in here: only the page
 *   knows that the second paginator is the same list again.
 * @param {(page: number) => string} [props.pageLabel] Names each number.
 *   Defaults to `Page ${n}`. Replace it to translate.
 * @param {string} [props.previousLabel='Previous page']
 * @param {string} [props.nextLabel='Next page']
 * @param {string} [props.className]
 */
export default function Pagination_a11y({
  page,
  pageCount,
  href,
  siblings = 1,
  label = 'Pagination',
  pageLabel = (n) => `Page ${n}`,
  previousLabel = 'Previous page',
  nextLabel = 'Next page',
  className,
  ...props
}) {
  const cls = className ? `abaabil-pagination ${className}` : 'abaabil-pagination'
  const pages = pageWindow(page, pageCount, siblings)
  const hasPrev = page > 1
  const hasNext = page < pageCount

  return (
    <nav className={cls} aria-label={label} {...props}>
      <ol className="abaabil-pagination__list">
        <li className="abaabil-pagination__item">
          {hasPrev ? (
            <a
              href={href(page - 1)}
              className="abaabil-pagination__step abaabil-pagination__step--prev"
              aria-label={`${previousLabel}, ${pageLabel(page - 1)}`}
            >
              Previous
            </a>
          ) : (
            <span className="abaabil-pagination__step abaabil-pagination__step--prev abaabil-pagination__step--unavailable">
              Previous
            </span>
          )}
        </li>

        {pages.map((p, i) =>
          p === GAP ? (
            <li key={`gap-${i}`} className="abaabil-pagination__item">
              <span className="abaabil-pagination__gap" />
            </li>
          ) : (
            <li key={p} className="abaabil-pagination__item">
              {p === page ? (
                // Not a link: it goes where you already are. aria-current
                // is what says so, since "not a link" is only visible.
                <span className="abaabil-pagination__current" aria-current="page">
                  <span aria-hidden="true">{p}</span>
                  <span className="abaabil-visually-hidden">{pageLabel(p)}</span>
                </span>
              ) : (
                <a href={href(p)} className="abaabil-pagination__link" aria-label={pageLabel(p)}>
                  {p}
                </a>
              )}
            </li>
          )
        )}

        <li className="abaabil-pagination__item">
          {hasNext ? (
            <a
              href={href(page + 1)}
              className="abaabil-pagination__step abaabil-pagination__step--next"
              aria-label={`${nextLabel}, ${pageLabel(page + 1)}`}
            >
              Next
            </a>
          ) : (
            <span className="abaabil-pagination__step abaabil-pagination__step--next abaabil-pagination__step--unavailable">
              Next
            </span>
          )}
        </li>
      </ol>
    </nav>
  )
}
