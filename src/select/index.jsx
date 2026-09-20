/**
 * Select, normal tier. A native <select> and nothing else: no ARIA, no
 * custom listbox, no hooks. Renders in a server tree.
 *
 * Accepts `options` as an array of {value, label} for convenience. Callers
 * who need <optgroup> or custom <option> markup pass `children` instead;
 * `options` is only consulted when it is actually given, so the two never
 * fight over which one renders.
 *
 * @param {object} props
 * @param {Array<{value: string, label: string}>} [props.options]
 * @param {React.ReactNode} [props.children]
 * @param {string} [props.className] Merged with the base class.
 */
export default function Select({ options, className, children, ...props }) {
  const cls = className ? `abaabil-select ${className}` : 'abaabil-select'

  return (
    <select className={cls} {...props}>
      {options
        ? options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        : children}
    </select>
  )
}
