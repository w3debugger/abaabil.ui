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

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !hasAccessibleName) {
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

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handle = () => onClose?.()
    el.addEventListener('close', handle)
    return () => el.removeEventListener('close', handle)
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])

  // Light dismiss. The backdrop is part of the dialog's own box, so a click
  // landing on the element itself (not its children) is a backdrop click.
  const handleMouseDown = (event) => {
    onMouseDown?.(event)
    if (event.target === ref.current) ref.current.close()
  }

  return (
    <Dialog ref={setRef} aria-labelledby={label ? titleId : undefined} onMouseDown={handleMouseDown} {...props}>
      {label ? <h2 id={titleId} className="abaabil-dialog__title">{label}</h2> : null}
      {children}
    </Dialog>
  )
}
