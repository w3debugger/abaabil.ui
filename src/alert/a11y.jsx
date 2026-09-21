import './alert.css'
import Alert from './styled.jsx'

/**
 * Alert, a11y tier. Adds the live-region semantics, which are the entire
 * difference between a coloured box and a message a screen reader user
 * finds out about.
 *
 * The role is derived from the variant, because the right answer is the
 * same every time and getting it wrong is the common failure:
 *
 * - `info` and `success` get `role="status"`, announced politely, after
 *   whatever the user is currently hearing finishes.
 * - `warning` and `danger` get `role="alert"`, announced immediately,
 *   interrupting.
 *
 * Interrupting is the right call for an error the user must deal with and
 * the wrong one for a confirmation, which is why this is not a single
 * default. Override with `live` when your case genuinely differs.
 *
 * No hooks, so this renders inside a React Server Component tree.
 *
 * An honest caveat, because it decides whether this works at all: a live
 * region is announced when its *contents change*, and assistive tech has
 * to be observing the region before that happens. A region that arrives
 * in the DOM already carrying its message may not be announced, and the
 * behaviour differs between screen readers. If the message appears in
 * response to something the user did, render this component with empty
 * children from the start and fill it in, rather than mounting the whole
 * alert at the moment you have something to say.
 *
 * @param {object} props
 * @param {'info'|'success'|'warning'|'danger'} [props.variant='info']
 * @param {'polite'|'assertive'|'off'} [props.live] Overrides the
 *   politeness the variant implies.
 * @param {string} [props.title] Rendered above the message, as text. Not a
 *   heading element: an alert is usually not a section of the document,
 *   and a stray heading damages the document outline for anyone
 *   navigating by headings.
 */
export default function Alert_a11y({ variant = 'info', live, title, children, ...props }) {
  const urgent = variant === 'warning' || variant === 'danger'
  const politeness = live ?? (urgent ? 'assertive' : 'polite')

  // role="alert" already implies aria-live="assertive" and role="status"
  // implies "polite", so the role alone is enough in the common case.
  // Only when the consumer asks for a politeness the role does not imply
  // is aria-live spelled out, because a role and an aria-live that
  // disagree are resolved differently by different screen readers.
  const implied = urgent ? 'assertive' : 'polite'
  const role = politeness === 'off' ? undefined : urgent ? 'alert' : 'status'

  return (
    <Alert
      variant={variant}
      role={role}
      aria-live={politeness !== implied ? politeness : undefined}
      {...props}
    >
      {title ? <strong className="abaabil-alert__title">{title}</strong> : null}
      {children}
    </Alert>
  )
}
