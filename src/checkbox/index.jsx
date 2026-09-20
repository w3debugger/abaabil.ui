/**
 * Checkbox, normal tier. Structure only: no styles, no ARIA logic.
 * Contains no hooks, so it renders in both server and client trees.
 *
 * @param {object} props
 * @param {string} [props.className] Merged with the base class.
 */
export default function Checkbox({ className, ...props }) {
  const cls = className ? `abaabil-checkbox ${className}` : 'abaabil-checkbox'
  return <input type="checkbox" className={cls} {...props} />
}
