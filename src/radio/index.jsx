/**
 * Radio, normal tier. Structure only: no styles, no ARIA logic.
 * Contains no hooks, so it renders in both server and client trees.
 *
 * @param {object} props
 * @param {string} [props.className] Merged with the base class.
 */
export default function Radio({ className, ...props }) {
  const cls = className ? `abaabil-radio ${className}` : 'abaabil-radio'
  return <input type="radio" className={cls} {...props} />
}
