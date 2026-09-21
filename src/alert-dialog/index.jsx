/**
 * AlertDialog, normal tier. A native <dialog> carrying
 * role="alertdialog". Structure only: no styles, no ARIA logic beyond
 * that role. Contains no hooks, so it renders in both server and
 * client trees; the consumer holds the ref and calls showModal() and
 * close() themselves.
 *
 * The role is the only thing in this tier, and it is the whole
 * component. role="alertdialog" tells assistive technology that this
 * dialog interrupts: a screen reader announces its description
 * immediately on open rather than waiting to be navigated to, which is
 * what you want for "delete this permanently?" and emphatically not
 * what you want for a settings panel.
 *
 * It is a separate component from abaabil/dialog rather than a variant
 * of it because the two differ in more than a role. An alert dialog
 * must not light-dismiss, must carry a description and not merely a
 * title, and exists to force a decision. Folding that into a `variant`
 * prop would make it possible to get a destructive confirmation
 * dismissible by clicking beside it, which is the exact bug the
 * component exists to rule out.
 */
export default function AlertDialog({ className, children, ...props }) {
  const cls = className ? `abaabil-alert-dialog ${className}` : 'abaabil-alert-dialog'

  return (
    <dialog className={cls} role="alertdialog" {...props}>
      {children}
    </dialog>
  )
}
