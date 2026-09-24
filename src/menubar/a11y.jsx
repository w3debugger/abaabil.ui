'use client'

import { useEffect, useRef } from 'react'
import './menubar.css'

// The one coupling this component is built on: abaabil/menu marks its
// trigger button with this class, and the menubar reads it to find the
// row it roves over. It is read from the DOM rather than imported from
// ../menu so that this entry point does not pull a second copy of the
// menu's code and stylesheet into the bundle.
const TRIGGER = '.abaabil-menu__trigger:not([disabled])'

/**
 * Menubar, a11y tier. The W3C APG menubar pattern, on top of a row of
 * abaabil/menu instances.
 *
 * Each menu already has the menu button pattern: `aria-haspopup`, a live
 * `aria-expanded`, `role="menu"` on the panel, Up and Down inside it,
 * Escape and light dismiss from the Popover API. What a bar adds is the
 * sideways axis: `role="menubar"`, `role="menuitem"` on each trigger, one
 * tab stop for the whole row, Left and Right moving between the menus
 * with wrapping, Home and End, and Down opening the focused menu. While
 * a menu is open, Left and Right close it and open its neighbour, so a
 * keyboard user can sweep across File, Edit, View the way a mouse user
 * drags across them.
 *
 * The triggers are found in the DOM and their `tabindex` and role are
 * written there directly, the toolbar approach, rather than by cloning
 * children. A key pressed inside an open panel bubbles up to the bar as
 * well; the bar leaves anything the menu already claimed alone by
 * checking `defaultPrevented`, which is how Home and End keep meaning
 * "first and last item" while a menu is open and "first and last menu"
 * while none is.
 *
 * @param {object} props
 * @param {string} [props.label] Accessible name. A menubar with no name
 *   is announced as "menu bar" and nothing else.
 * @param {string} [props.className]
 */
export default function Menubar_a11y({ label, className, children, ...props }) {
  const ref = useRef(null)
  const cls = className ? `abaabil-menubar ${className}` : 'abaabil-menubar'

  if (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV !== 'production' &&
    !(label || props['aria-label'] || props['aria-labelledby'])
  ) {
    console.warn(
      'abaabil/menubar: no `label` given, so the menubar has no accessible ' +
        'name and is announced as an unnamed menu bar.'
    )
  }

  const triggers = () => (ref.current ? [...ref.current.querySelectorAll(TRIGGER)] : [])

  // Exactly one trigger is in the tab sequence. Re-applied after every
  // render so a menu that appears later does not arrive as a second stop.
  useEffect(() => {
    const list = triggers()
    const chosen = list.find((el) => el.tabIndex === 0) ?? list[0]
    for (const el of list) {
      el.tabIndex = el === chosen ? 0 : -1
      el.setAttribute('role', 'menuitem')
    }
  })

  const panelOf = (trigger) => document.getElementById(trigger.getAttribute('popovertarget'))

  function handleKeyDown(event) {
    if (event.defaultPrevented) return
    const list = triggers()
    const open = list.find((el) => el.getAttribute('aria-expanded') === 'true')
    const at = list.indexOf(open ?? event.target)
    if (at === -1) return

    let to
    if (event.key === 'ArrowRight') to = (at + 1) % list.length
    else if (event.key === 'ArrowLeft') to = (at + list.length - 1) % list.length
    else if (event.key === 'Home') to = 0
    else if (event.key === 'End') to = list.length - 1
    else if (event.key === 'ArrowDown' && !open) to = at
    else return

    event.preventDefault()
    for (const el of list) el.tabIndex = el === list[to] ? 0 : -1
    // Focus the trigger before opening, so the browser's own "restore
    // focus on hide" lands back on the right menu after Escape.
    list[to].focus()
    if (open) panelOf(open).hidePopover()
    if (open || event.key === 'ArrowDown') panelOf(list[to]).showPopover()
  }

  return (
    <div
      ref={ref}
      role="menubar"
      aria-label={label}
      aria-orientation="horizontal"
      className={cls}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  )
}
