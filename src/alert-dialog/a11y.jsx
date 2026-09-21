'use client'

import { useCallback, useEffect, useId, useRef } from 'react'
import './alert-dialog.css'
import AlertDialog from './styled.jsx'

/**
 * AlertDialog, a11y tier.
 *
 * Three things distinguish this from dialog's a11y tier, and all three
 * are the point of having a separate component.
 *
 * It requires a description as well as a label. role="alertdialog"
 * causes the description to be announced the moment the dialog opens,
 * and a dialog with that role and nothing to describe announces its
 * title twice and then stops, which is worse than a plain dialog. So
 * `description` is wired to aria-describedby and warned about in
 * development when missing, exactly as `label` is.
 *
 * It does not light-dismiss. Clicking the backdrop does nothing, on
 * purpose. An alert dialog exists because the answer matters, and
 * dismissing "delete everything?" by clicking slightly to the left of
 * it is an accident the pattern is specifically designed to prevent.
 * Escape still closes it, because the platform does that and removing
 * it would trap the keyboard user with no way out.
 *
 * It focuses the least destructive action. The browser focuses the
 * first focusable element in the dialog, which in a confirmation is
 * usually whichever button the author wrote first. A confirmation that
 * opens with "Delete" focused is one Enter keypress from deleting, so
 * this tier moves focus to the element marked with `data-safe-action`
 * when the dialog opens, and falls back to the platform's behaviour
 * when nothing is marked.
 *
 * Like dialog and drawer, it deliberately does not implement a focus
 * trap: showModal() already contains focus, makes the background
 * inert, and renders in the top layer.
 *
 * @param {object} props
 * @param {boolean} [props.open=false]
 * @param {() => void} [props.onClose] Fires on Escape and on close().
 * @param {string} props.label The question, as a heading.
 * @param {string} props.description What happens if they say yes.
 *   Announced immediately because of the role.
 */
export default function AlertDialog_a11y({
  open = false,
  onClose,
  label,
  description,
  children,
  ref: consumerRef,
  ...props
}) {
  const ref = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  const setRef = useCallback(
    (node) => {
      ref.current = node
      if (typeof consumerRef === 'function') consumerRef(node)
      else if (consumerRef) consumerRef.current = node
    },
    [consumerRef]
  )

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    if (!label && !props['aria-label'] && !props['aria-labelledby']) {
      console.warn(
        'abaabil/alert-dialog: no `label` given, so the dialog has no ' +
          'accessible name and screen readers announce it as unnamed.'
      )
    }
    if (!description) {
      console.warn(
        'abaabil/alert-dialog: no `description` given. role="alertdialog" ' +
          'announces the description on open, so without one this interrupts ' +
          'the user to tell them nothing they did not already know from the ' +
          'title. Use abaabil/dialog if there is nothing to describe.'
      )
    }
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) {
      el.showModal()
      // The platform focuses the first focusable child, which in a
      // confirmation is often the destructive button. One Enter and
      // the thing is gone.
      const safe = el.querySelector('[data-safe-action]')
      if (safe) safe.focus()
    } else if (!open && el.open) {
      el.close()
    }
  }, [open])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handle = () => onClose?.()
    el.addEventListener('close', handle)
    return () => el.removeEventListener('close', handle)
  }, [onClose])

  return (
    <AlertDialog
      ref={setRef}
      aria-labelledby={label ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      {...props}
    >
      {label ? (
        <h2 id={titleId} className="abaabil-alert-dialog__title">
          {label}
        </h2>
      ) : null}
      {description ? (
        <p id={descriptionId} className="abaabil-alert-dialog__description">
          {description}
        </p>
      ) : null}
      {children}
    </AlertDialog>
  )
}
