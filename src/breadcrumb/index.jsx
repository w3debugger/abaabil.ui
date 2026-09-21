/**
 * Breadcrumb, normal tier. A <nav> wrapping an ordered list of links.
 * Structure only: no styles, no ARIA logic. Contains no hooks, so it
 * renders in both server and client trees.
 *
 * An ordered list rather than a plain row of links, because the order is
 * the information: these are ancestors, not siblings.
 *
 * The separator is drawn in CSS rather than rendered as text, so it never
 * reaches the accessibility tree. A screen reader announcing
 * "Home slash Docs slash Buttons" is reading punctuation aloud.
 *
 * @param {object} props
 * @param {Array<{key?: string|number, label: import('react').ReactNode, href?: string}>} props.items
 *   The trail, root first. An item with no `href` renders as text, which
 *   is what the last one usually wants.
 * @param {string} [props.className] Merged with the base class.
 */
export default function Breadcrumb({ items, className, ...props }) {
  const cls = className ? `abaabil-breadcrumb ${className}` : 'abaabil-breadcrumb'

  return (
    <nav className={cls} {...props}>
      <ol className="abaabil-breadcrumb__list">
        {items.map((item, index) => (
          <li key={item.key ?? index} className="abaabil-breadcrumb__item">
            {item.href ? (
              <a href={item.href} className="abaabil-breadcrumb__link">
                {item.label}
              </a>
            ) : (
              <span className="abaabil-breadcrumb__current">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
