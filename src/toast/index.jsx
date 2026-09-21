/**
 * Toast and ToastRegion, normal tier. Structure only: no styles, no
 * ARIA logic, no timers. Contains no hooks, so both render in server
 * and client trees.
 *
 * WHAT THIS IS NOT
 *
 * There is no `toast('Saved')` function here, and that is a decision
 * rather than an omission. An imperative API needs a module-level
 * store, a subscription, and a root the caller must remember to mount,
 * which is a state manager shipped inside a component library. The
 * consumer already has somewhere to keep a list of things that
 * happened; this renders that list correctly and announces it
 * correctly, which is the part that is genuinely hard to get right.
 *
 * Radix's Toast works the same way. sonner and react-hot-toast do not,
 * and if the imperative call is what you want, they are twenty-odd
 * kilobytes that do it well.
 *
 * WHY THE REGION IS ALWAYS RENDERED
 *
 * The live region must already be in the document before a message is
 * put into it. A screen reader watches an existing live region for
 * changes; inserting the region and its first message in one commit
 * usually announces nothing at all, because there was no region to
 * change. So ToastRegion is mounted once, empty, near the root, and
 * toasts are added inside it. This is the single most common way toast
 * accessibility is broken, and it cannot be fixed from inside Toast.
 *
 * @param {object} props
 * @param {'neutral'|'success'|'warning'|'danger'} [props.variant='neutral']
 * @param {string} [props.className] Merged with the base class.
 */
export function Toast({ variant = 'neutral', className, children, ...props }) {
  const cls = className ? `abaabil-toast ${className}` : 'abaabil-toast'

  return (
    <div className={cls} data-variant={variant} {...props}>
      {children}
    </div>
  )
}

/**
 * The fixed container toasts stack inside. Render one, once, near the
 * root of the app, whether or not there is anything to show.
 *
 * @param {object} props
 * @param {'start'|'end'} [props.align='end'] Which side of the viewport.
 * @param {'top'|'bottom'} [props.position='bottom']
 * @param {string} [props.className] Merged with the base class.
 */
export function ToastRegion({ align = 'end', position = 'bottom', className, children, ...props }) {
  const cls = className ? `abaabil-toast-region ${className}` : 'abaabil-toast-region'

  return (
    <div className={cls} data-align={align} data-position={position} {...props}>
      {children}
    </div>
  )
}

export default Toast
