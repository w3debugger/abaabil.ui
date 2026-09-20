/**
 * Input, normal tier. Structure only: no styles, no ARIA logic.
 * Contains no hooks, so it renders in both server and client trees.
 *
 * @param {object} props
 * @param {string} [props.type='text'] Input type.
 * @param {string} [props.className] Merged with the base class.
 */
export default function Input({ type = 'text', className, ...props }) {
  const cls = className ? `abaabil-input ${className}` : 'abaabil-input'

  return <input type={type} className={cls} {...props} />
}
