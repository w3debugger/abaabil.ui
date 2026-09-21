import './breadcrumb.css'

/**
 * Breadcrumb, a11y tier. Two additions, both of which a hand-rolled
 * breadcrumb almost always misses.
 *
 * First, the <nav> gets a name. A page usually has more than one
 * navigation landmark, and a screen reader user listing them hears
 * "navigation, navigation, navigation" unless each one says what it is.
 *
 * Second, the last item gets aria-current="page". Without it there is
 * nothing telling assistive tech which entry in the trail is where you
 * are now; visually it is obvious, because it is the one that is not a
 * link.
 *
 * No hooks, so this renders inside a React Server Component tree. All
 * three breadcrumb tiers ship zero runtime JavaScript.
 *
 * The last item renders as text, not a link, even if you give it an
 * `href`. A link to the page you are already on is a link that does
 * nothing, and `aria-current` alone does not stop someone following it.
 * Pass `linkCurrent` if you need it to stay a link anyway, in which case
 * it keeps aria-current="page".
 *
 * @param {object} props
 * @param {Array<{key?: string|number, label: import('react').ReactNode, href?: string}>} props.items
 * @param {string} [props.label='Breadcrumb'] Accessible name for the nav.
 * @param {boolean} [props.linkCurrent=false] Keep the last item a link.
 * @param {string} [props.className]
 */
export default function Breadcrumb_a11y({
  items,
  label = 'Breadcrumb',
  linkCurrent = false,
  className,
  ...props
}) {
  const cls = className ? `abaabil-breadcrumb ${className}` : 'abaabil-breadcrumb'
  const lastIndex = items.length - 1

  return (
    <nav className={cls} aria-label={label} {...props}>
      <ol className="abaabil-breadcrumb__list">
        {items.map((item, index) => {
          const isCurrent = index === lastIndex
          const asLink = item.href && (!isCurrent || linkCurrent)

          return (
            <li key={item.key ?? index} className="abaabil-breadcrumb__item">
              {asLink ? (
                <a
                  href={item.href}
                  className="abaabil-breadcrumb__link"
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className="abaabil-breadcrumb__current"
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
