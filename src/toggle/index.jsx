/**
 * Toggle and ToggleGroup, normal tier. Structure only: no styles, no
 * ARIA logic. Contains no hooks, so both render in server and client
 * trees.
 *
 * A Toggle is a button that stays pressed. A ToggleGroup is a row of
 * them where either one or several may be pressed at once.
 *
 * The group is built from radio and checkbox inputs rather than from
 * buttons with aria-pressed, which is the decision that makes this
 * component small. A single-select group of buttons needs roving
 * tabindex, arrow-key handling, wrapping at the ends and a selection
 * that follows focus, all in JavaScript, and that is most of what a
 * toggle group costs in other libraries. A group of radios has every
 * one of those behaviours already, from the browser, in the right
 * order, in every locale, and it submits with a form. So single-select
 * uses radios and multi-select uses checkboxes, both hidden and drawn
 * as buttons by the stylesheet.
 *
 * The standalone Toggle is a real <button> with a `pressed` prop,
 * because a lone toggle has no group to belong to and a button is the
 * honest element for it. It is controlled: the consumer owns `pressed`
 * and handles onClick. An uncontrolled version would need state, and
 * state would mean a hook, and a hook would mean this whole component
 * leaves the server tree for the sake of a boolean the consumer nearly
 * always has anyway.
 */

/**
 * @param {object} props
 * @param {boolean} [props.pressed=false]
 * @param {string} [props.className] Merged with the base class.
 */
export function Toggle({ pressed = false, className, children, ...props }) {
  const cls = className ? `abaabil-toggle ${className}` : 'abaabil-toggle'

  return (
    <button type="button" className={cls} data-pressed={pressed || undefined} {...props}>
      {children}
    </button>
  )
}

/**
 * @param {object} props
 * @param {Array<{value: string, label: import('react').ReactNode, disabled?: boolean}>} props.items
 * @param {string} props.name Form field name. Required: it is what makes
 *   a set of radios one group to the browser.
 * @param {boolean} [props.multiple=false] Checkboxes instead of radios.
 * @param {string|string[]} [props.defaultValue] Initially pressed value,
 *   or values when `multiple`.
 * @param {string} [props.className] Merged onto the wrapping element.
 */
export function ToggleGroup({
  items,
  name,
  multiple = false,
  defaultValue,
  className,
  ...props
}) {
  const cls = className ? `abaabil-toggle-group ${className}` : 'abaabil-toggle-group'
  const type = multiple ? 'checkbox' : 'radio'
  const selected = Array.isArray(defaultValue)
    ? defaultValue
    : defaultValue == null
      ? []
      : [defaultValue]

  return (
    <div className={cls} {...props}>
      {items.map(({ value, label, disabled }) => (
        <label key={value} className="abaabil-toggle-group__item">
          <input
            className="abaabil-toggle-group__input"
            type={type}
            name={name}
            value={value}
            defaultChecked={selected.includes(value)}
            disabled={disabled}
          />
          <span className="abaabil-toggle-group__label">{label}</span>
        </label>
      ))}
    </div>
  )
}

export default ToggleGroup
