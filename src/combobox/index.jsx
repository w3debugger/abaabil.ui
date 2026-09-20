'use client'

import { useState } from 'react'

/**
 * Combobox, normal tier. Structure and behaviour only: open/close,
 * filtering and selection. No ARIA, no keyboard navigation.
 *
 * Uncontrolled in 1.0.0: the input manages its own text internally.
 * Selection is observed via `onChange`, not driven by a `value` prop.
 *
 * Client-only at every tier, because the highlighted option has to be
 * tracked in JS.
 *
 * @param {object} props
 * @param {Array<{value: string, label: string}>} props.options
 * @param {(value: string) => void} [props.onChange]
 */
export default function Combobox({
  options = [],
  onChange,
  placeholder,
  className,
  ...props
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.trim().toLowerCase())
  )

  const select = (option) => {
    setQuery(option.label)
    setOpen(false)
    onChange?.(option.value)
  }

  const cls = className ? `abaabil-combobox ${className}` : 'abaabil-combobox'

  return (
    <div className={cls} {...props}>
      <input
        className="abaabil-combobox__input"
        type="text"
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onBlur={() => setOpen(false)}
      />
      {open && filtered.length > 0 ? (
        <ul className="abaabil-combobox__list">
          {filtered.map((o) => (
            <li
              key={o.value}
              className="abaabil-combobox__option"
              onMouseDown={(e) => { e.preventDefault(); select(o) }}
            >
              {o.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
