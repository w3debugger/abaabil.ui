/**
 * NavigationMenu, normal tier. A <nav> around a list of links, where an
 * entry with children is a <button popovertarget> and a popover panel of
 * more links. Structure only: no styles, no ARIA logic. Contains no
 * hooks, so it renders in both server and client trees.
 *
 * The Popover API supplies everything a dropdown navigation usually pays
 * for in JavaScript: the top layer, opening on click, closing on an
 * outside click, Escape, and one panel open at a time (opening an `auto`
 * popover closes its siblings). CSS anchor positioning puts the panel
 * under its trigger. Nothing here measures the DOM.
 *
 * This is navigation, not a menu. The panels hold links, so no tier sets
 * `role="menu"` or `role="menuitem"`: the APG calls a set of links behind
 * a button a disclosure navigation, and a screen reader told it is a
 * menu widget would then try to operate it as one. abaabil/menu is for
 * actions.
 *
 * `id` is required, as in popover and menu: each panel's id is derived
 * from it, and generating one would mean useId and a client boundary.
 */

/**
 * Turns an arbitrary id into something usable as a CSS dashed-ident, so a
 * malformed anchor-name cannot silently invalidate the declaration.
 */
export function anchorNameFor(id) {
  return `--abaabil-navigation-menu-${String(id).replace(/[^\w-]/g, '-')}`
}

/**
 * @param {object} props
 * @param {string} props.id Required. Panel ids are `${id}-${index}`.
 * @param {Array<{key?: string|number, label: import('react').ReactNode, href?: string, current?: boolean, items?: Array<{key?: string|number, label: import('react').ReactNode, href: string, description?: import('react').ReactNode}>}>} props.items
 *   An entry with `items` renders a trigger and a panel; otherwise a link.
 * @param {string} [props.className] Merged with the base class.
 */
export default function NavigationMenu({ id, items, className, ...props }) {
  const cls = className ? `abaabil-navigation-menu ${className}` : 'abaabil-navigation-menu'

  return (
    <nav className={cls} {...props}>
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
                    className="abaabil-navigation-menu__trigger"
                    style={{ anchorName: anchorNameFor(panelId) }}
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
