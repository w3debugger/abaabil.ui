/**
 * Progress, normal tier. A native <progress> element and nothing else.
 * Structure only: no styles, no ARIA logic. Contains no hooks, so it
 * renders in both server and client trees.
 *
 * Omit `value` for an indeterminate bar. That is the native behaviour of
 * <progress> and it is why `value` has no default here: defaulting it to
 * 0 would quietly turn every unknown-duration operation into one that
 * claims to be 0% done.
 *
 * @param {object} props
 * @param {number} [props.value] Current value. Omit for indeterminate.
 * @param {number} [props.max=100]
 * @param {string} [props.className] Merged with the base class.
 */
export default function Progress({ value, max = 100, className, ...props }) {
  const cls = className ? `abaabil-progress ${className}` : 'abaabil-progress'

  return <progress className={cls} value={value} max={max} {...props} />
}
