import './badge.css'
import Badge from './styled.jsx'

/**
 * Badge, a11y tier. One addition, for the failure that makes badges
 * worth a component at all.
 *
 * A badge is usually a word or two of shorthand that only means
 * something next to what it is attached to. "3" beside an inbox icon,
 * "Beta" beside a feature name. Read out on its own, in a list of
 * everything on the page, it is noise: a screen reader user hears
 * "three" and has no way to know what three of.
 *
 * `context` supplies the rest of the sentence as visually hidden text,
 * so the badge still draws "3" and still announces "3 unread messages".
 *
 * It is done with hidden text rather than `aria-label`, deliberately. A
 * badge is a <span>, a span has no role, and aria-label is prohibited
 * on a generic element: set it there and it is discarded, leaving the
 * badge exactly as unlabelled as before while looking fixed. That
 * mistake shipped in this library's own popover and is the reason this
 * component does it the other way.
 *
 * No hooks, so this renders inside a React Server Component tree. All
 * three badge tiers ship zero runtime JavaScript.
 *
 * On live counts: a badge that changes while the page is open does not
 * announce itself, and this tier does not make it a live region. Wrap
 * it in abaabil/alert if the change is worth interrupting for, which
 * for an unread count it usually is not.
 *
 * @param {object} props
 * @param {'neutral'|'info'|'success'|'warning'|'danger'} [props.variant='neutral']
 * @param {string} [props.context] The rest of the sentence, announced
 *   but not drawn. "3" with context "unread messages" reads as
 *   "3 unread messages".
 * @param {string} [props.className]
 */
export default function Badge_a11y({ variant = 'neutral', context, className, children, ...props }) {
  return (
    <Badge variant={variant} className={className} {...props}>
      {children}
      {context ? <span className="abaabil-visually-hidden"> {context}</span> : null}
    </Badge>
  )
}
