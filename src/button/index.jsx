/**
 * Button, normal tier. Structure only: no styles, no ARIA logic.
 * Contains no hooks, so it renders in both server and client trees.
 *
 * @param {object} props
 * @param {string} [props.as='button'] Element or component to render.
 * @param {string} [props.type] Button type. Defaults to 'button' when rendering a <button>.
 * @param {string} [props.className] Merged with the base class.
 */
export default function Button({ as: As = 'button', type, className, children, ...props }) {
  const cls = className ? `abaabil-button ${className}` : 'abaabil-button'
  const typeProp = As === 'button' ? { type: type ?? 'button' } : null

  return (
    <As className={cls} {...typeProp} {...props}>
      {children}
    </As>
  )
}
