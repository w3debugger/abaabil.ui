/**
 * Textarea, normal tier. Structure only: no styles, no ARIA logic.
 * Contains no hooks, so it renders in both server and client trees.
 *
 * `rows` defaults to 3 rather than the browser's 2, because 2 is too
 * short to read back what you typed in almost every real form.
 *
 * @param {object} props
 * @param {number} [props.rows=3] Visible line count.
 * @param {string} [props.className] Merged with the base class.
 */
export default function Textarea({ rows = 3, className, ...props }) {
  const cls = className ? `abaabil-textarea ${className}` : 'abaabil-textarea'

  return <textarea rows={rows} className={cls} {...props} />
}
