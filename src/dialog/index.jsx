/**
 * Dialog, normal tier. A native <dialog> and nothing else.
 * The consumer holds the ref and calls showModal()/close() themselves,
 * which is what keeps this hook-free and server-renderable.
 */
export default function Dialog({ className, children, ...props }) {
  const cls = className ? `abaabil-dialog ${className}` : 'abaabil-dialog'
  return (
    <dialog className={cls} {...props}>
      {children}
    </dialog>
  )
}
