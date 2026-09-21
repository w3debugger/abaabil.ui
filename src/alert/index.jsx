/**
 * Alert, normal tier. A container with a variant, and nothing else:
 * no styles, no role, no live region. Contains no hooks, so it renders in
 * both server and client trees.
 *
 * The variant lands as a data attribute rather than a class, so the
 * styled tier can key off it without the normal tier having to know any
 * class names it does not otherwise use.
 *
 * @param {object} props
 * @param {'info'|'success'|'warning'|'danger'} [props.variant='info']
 * @param {string} [props.className] Merged with the base class.
 */
export default function Alert({ variant = 'info', className, children, ...props }) {
  const cls = className ? `abaabil-alert ${className}` : 'abaabil-alert'

  return (
    <div className={cls} data-variant={variant} {...props}>
      {children}
    </div>
  )
}
