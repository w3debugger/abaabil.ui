'use client'

import { useEffect, useRef, useState } from 'react'
import './menu.css'
import { anchorNameFor } from './styled.jsx'

/**
 * Menu, a11y tier. The W3C APG menu button pattern, on top of the native
 * Popover API.
 *
 * The split is the point. The browser already gives the panel a top
 * layer, dismissal on an outside click and dismissal on Escape, so none
 * of that is reimplemented here. What the browser does not know is that
 * this panel is a menu, and menus have semantics and keyboard behaviour
 * of their own:
 *
 * - `aria-haspopup="menu"` and a live `aria-expanded` on the trigger,
 *   kept in step with the panel's own `toggle` event rather than with a
 *   second copy of the open state.
 * - `role="menu"` on the panel, `role="menuitem"` on each entry.
 * - A roving tabindex, so Tab leaves the menu instead of walking it.
 * - Up and Down to move with wrapping, Home and End for the ends, and
 *   typeahead: press a letter to jump to the next item starting with it.
 * - Focus moves to the first item when the menu opens, and back to the
 *   trigger when it closes, which is what makes it usable without a
 *   mouse at all.
 *
 * When not to use this. A `role="menu"` is for a list of *actions*, the
 * application-menu sense of the word. A button that reveals a few
 * navigation links is not a menu, it is a popover containing links, and
 * marking it up as a menu makes a screen reader announce a widget the
 * user then cannot use as one. Reach for abaabil/popover there.
 *
 * @param {object} props
 * @param {string} props.id Panel id; also wires the trigger.
 * @param {import('react').ReactNode} props.trigger Button content.
 * @param {Array<{key?: string|number, label: string, href?: string, onSelect?: () => void, disabled?: boolean}>} props.items
 * @param {string} [props.label] Accessible name for the menu itself.
 *   Defaults to nothing, in which case the panel is `aria-labelledby` the
 *   trigger, so the menu is named by whatever the trigger says.
 * @param {object} [props.triggerProps]
 * @param {string} [props.className]
 */
export default function Menu_a11y({
  id,
  trigger,
  items,
  label,
  triggerProps,
  className,
  ...props
}) {
  const panelRef = useRef(null)
  const triggerRef = useRef(null)
  const itemRefs = useRef([])
  const [open, setOpen] = useState(false)
  // The active index lives in a ref as well as in state. State drives the
  // rendered tabindex; the ref is what the key handler reads, because two
  // keydowns arriving in the same tick would both see the same stale
  // state and both move a single step from the same origin. Key repeat
  // does exactly that.
  const [active, setActiveState] = useState(0)
  const activeRef = useRef(0)
  const setActive = (index) => {
    activeRef.current = index
    setActiveState(index)
  }
  const typeahead = useRef({ buffer: '', at: 0 })
  const cls = className ? `abaabil-menu ${className}` : 'abaabil-menu'

  const enabled = items.map((item, index) => (item.disabled ? null : index)).filter((i) => i !== null)
  // The toggle handler is bound once, so it reads the list through a ref:
  // items change between opens (Undo becomes disabled), and a closure over
  // the first render's list would focus a disabled item, which browsers
  // silently refuse, leaving focus on the trigger with dead arrow keys.
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled
  const triggerId = triggerProps?.id ?? `${id}-trigger`

  // The panel's own toggle event is the single source of truth for the
  // open state. Tracking it separately would mean two states that can
  // disagree, and the browser can open or close this without us: an
  // outside click, Escape, or another trigger pointed at the same id.
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    function onToggle(event) {
      const isOpen = event.newState === 'open'
      setOpen(isOpen)
      if (isOpen) {
        const first = enabledRef.current[0] ?? 0
        setActive(first)
        // Synchronously, not inside requestAnimationFrame. The panel is
        // already in the top layer and focusable by the time `toggle`
        // fires, and rAF does not run in a background tab, so deferring
        // to it means focus silently never moves whenever the tab is not
        // the visible one.
        itemRefs.current[first]?.focus()
      } else {
        typeahead.current = { buffer: '', at: 0 }
      }
    }

    panel.addEventListener('toggle', onToggle)
    return () => panel.removeEventListener('toggle', onToggle)
  }, [])

  function close({ restoreFocus = true } = {}) {
    panelRef.current?.hidePopover()
    if (restoreFocus) triggerRef.current?.focus()
  }

  function focusItem(index) {
    setActive(index)
    itemRefs.current[index]?.focus()
  }

  function step(from, delta) {
    if (!enabled.length) return from
    const position = enabled.indexOf(from)
    const next = (position + delta + enabled.length) % enabled.length
    return enabled[next]
  }

  function handleKeyDown(event) {
    const current = activeRef.current

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusItem(step(current, 1))
        return
      case 'ArrowUp':
        event.preventDefault()
        focusItem(step(current, -1))
        return
      case 'Home':
        event.preventDefault()
        focusItem(enabled[0] ?? 0)
        return
      case 'End':
        event.preventDefault()
        focusItem(enabled[enabled.length - 1] ?? 0)
        return
      case 'Tab':
        // APG: Tab closes the menu and continues out of it. Not
        // prevented, so focus carries on to wherever it was going.
        close({ restoreFocus: false })
        return
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
    <>
      <button
        type="button"
        id={triggerId}
        ref={triggerRef}
        popoverTarget={id}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{ anchorName: anchorNameFor(id) }}
        {...triggerProps}
        className={triggerProps?.className ? `abaabil-menu__trigger ${triggerProps.className}` : 'abaabil-menu__trigger'}
      >
        {trigger}
      </button>
      <div
        id={id}
        popover="auto"
        ref={panelRef}
        role="menu"
        aria-label={label}
        aria-labelledby={label ? undefined : triggerId}
        className={cls}
        style={{ positionAnchor: anchorNameFor(id) }}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {items.map((item, index) => {
          const shared = {
            role: 'menuitem',
            className: 'abaabil-menu__item',
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
    </>
  )
}
