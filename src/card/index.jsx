/**
 * Card, normal tier. A surface with optional header and footer bands.
 * Structure only: no styles, no ARIA logic. Contains no hooks, so it
 * renders in both server and client trees.
 *
 * This is the thinnest component in the library and the one with the
 * weakest claim to being one: a card is a box with a border, and this
 * library's own rule for the comparison table says a generic layout
 * primitive does not count as a component. It is here because the
 * header and footer bands are the part people actually rewrite every
 * time, and because a card is the most common place a heading level
 * gets chosen badly, which the a11y tier has something to say about.
 *
 * `header` and `footer` render their bands only when given, so a plain
 * <Card> is one element and costs nothing for the parts it does not
 * use.
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.header]
 * @param {import('react').ReactNode} [props.footer]
 * @param {string} [props.className] Merged with the base class.
 */
export default function Card({ header, footer, className, children, ...props }) {
  const cls = className ? `abaabil-card ${className}` : 'abaabil-card'

  return (
    <div className={cls} {...props}>
      {header ? <div className="abaabil-card__header">{header}</div> : null}
      <div className="abaabil-card__body">{children}</div>
      {footer ? <div className="abaabil-card__footer">{footer}</div> : null}
    </div>
  )
}
