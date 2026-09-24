'use client'

import { useEffect, useRef, useState } from 'react'
import './navigation-menu.css'
import { anchorNameFor } from './styled.jsx'

/**
 * NavigationMenu, a11y tier. The APG disclosure navigation pattern, on
 * top of the native Popover API.
 *
 * The browser already opens the panel, closes it on an outside click or
 * Escape, keeps one open at a time and puts it in the top layer, so none
 * of that is here. What it does not do is say so: this tier adds a name
 * for the <nav>, `aria-current="page"` on the current link, and a live
 * `aria-expanded` on every trigger, read from the panels' own `toggle`
 * events through one capturing listener on the nav (toggle does not
 * bubble, but it does capture).
 *
 * Keyboard: Tab walks the links and triggers in order and, inside an
 * open panel, its links. ArrowDown on a trigger opens the panel and
 * focuses its first link; ArrowUp or Escape inside a panel closes it and
 * returns focus to the trigger. That is the whole model. There is no
 * roving tabindex and no arrow movement along the top row: these are
 * links, and the APG reserves that behaviour for menubars of actions.
 *
 * `aria-haspopup` is deliberately absent. Its default value is "menu",
 * which is exactly the widget this is not.
 *
 * @param {object} props
 * @param {string} props.id Required. Panel ids are `${id}-${index}`.
 * @param {Array<{key?: string|number, label: import('react').ReactNode, href?: string, current?: boolean, items?: Array<{key?: string|number, label: import('react').ReactNode, href: string, description?: import('react').ReactNode}>}>} props.items
 * @param {string} [props.label] Accessible name for the nav.
 * @param {boolean} [props.openOnHover=false] Also open a panel after the
 *   pointer rests on its trigger for 150ms. Click still works.
 * @param {string} [props.className]
 */
export default function NavigationMenu_a11y({
  id,
  items,
  label,
  openOnHover = false,
  className,
  ...props
}) {
  const navRef = useRef(null)
  const timer = useRef(0)
  const [openId, setOpenId] = useState(null)
  const cls = className ? `abaabil-navigation-menu ${className}` : 'abaabil-navigation-menu'

  const named = Boolean(label || props['aria-label'] || props['aria-labelledby'])
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !named) {
    console.warn(
      'abaabil/navigation-menu: no `label` given. That is fine on a page ' +
        'with one <nav>; with several, screen readers announce each as ' +
        '"navigation" and nothing tells them apart. Pass `label` to name this one.'
    )
  }

  // The panels' own toggle events are the single source of truth for
  // which one is open: the browser opens and closes them without us.
  useEffect(() => {
    const nav = navRef.current
    function onToggle(event) {
      const panelId = event.target.id
      setOpenId((prev) =>
        event.newState === 'open' ? panelId : prev === panelId ? null : prev
      )
    }
    nav.addEventListener('toggle', onToggle, true)
    return () => nav.removeEventListener('toggle', onToggle, true)
  }, [])

  function handleKeyDown(event) {
    const el = event.target
    if (event.key === 'ArrowDown' && el.classList.contains('abaabil-navigation-menu__trigger')) {
      event.preventDefault()
      const panel = el.nextElementSibling
      panel.showPopover()
      panel.querySelector('a')?.focus()
      return
    }
    if (event.key === 'ArrowUp' || event.key === 'Escape') {
      const panel = el.closest('.abaabil-navigation-menu__panel')
      if (!panel) return
      event.preventDefault()
      panel.hidePopover()
      panel.previousElementSibling.focus()
    }
  }

  // Not on touch: there, pointerenter and click arrive together, and a
  // timer firing after the click would reopen what the tap just closed.
  const hover = openOnHover && {
    onPointerEnter(event) {
      if (event.pointerType === 'touch') return
      const panel = event.currentTarget.nextElementSibling
      timer.current = setTimeout(() => panel.showPopover(), 150)
    },
    onPointerLeave: () => clearTimeout(timer.current),
  }

  return (
    <nav ref={navRef} className={cls} aria-label={label} onKeyDown={handleKeyDown} {...props}>
      <ul className="abaabil-navigation-menu__list">
        {items.map((item, index) => {
          const panelId = `${id}-${index}`
          return (
            <li key={item.key ?? index}>
              {item.items ? (
                <>
                  <button
                    type="button"
                    popoverTarget={panelId}
                    aria-expanded={openId === panelId}
                    className="abaabil-navigation-menu__trigger"
                    style={{ anchorName: anchorNameFor(panelId) }}
                    {...hover}
                  >
                    {item.label}
                  </button>
                  <div
                    id={panelId}
                    popover="auto"
                    className="abaabil-navigation-menu__panel"
                    style={{ positionAnchor: anchorNameFor(panelId) }}
                  >
                    <ul className="abaabil-navigation-menu__panel-list">
                      {item.items.map((sub, i) => (
                        <li key={sub.key ?? i}>
                          <a href={sub.href} className="abaabil-navigation-menu__panel-link">
                            {sub.label}
                            {sub.description ? (
                              <span className="abaabil-navigation-menu__description">{sub.description}</span>
                            ) : null}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <a
                  href={item.href}
                  className="abaabil-navigation-menu__link"
                  data-current={item.current || undefined}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </a>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
