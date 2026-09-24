'use client'

import { useRef, useState } from 'react'
import './context-menu.css'
import { openAt } from './styled.jsx'

/**
 * ContextMenu, a11y tier. The W3C APG menu pattern inside the panel,
 * plus the two ways a keyboard opens a context menu.
 *
 * The browser gives the panel a top layer, light-dismiss and Escape. What
 * it does not know is that this is a menu, so this tier adds
 * `role="menu"` named by `label`, `role="menuitem"` on each entry, a
 * roving tabindex, Up/Down with wrapping, Home/End, multi-character
 * typeahead, Tab to close, and focus moving to the first item on open
 * and back to wherever it was on close. Enter and Space need nothing:
 * the items are real buttons and links.
 *
 * Opening: Shift+F10 or the ContextMenu key anywhere in the region opens
 * the panel at the region's top-left corner. The wrapper gets
 * `tabIndex={0}` so a region with nothing focusable in it is still
 * reachable; pass `tabIndex={-1}` if it already contains the tab stop
 * you want. No `aria-haspopup` on the region: that attribute describes
 * a control, and a region is not one.
 *
 * The keyboard handling is a port of the sixty lines in menu/a11y.jsx
 * rather than a shared helper. A helper module was measured: the hook
 * interface costs more than gzip saves by deduplicating within one
 * file, so a consumer of one menu pays about 250 B more and only a
 * consumer of both saves anything, about 90 B.
 *
 * iOS Safari fires no `contextmenu` on long-press; see index.jsx.
 *
 * @param {object} props
 * @param {string} props.id Panel id.
 * @param {Array<{key?: string|number, label: string, href?: string, onSelect?: () => void, disabled?: boolean}>} props.items
 * @param {string} [props.label] Accessible name for the menu.
 * @param {import('react').ReactNode} props.children The region.
 * @param {string} [props.className]
 */
export default function ContextMenu_a11y({ id, items, label, className, children, ...props }) {
  const panelRef = useRef(null)
  const itemRefs = useRef([])
  const returnFocus = useRef(null)
  // State drives the rendered tabindex; the ref is what the key handler
  // reads, so two keydowns in one tick (key repeat) do not both step
  // from the same stale index.
  const [active, setActiveState] = useState(0)
  const activeRef = useRef(0)
  const setActive = (index) => {
    activeRef.current = index
    setActiveState(index)
  }
  const typeahead = useRef({ buffer: '', at: 0 })
  const cls = className ? `abaabil-context-menu ${className}` : 'abaabil-context-menu'

  if (process.env.NODE_ENV !== 'production' && !label) {
    console.warn(
      'abaabil/context-menu: no `label` given, so the menu has no accessible ' +
        'name and screen readers announce it as an unnamed menu.'
    )
  }

  const enabled = items.map((item, index) => (item.disabled ? null : index)).filter((i) => i !== null)

  function focusItem(index) {
    setActive(index)
    itemRefs.current[index]?.focus()
  }

  function open(x, y) {
    returnFocus.current = document.activeElement
    openAt(panelRef.current, x, y)
    focusItem(enabled[0] ?? 0)
  }

  function close({ restoreFocus = true } = {}) {
    panelRef.current.hidePopover()
    typeahead.current = { buffer: '', at: 0 }
    if (restoreFocus) returnFocus.current?.focus()
  }

  function onContextMenu(event) {
    event.preventDefault()
    open(event.clientX, event.clientY)
  }

  function step(from, delta) {
    if (!enabled.length) return from
    const next = (enabled.indexOf(from) + delta + enabled.length) % enabled.length
    return enabled[next]
  }

  function onKeyDown(event) {
    // Keys bubble here from both the region and the panel inside it.
    if (!panelRef.current.contains(event.target)) {
      if ((event.key === 'F10' && event.shiftKey) || event.key === 'ContextMenu') {
        event.preventDefault()
        const { left, top } = event.currentTarget.getBoundingClientRect()
        open(left, top)
      }
      return
    }

    const current = activeRef.current
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        return focusItem(step(current, 1))
      case 'ArrowUp':
        event.preventDefault()
        return focusItem(step(current, -1))
      case 'Home':
        event.preventDefault()
        return focusItem(enabled[0] ?? 0)
      case 'End':
        event.preventDefault()
        return focusItem(enabled[enabled.length - 1] ?? 0)
      case 'Escape':
        event.preventDefault()
        return close()
      case 'Tab':
        // APG: Tab closes and carries on out. Not prevented.
        return close({ restoreFocus: false })
      default:
        break
    }

    // Typeahead. Single printable characters only, so shortcuts with a
    // modifier still reach the browser.
    if (event.key.length !== 1 || event.metaKey || event.ctrlKey || event.altKey) return
    const now = Date.now()
    const state = typeahead.current
    state.buffer = now - state.at > 500 ? event.key : state.buffer + event.key
    state.at = now

    const query = state.buffer.toLowerCase()
    const from = enabled.indexOf(current) + 1
    const order = [...enabled.slice(from), ...enabled.slice(0, from)]
    const hit = order.find((i) => String(items[i].label).toLowerCase().startsWith(query))
    if (hit !== undefined) {
      event.preventDefault()
      focusItem(hit)
    }
  }

  return (
    <div className={cls} tabIndex={0} onContextMenu={onContextMenu} onKeyDown={onKeyDown} {...props}>
      {children}
      <div id={id} popover="auto" ref={panelRef} role="menu" aria-label={label} className="abaabil-context-menu__panel">
        {items.map((item, index) => {
          const shared = {
            role: 'menuitem',
            className: 'abaabil-context-menu__item',
            tabIndex: index === active ? 0 : -1,
            ref: (node) => { itemRefs.current[index] = node },
            onFocus: () => setActive(index),
          }

          if (item.href) {
            // A disabled link keeps its element and role but loses the
            // href, so it is neither followed nor announced as a link.
            return (
              <a
                key={item.key ?? index}
                href={item.disabled ? undefined : item.href}
                aria-disabled={item.disabled || undefined}
                {...shared}
                onClick={item.disabled ? undefined : () => close({ restoreFocus: false })}
              >
                {item.label}
              </a>
            )
          }
          return (
            <button
              key={item.key ?? index}
              type="button"
              disabled={item.disabled}
              {...shared}
              onClick={() => {
                item.onSelect?.()
                close()
              }}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
