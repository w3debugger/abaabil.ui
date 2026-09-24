'use client'

import { useEffect, useRef } from 'react'
import './toolbar.css'

// Everything that can hold focus in a toolbar. :not([disabled]) because
// a disabled control is not a stop, and that applies to the tabindex
// clause too, since every control here carries one of ours. No sign
// check on it: the roving tabindex writes -1 onto every control but
// one, so excluding negative values orphaned any custom focusable (a
// div with tabindex="0" and a role) after the first render.
const FOCUSABLE = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([disabled])',
].join(',')

// The missing-name warning fires once per page load, not once per render.
let warned

/**
 * Toolbar, a11y tier. The W3C APG toolbar pattern.
 *
 * The point of the pattern is the tab sequence. A row of eight buttons
 * is eight stops on the way to the rest of the page; as a toolbar it is
 * one, and the arrow keys move between the controls inside it. That is
 * the whole reason to reach for `role="toolbar"`, and a toolbar that
 * does not do it is just a div with a role on it.
 *
 * So this tier adds `role="toolbar"`, `aria-orientation`, a roving
 * tabindex over the focusable descendants, arrow keys following the
 * orientation, and Home/End.
 *
 * It manages `tabindex` on its descendants directly, rather than
 * cloning children or asking for an `items` array. A toolbar holds
 * arbitrary markup, often several levels deep, and cloning only reaches
 * the top level. The cost is that the DOM is the source of truth for
 * what is focusable, which is re-read on every keystroke so that
 * controls appearing, disappearing or becoming disabled are picked up
 * without anything having to tell us.
 *
 * The one stop follows the user: a click or a programmatic focus on a
 * control makes it the stop, so Shift+Tab leaves the toolbar and the
 * next Tab in returns to the last used control (APG). A control that
 * disables itself from its own state is caught by a MutationObserver
 * on `disabled`, so the stop moves off it without the toolbar having
 * to re-render.
 *
 * Right-to-left: the arrows follow the visual direction, read from the
 * toolbar's computed `direction` at keydown.
 *
 * @param {object} props
 * @param {string} [props.label] Accessible name. A toolbar with no name
 *   is announced as "toolbar" and nothing else.
 * @param {string} [props.labelledBy] Id of an element naming it, when a
 *   visible heading already does.
 * @param {'horizontal'|'vertical'} [props.orientation='horizontal']
 * @param {string} [props.className]
 */
export default function Toolbar_a11y({
  label,
  labelledBy,
  orientation = 'horizontal',
  className,
  children,
  onKeyDown,
  onFocus,
  ...props
}) {
  const ref = useRef(null)
  const cls = className ? `abaabil-toolbar ${className}` : 'abaabil-toolbar'

  if (
    process.env.NODE_ENV !== 'production' &&
    !warned &&
    !(label || labelledBy || props['aria-label'] || props['aria-labelledby'])
  ) {
    warned = true
    console.warn(
      'abaabil/toolbar: no `label` or `labelledBy` given, so the toolbar has no ' +
        'accessible name and is announced as an unnamed toolbar.'
    )
  }

  const items = () => (ref.current ? [...ref.current.querySelectorAll(FOCUSABLE)] : [])

  // Exactly one control is in the tab sequence: `chosen` when it is a
  // focusable in the toolbar, else whichever already holds the stop,
  // else the first.
  function sync(chosen) {
    const list = items()
    if (!list.length) return
    if (!list.includes(chosen)) chosen = list.find((el) => el.tabIndex === 0) ?? list[0]
    for (const el of list) el.tabIndex = el === chosen ? 0 : -1
  }

  // Re-applied after every render, because children can change: a
  // control that appears while the toolbar is on screen would otherwise
  // arrive with the default tabindex and quietly add a second stop.
  useEffect(sync)

  // And when a control disables itself without a toolbar render, so the
  // stop never sits on a control that Tab would skip.
  useEffect(() => {
    const observer = new MutationObserver(() => sync())
    observer.observe(ref.current, { attributes: true, attributeFilter: ['disabled'], subtree: true })
    return () => observer.disconnect()
  }, [])

  function move(to) {
    const list = items()
    if (!list.length) return
    const target = list[Math.max(0, Math.min(to, list.length - 1))]
    sync(target)
    target.focus()
  }

  function handleKeyDown(event) {
    // Let a control that uses the arrows itself keep them. A select or
    // a text field inside a toolbar would otherwise be unusable, since
    // every arrow press would leave it.
    const el = event.target
    const tag = el.tagName
    const usesArrowsItself =
      tag === 'SELECT' ||
      tag === 'TEXTAREA' ||
      (tag === 'INPUT' && !['button', 'checkbox', 'radio', 'submit', 'reset'].includes(el.type))
    if (usesArrowsItself) return

    const list = items()
    const at = list.indexOf(el)
    if (at === -1) return

    const vertical = orientation === 'vertical'
    const rtl = !vertical && getComputedStyle(event.currentTarget).direction === 'rtl'
    const next = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
    const prev = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'

    let target = null
    if (event.key === next) target = at === list.length - 1 ? 0 : at + 1
    else if (event.key === prev) target = at === 0 ? list.length - 1 : at - 1
    else if (event.key === 'Home') target = 0
    else if (event.key === 'End') target = list.length - 1
    else return

    // Home and End scroll the page; the arrows scroll it too once the
    // toolbar is inside anything scrollable.
    event.preventDefault()
    move(target)
  }

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-orientation={orientation}
      data-orientation={orientation}
      className={cls}
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        handleKeyDown(event)
      }}
      onFocus={(event) => {
        onFocus?.(event)
        sync(event.target)
      }}
    >
      {children}
    </div>
  )
}
