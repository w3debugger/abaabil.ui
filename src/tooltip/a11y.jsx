'use client'

import { cloneElement, isValidElement, useId, useRef, useState } from 'react'
import './tooltip.css'

/**
 * Tooltip, a11y tier.
 *
 * Read this before reaching for it, because a tooltip is the control
 * most often used for the wrong job:
 *
 * - **Never put essential information in one.** It is unreachable on
 *   touch, where there is no hover, and easy to miss everywhere else.
 *   If the user needs it to complete the task, put it on the page.
 * - **Never put interactive content in one.** A link or button inside a
 *   tooltip cannot be reached: moving towards it dismisses the thing it
 *   is in. If you need that, you want a popover.
 * - **The trigger must be focusable.** A tooltip on a plain <span> is
 *   invisible to keyboard users. This component warns when its child is
 *   not an element it can attach to.
 *
 * What this tier adds over the CSS-only tiers below it:
 *
 * - `aria-describedby` from the trigger to the bubble, which is what
 *   makes a screen reader read the tooltip at all. The CSS tiers show
 *   the bubble visually and say nothing to assistive tech.
 * - Escape dismisses it. WCAG 1.4.13 requires content revealed on hover
 *   or focus to be dismissable without moving the pointer, and CSS has
 *   no way to respond to a key.
 *
 * The child is cloned to receive the aria and handlers, so the trigger
 * is your element rather than a wrapper of ours.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.content
 * @param {string} [props.placement='top'] 'top' | 'bottom'.
 * @param {import('react').ReactElement} props.children The trigger.
 */
export default function Tooltip_a11y({ content, placement = 'top', className, children, ...props }) {
  const id = useId()
  const [dismissed, setDismissed] = useState(false)
  const wrapper = useRef(null)
  const cls = className ? `abaabil-tooltip ${className}` : 'abaabil-tooltip'

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    if (!isValidElement(children)) {
      console.warn(
        'abaabil/tooltip: children must be a single element that can receive props ' +
          '(a button, a link, an input). A string or fragment cannot be described, ' +
          'and a tooltip on a non-focusable element is invisible to keyboard users.'
      )
    }
  }

  // Escape closes it, and it reopens on the next hover or focus. Tracked
  // as state rather than by removing the element, so the bubble stays in
  // the DOM and aria-describedby keeps resolving.
  function handleKeyDown(event) {
    if (event.key === 'Escape' && !dismissed) {
      // Not preventDefault: Escape may also mean something to a dialog
      // above this, and swallowing it there would trap the user.
      setDismissed(true)
    }
  }

  const trigger = isValidElement(children)
    ? cloneElement(children, {
        'aria-describedby': [children.props['aria-describedby'], id].filter(Boolean).join(' '),
      })
    : children

  return (
    <span
      ref={wrapper}
      className={cls}
      data-placement={placement}
      data-dismissed={dismissed ? 'true' : undefined}
      onKeyDown={handleKeyDown}
      onPointerEnter={() => setDismissed(false)}
      onFocus={() => setDismissed(false)}
      {...props}
    >
      {trigger}
      <span id={id} className="abaabil-tooltip__bubble" role="tooltip">
        {content}
      </span>
    </span>
  )
}
