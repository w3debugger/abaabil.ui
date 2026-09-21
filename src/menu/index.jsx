/**
 * Menu, normal tier. A button and a panel of actions, built on the same
 * native Popover API as abaabil/popover, so the top layer, light-dismiss
 * and Escape all come from the browser. Structure only: no styles, no
 * ARIA logic, no keyboard handling. Contains no hooks, so it renders in
 * both server and client trees.
 *
 * Like popover, the `id` is required rather than generated, for the same
 * reason: generating it would mean useId, which would mean a client
 * boundary, which would cost these tiers the property that makes them
 * worth having.
 *
 * @param {object} props
 * @param {string} props.id Panel id; also wires the trigger.
 * @param {import('react').ReactNode} props.trigger Button content.
 * @param {Array<{key?: string|number, label: import('react').ReactNode, href?: string, onSelect?: () => void, disabled?: boolean}>} props.items
 * @param {object} [props.triggerProps] Spread onto the trigger button.
 * @param {string} [props.className] Merged onto the panel.
 */
function anchorNameFor(id) {
  return `--abaabil-menu-${String(id).replace(/[^\w-]/g, '-')}`
}

export default function Menu({ id, trigger, items, triggerProps, className, ...props }) {
  const cls = className ? `abaabil-menu ${className}` : 'abaabil-menu'

  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        className="abaabil-menu__trigger"
        style={{ anchorName: anchorNameFor(id) }}
        {...triggerProps}
      >
        {trigger}
      </button>
      <div
        id={id}
        popover="auto"
        className={cls}
        style={{ positionAnchor: anchorNameFor(id) }}
        {...props}
      >
        {items.map((item, index) => (
          <MenuItem key={item.key ?? index} {...item} />
        ))}
      </div>
    </>
  )
}

/**
 * One entry. An action renders a <button>, a link renders an <a>. Both
 * are real elements, so both work before any of this is enhanced.
 */
export function MenuItem({ label, href, onSelect, disabled, className, ...props }) {
  const cls = className ? `abaabil-menu__item ${className}` : 'abaabil-menu__item'

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

export { anchorNameFor }
