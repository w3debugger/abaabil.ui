'use client'

import { useCallback, useEffect, useId, useRef } from 'react'
import './dialog.css'
import Dialog from './styled.jsx'

/**
 * Dialog, a11y tier.
 *
 * Deliberately does NOT implement a focus trap. dialog.showModal() natively
 * provides focus containment, Escape dismissal, aria-modal="true", top-layer
 * rendering and an inert background. Reimplementing that in JS is most of why
 * other libraries' dialogs are 10x this size.
 *
 * A consumer-supplied `ref` and `onMouseDown` compose with this component's
 * own (both are pulled out of `...props` and merged explicitly), so passing
 * either does not silently break `open` or light-dismiss.
 *
 * Page scroll is locked by the stylesheet, not here:
 * `html:has(.abaabil-dialog:modal)` sets overflow hidden with a stable
 * scrollbar gutter, so the page does not jump sideways when the
 * scrollbar goes. Nothing on `document.body` is touched.
 *
 * Unmounting while `open` does not call close(), so focus is not
 * returned to the element that opened it. Set `open` to false and let
 * the close event fire before removing the dialog from the tree.
 *
 * @param {object} props
 * @param {boolean} [props.open]
 * @param {() => void} [props.onClose]
 * @param {string} props.label Accessible name. The platform does not supply one.
 */
export default function Dialog_a11y({
  open = false,
  onClose,
  label,
  children,
  ref: consumerRef,
  onMouseDown,
  ...props
}) {
  const ref = useRef(null)
  const titleId = useId()

  const setRef = useCallback(
    (node) => {
      ref.current = node
      if (typeof consumerRef === 'function') consumerRef(node)
      else if (consumerRef) consumerRef.current = node
    },
    [consumerRef]
  )

  // A control named with aria-label or aria-labelledby is correctly named.
  // Warning on those too trains people to ignore the warning.
  const hasAccessibleName = Boolean(
    label || props['aria-label'] || props['aria-labelledby']
  )

  if (process.env.NODE_ENV !== 'production' && !hasAccessibleName) {
    console.warn(
      'abaabil/dialog: no `label` given, so the dialog has no accessible name ' +
        'and screen readers announce it as unnamed.'
    )
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    else if (!open && el.open) el.close()
  }, [open])

  // Light dismiss. The backdrop is part of the dialog's own box, and so are
  // its padding and the gap under the title, so the target alone does not
  // say where the click landed. Only a point outside the box is the backdrop.
  const handleMouseDown = (event) => {
    onMouseDown?.(event)
    const el = ref.current
    if (event.target !== el) return
    const r = el.getBoundingClientRect()
    const { clientX: x, clientY: y } = event
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) el.close()
  }

  return (
    <Dialog ref={setRef} aria-labelledby={label ? titleId : undefined} onClose={onClose} onMouseDown={handleMouseDown} {...props}>
      {label ? <h2 id={titleId} className="abaabil-dialog__title">{label}</h2> : null}
      {children}
    </Dialog>
  )
}
