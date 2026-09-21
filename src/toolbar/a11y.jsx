'use client'

import { useCallback, useEffect, useRef } from 'react'
import './toolbar.css'

// Everything that can hold focus in a toolbar. :not([disabled]) because
// a disabled control is not a stop, and the negative-tabindex exclusion
// keeps our own roving tabindex from counting as a reason to include
// something that was deliberately taken out of the sequence.
const FOCUSABLE = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex^="-"])',
].join(',')

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
  ...props
}) {
  const ref = useRef(null)
  const cls = className ? `abaabil-toolbar ${className}` : 'abaabil-toolbar'

  if (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV !== 'production' &&
    !(label || labelledBy || props['aria-label'] || props['aria-labelledby'])
  ) {
    console.warn(
      'abaabil/toolbar: no `label` or `labelledBy` given, so the toolbar has no ' +
        'accessible name and is announced as an unnamed toolbar.'
    )
  }

  const items = useCallback(
    () => (ref.current ? [...ref.current.querySelectorAll(FOCUSABLE)] : []),
    []
  )

  // Exactly one control is in the tab sequence. Re-applied after every
  // render, because children can change: a control that appears while
  // the toolbar is on screen would otherwise arrive with the default
  // tabindex and quietly add a second stop.
  useEffect(() => {
    const list = items()
    if (!list.length) return
    const alreadyIn = list.find((el) => el.tabIndex === 0)
    const chosen = alreadyIn ?? list[0]
    for (const el of list) el.tabIndex = el === chosen ? 0 : -1
  })

  function move(to) {
    const list = items()
    if (!list.length) return
    const index = Math.max(0, Math.min(to, list.length - 1))
    for (const el of list) el.tabIndex = el === list[index] ? 0 : -1
    list[index].focus()
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

    const next = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
    const prev = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'

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
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  )
}
