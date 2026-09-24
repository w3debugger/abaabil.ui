/**
 * ContextMenu, normal tier. A region that owns a menu of actions, opened
 * by right-click (or a long-press on Android, which fires the same
 * `contextmenu` event). Built on the native Popover API, so the top
 * layer, light-dismiss on an outside click and Escape all come from
 * the browser. Structure only: no styles, no ARIA, no keyboard.
 *
 * The decision that makes it small: the panel is positioned by two
 * inline properties written from the event's `clientX`/`clientY`, and
 * clamped to the viewport once, after `showPopover()` has given it a
 * size. No portal, no resize observer, no scroll listener: a popover
 * in the top layer with `position: fixed` stays put on its own, and a
 * scroll or resize light-dismisses it anyway. Physical `left`/`top`
 * rather than logical properties, because pointer coordinates are
 * physical.
 *
 * Contains no hooks, so it carries no directive. It does attach
 * `onContextMenu` unconditionally, so it has to sit below a client
 * boundary: a Server Component cannot pass a function to it.
 *
 * iOS Safari never fires `contextmenu` on long-press. This component
 * does not add a timer to fake one; on iOS the region behaves as a
 * plain region and the actions should be reachable another way.
 *
 * @param {object} props
 * @param {string} props.id Panel id. Required, not generated, for the
 *   same reason as popover and menu: useId would mean a client boundary.
 * @param {Array<{key?: string|number, label: import('react').ReactNode, href?: string, onSelect?: () => void, disabled?: boolean}>} props.items
 *   Same shape as menu's, so the two can share an array.
 * @param {import('react').ReactNode} props.children The region.
 * @param {string} [props.className] Merged onto the wrapping element.
 */
export default function ContextMenu({ id, items, className, children, ...props }) {
  const cls = className ? `abaabil-context-menu ${className}` : 'abaabil-context-menu'

  function onContextMenu(event) {
    event.preventDefault()
    // The panel is always the wrapper's last child. A selector would
    // match a consumer's own popover placed inside the region first.
    openAt(event.currentTarget.lastElementChild, event.clientX, event.clientY)
  }

  return (
    <div className={cls} onContextMenu={onContextMenu} {...props}>
      {children}
      {/* A click inside a popover is not a light-dismiss, so choosing an
          action would leave the menu open without this. */}
      <div id={id} popover="auto" className="abaabil-context-menu__panel" onClick={hide}>
        {items.map((item, index) => (
          <ContextMenuItem key={item.key ?? index} {...item} />
        ))}
      </div>
    </div>
  )
}

function hide(event) {
  event.currentTarget.hidePopover()
}

/**
 * Shows the panel at a viewport point, pulled back inside the viewport
 * if it would overflow. Measured after showing, because a closed
 * popover is display:none and has no size.
 *
 * @param {HTMLElement} panel
 * @param {number} x
 * @param {number} y
 */
export function openAt(panel, x, y) {
  panel.showPopover()
  panel.style.left = `${Math.max(0, Math.min(x, window.innerWidth - panel.offsetWidth))}px`
  panel.style.top = `${Math.max(0, Math.min(y, window.innerHeight - panel.offsetHeight))}px`
}

/**
 * One entry. An action renders a <button>, a link renders an <a>. Both
 * are real elements, so both work before any of this is enhanced.
 */
export function ContextMenuItem({ label, href, onSelect, disabled, className, ...props }) {
  const cls = className ? `abaabil-context-menu__item ${className}` : 'abaabil-context-menu__item'

  if (href) {
    return (
      <a href={href} className={cls} {...props}>
        {label}
      </a>
    )
  }
  return (
    <button type="button" className={cls} onClick={onSelect} disabled={disabled} {...props}>
      {label}
    </button>
  )
}
