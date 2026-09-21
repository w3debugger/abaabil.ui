import './spinner.css'
import Spinner from './styled.jsx'

/**
 * Spinner, a11y tier.
 *
 * A spinning ring says "wait" to someone who can see it and nothing at
 * all to someone who cannot, so this tier gives it a name and a role
 * that announces. `role="status"` is an implicit aria-live="polite"
 * region: the label is read when the spinner appears, without
 * interrupting whatever is being read at the time. That is the right
 * politeness for loading, which the user usually caused and is already
 * expecting.
 *
 * The label is visually hidden rather than set with aria-label. A
 * <span> is a generic element, and aria-label on a generic element is
 * prohibited and discarded, which leaves the spinner as unnamed as it
 * was while looking fixed. That mistake shipped in this library's own
 * popover once; badge avoids it the same way.
 *
 * `decorative` is for the common case where the spinner sits inside a
 * button that already says "Saving...", or beside text that says the
 * same thing. Two announcements of one fact is worse than one, so the
 * ring is hidden and the existing text does the work.
 *
 * Reduced motion is handled in the stylesheet, not here: the ring stops
 * spinning and pulses instead, because something still has to indicate
 * that work is in progress.
 *
 * No hooks, so all three spinner tiers render in a Server Component
 * tree and ship zero runtime JavaScript.
 *
 * @param {object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.label='Loading'] Announced when the spinner appears.
 * @param {boolean} [props.decorative=false] Hide it entirely, for a
 *   spinner beside text that already says what is happening.
 * @param {string} [props.className]
 */
export default function Spinner_a11y({
  size = 'md',
  label = 'Loading',
  decorative = false,
  className,
  ...props
}) {
  if (decorative) {
    return <Spinner size={size} className={className} aria-hidden="true" {...props} />
  }

  return (
    <span className="abaabil-spinner-status" role="status">
      <Spinner size={size} className={className} {...props} />
      <span className="abaabil-visually-hidden">{label}</span>
    </span>
  )
}
