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
 * accessible name and light dismiss on the backdrop. The scroll lock a
 * drawer needs more than a centred dialog does (a drawer leaves most
 * of the page visible, which makes scrolling behind it look like the
 * page is working when it is inert) is in the stylesheet:
 * `html:has(.abaabil-drawer:modal)` sets overflow hidden with a stable
 * scrollbar gutter, so nothing here touches `document.body`.
 *
 * Unmounting while `open` does not call close(), so focus is not
 * returned to the element that opened it. Set `open` to false and let
 * the close event fire before removing the drawer from the tree.
 *
 * A consumer-supplied `ref` and `onMouseDown` compose with this
 * component's own rather than replacing them, so passing either does
 * not silently break `open` or light dismiss. Same arrangement as
 * dialog, and for the same reason: both were bugs waiting to happen.
 *
 * The animation is in the stylesheet and driven by the native `open`
 * attribute, @starting-style for the entry and a discrete `display`
 * and `overlay` transition for the exit, not by state here. A drawer
 * that slid from JavaScript would need to hold its own "closing" flag
 * and delay close() until a transition ended, which is a state machine
 * for something CSS now does on its own.
 *
 * Right-to-left is detected from a `dir="rtl"` attribute on an
 * ancestor, usually <html>. A document made RTL by the CSS `direction`
 * property alone still places the drawer on the correct edge, but
 * slides it in from the wrong one.
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

  // The backdrop is part of the dialog's own box, and so are its padding
  // and its own scrollbar (the drawer scrolls), so the target alone does
  // not say where the pointer landed. Only a point outside the box is
  // the backdrop.
  const handleMouseDown = (event) => {
    onMouseDown?.(event)
    const el = ref.current
    if (event.target !== el) return
    const r = el.getBoundingClientRect()
    const { clientX: x, clientY: y } = event
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) el.close()
  }

  return (
    <Drawer
      ref={setRef}
      side={side}
      aria-labelledby={label ? titleId : undefined}
      onClose={onClose}
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
