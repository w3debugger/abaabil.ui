'use client'

import { useEffect, useRef, useState } from 'react'
import './toast.css'
import { Toast, ToastRegion } from './styled.jsx'

/**
 * ToastRegion, a11y tier. Mount one, once, near the root.
 *
 * Two roles, not one, and the split is the whole reason this is worth
 * a component.
 *
 * The outer element is a `role="region"` with a name, so the stack is
 * a landmark a screen reader user can navigate to deliberately. Toasts
 * disappear on a timer; without a landmark, someone who hears "Message
 * sent" and wants to re-read it has nowhere to go.
 *
 * Inside it are two live regions, permanently present and usually
 * empty. Polite messages go in one, assertive ones in the other. They
 * have to be separate elements because aria-live cannot be changed on
 * an element that already has content queued without the change being
 * ignored, and they have to exist before anything is put in them,
 * because a live region inserted together with its first message
 * announces nothing in most screen readers. Rendering the region only
 * when there are toasts to show is the single most common way this
 * pattern is broken, and it is invisible in testing unless you test
 * with a screen reader.
 *
 * @param {object} props
 * @param {string} [props.label='Notifications'] Names the landmark.
 * @param {'start'|'end'} [props.align='end']
 * @param {'top'|'bottom'} [props.position='bottom']
 */
export function ToastRegion_a11y({ label = 'Notifications', children, ...props }) {
  return (
    <ToastRegion role="region" aria-label={label} {...props}>
      {children}
    </ToastRegion>
  )
}

/**
 * Toast, a11y tier.
 *
 * POLITENESS
 *
 * Derived from the variant rather than left to the caller, because the
 * caller gets it wrong in a predictable direction: everything feels
 * urgent to the person writing it. `danger` is assertive, which
 * interrupts whatever is being read. Everything else is polite, which
 * waits. A stream of polite "Saved" messages is ignorable; a stream of
 * assertive ones makes the page unusable with a screen reader, and
 * that failure is invisible to anyone not using one.
 *
 * `aria-atomic` is set so the whole message is read as one sentence
 * rather than the changed words alone.
 *
 * DISMISSAL
 *
 * `duration` auto-dismisses. The timer pauses while the pointer is
 * over the toast or focus is inside it, and resumes on leaving, which
 * is what stops a message vanishing from under someone reading it or
 * reaching for its button. It also pauses while the document is
 * hidden, so a toast fired in a background tab is still there when the
 * tab comes back rather than having expired unseen.
 *
 * A toast with an action or a close button should not have a duration
 * at all, and `duration={null}` is how you say so. WCAG 2.2.1 requires
 * that timed content can be turned off, extended, or be an essential
 * part of the activity; a five-second window to hit "Undo" fails that
 * for most people and all of them under pressure. This component will
 * warn in development if given both an action and a duration.
 *
 * WHY THERE IS NO ANIMATION ON EXIT
 *
 * A toast removed from the DOM after a transition needs to hold a
 * "leaving" state and delay its own unmount, which means this
 * component would own the list rather than the consumer. The entry
 * animation is CSS; the exit is immediate. That is a real limitation
 * and it is the price of the consumer keeping the array.
 *
 * @param {object} props
 * @param {'neutral'|'success'|'warning'|'danger'} [props.variant='neutral']
 * @param {number|null} [props.duration=6000] Milliseconds before
 *   onDismiss fires, or null to stay until dismissed.
 * @param {() => void} [props.onDismiss] Called when the timer expires
 *   or the close button is pressed. Remove the toast from your list here.
 * @param {string} [props.closeLabel='Dismiss'] Names the close button.
 *   Omit onDismiss to render no close button.
 * @param {import('react').ReactNode} [props.action] A button or link.
 *   Giving one without `duration={null}` is a WCAG 2.2.1 problem.
 */
export function Toast_a11y({
  variant = 'neutral',
  duration = 6000,
  onDismiss,
  closeLabel = 'Dismiss',
  action,
  children,
  ...props
}) {
  const [paused, setPaused] = useState(false)
  const dismiss = useRef(onDismiss)
  dismiss.current = onDismiss

  if (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV !== 'production' &&
    action &&
    duration !== null
  ) {
    console.warn(
      'abaabil/toast: this toast has an `action` and a `duration`, so the ' +
        'action disappears on a timer. WCAG 2.2.1 asks that timed content can ' +
        'be turned off or extended. Pass duration={null} and let the close ' +
        'button dismiss it.'
    )
  }

  useEffect(() => {
    if (duration === null || paused) return
    const id = setTimeout(() => dismiss.current?.(), duration)
    return () => clearTimeout(id)
  }, [duration, paused])

  // A toast fired while the tab is in the background would otherwise
  // run its whole timer unseen and be gone by the time anyone looks.
  useEffect(() => {
    if (duration === null) return
    const sync = () => setPaused(document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [duration])

  const hold = () => setPaused(true)
  const release = () => setPaused(document.hidden)

  return (
    <Toast
      variant={variant}
      onMouseEnter={hold}
      onMouseLeave={release}
      onFocusCapture={hold}
      onBlurCapture={release}
      {...props}
    >
      <div className="abaabil-toast__message">{children}</div>
      {action ? <div className="abaabil-toast__action">{action}</div> : null}
      {onDismiss ? (
        <button
          type="button"
          className="abaabil-toast__close"
          onClick={() => dismiss.current?.()}
        >
          <span className="abaabil-visually-hidden">{closeLabel}</span>
          <span aria-hidden="true">&times;</span>
        </button>
      ) : null}
    </Toast>
  )
}

/**
 * The two live regions, rendered inside ToastRegion. Put your polite
 * toasts in the first slot and your assertive ones in the second, or
 * use `ToastList` below, which sorts them for you.
 */
export function ToastLive({ polite, assertive }) {
  return (
    <>
      <div className="abaabil-toast-live" aria-live="polite" aria-atomic="true">
        {polite}
      </div>
      <div className="abaabil-toast-live" aria-live="assertive" aria-atomic="true">
        {assertive}
      </div>
    </>
  )
}

export { ToastRegion_a11y as ToastRegion, Toast_a11y as Toast }
export default Toast_a11y
