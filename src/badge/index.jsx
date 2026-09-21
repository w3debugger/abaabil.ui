/**
 * Badge, normal tier. A small piece of status text. Structure only: no
 * styles, no ARIA logic. Contains no hooks, so it renders in both
 * server and client trees.
 *
 * The variant lands as a data attribute rather than a class, so the
 * styled tier can key off it without the normal tier knowing any class
 * names it does not otherwise use. Same arrangement as alert.
 *
 * @param {object} props
 * @param {'neutral'|'info'|'success'|'warning'|'danger'} [props.variant='neutral']
 * @param {string} [props.className] Merged with the base class.
 */
export default function Badge({ variant = 'neutral', className, children, ...props }) {
  const cls = className ? `abaabil-badge ${className}` : 'abaabil-badge'

  return (
    <span className={cls} data-variant={variant} {...props}>
      {children}
    </span>
  )
}
