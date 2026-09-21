'use client'

import { useCallback, useEffect, useId, useRef } from 'react'
import './drawer.css'
import Drawer from './styled.jsx'

/**
 * Drawer, a11y tier.
 *
 * Like dialog's a11y tier, this deliberately does NOT implement a
 * focus trap. showModal() natively provides focus containment, Escape
 * dismissal, aria-modal, top-layer rendering and an inert background.
 *
 * What it adds is the `open` prop wired to showModal()/close(), an
 * accessible name, light dismiss on the backdrop, and the scroll lock
 * a drawer needs more than a centred dialog does: a drawer usually
 * leaves most of the page visible, which makes scrolling behind it
 * look like the page is working when it is inert.
 *
 * A consumer-supplied `ref` and `onMouseDown` compose with this
 * component's own rather than replacing them, so passing either does
 * not silently break `open` or light dismiss. Same arrangement as
 * dialog, and for the same reason: both were bugs waiting to happen.
 *
 * The animation is in the stylesheet and driven by the native `open`
 * attribute plus @starting-style, not by state here. A drawer that
 * slid in from JavaScript would need to hold its own "closing" flag
 * and delay close() until a transition ended, which is a state machine
 * for something CSS now does on its own.
 *
 * @param {object} props
 * @param {boolean} [props.open=false]
 * @param {'start'|'end'|'top'|'bottom'} [props.side='end']
 * @param {() => void} [props.onClose]
 * @param {string} props.label Accessible name. The platform does not
 *   supply one, and an unnamed drawer is announced as just "dialog".
 */
export default function Drawer_a11y({
  open = false,
  side = 'end',
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

  const hasAccessibleName = Boolean(
    label || props['aria-label'] || props['aria-labelledby']
  )

  if (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV !== 'production' &&
    !hasAccessibleName
  ) {
    console.warn(
      'abaabil/drawer: no `label` given, so the drawer has no accessible name ' +
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
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  // The backdrop is part of the dialog's own box, so a pointer event
  // landing on the element itself rather than its children is a
  // backdrop click.
  const handleMouseDown = (event) => {
    onMouseDown?.(event)
    if (event.target === ref.current) ref.current.close()
  }

  return (
    <Drawer
      ref={setRef}
      side={side}
      aria-labelledby={label ? titleId : undefined}
      onMouseDown={handleMouseDown}
      {...props}
    >
      {label ? (
        <h2 id={titleId} className="abaabil-drawer__title">
          {label}
        </h2>
      ) : null}
      {children}
    </Drawer>
  )
}
