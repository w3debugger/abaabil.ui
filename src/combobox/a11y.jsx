'use client'

import { useId, useState } from 'react'
import './combobox.css'

/**
 * Combobox, a11y tier. Implements the APG 1.2 editable combobox with
 * list autocomplete.
 *
 * Focus stays on the input at all times. This pattern cannot use roving
 * tabindex because the user types while browsing, so the active option is
 * conveyed solely through aria-activedescendant.
 *
 * Uncontrolled in 1.0.0: the input manages its own text, and selection is
 * observed via onChange.
 *
 * @param {object} props
 * @param {Array<{value: string, label: string}>} props.options
 * @param {string} props.label Accessible name for the input.
 * @param {(value: string) => void} [props.onChange]
 */
export default function Combobox_a11y({
  options = [],
  onChange,
  label,
  placeholder,
  className,
  ...props
}) {
  const baseId = useId()
  const listId = `${baseId}-listbox`
  const labelId = `${baseId}-label`
  const optionId = (index) => `${baseId}-option-${index}`

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [selected, setSelected] = useState(null)

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.trim().toLowerCase())
  )

  // An activedescendant pointing at an unrendered option is the classic
  // silent failure, so clamp it against the current filtered list.
  const activeIndex = active >= 0 && active < filtered.length ? active : -1

  const commit = (index) => {
    const option = filtered[index]
    if (!option) return
    setQuery(option.label)
    setSelected(option.value)
    setOpen(false)
    setActive(-1)
    onChange?.(option.value)
  }

  const move = (delta) => {
    if (!filtered.length) return
    setOpen(true)
    setActive((current) => {
      const next = current + delta
      if (next < 0) return filtered.length - 1
      if (next >= filtered.length) return 0
      return next
    })
  }

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowDown': event.preventDefault(); move(1); break
      case 'ArrowUp':   event.preventDefault(); move(-1); break
      case 'Home':      if (open) { event.preventDefault(); setActive(0) } break
      case 'End':       if (open) { event.preventDefault(); setActive(filtered.length - 1) } break
      case 'Enter':     if (open && activeIndex >= 0) { event.preventDefault(); commit(activeIndex) } break
      case 'Escape':
        event.preventDefault()
        if (open) { setOpen(false); setActive(-1) } else { setQuery(''); setSelected(null) }
        break
      case 'Tab':
        if (open && activeIndex >= 0) commit(activeIndex)
        setOpen(false)
        break
      default: break
    }
  }

  const handleBlur = () => {
    setOpen(false)
    setActive(-1)
  }

  const cls = className ? `abaabil-combobox ${className}` : 'abaabil-combobox'
  const count = filtered.length

  return (
    <div className={cls} {...props}>
      <span id={labelId} className="abaabil-combobox__label">{label}</span>
      <input
        className="abaabil-combobox__input"
        type="text"
        role="combobox"
        value={query}
        placeholder={placeholder}
        aria-labelledby={labelId}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(-1) }}
      />

      <ul
        id={listId}
        role="listbox"
        aria-labelledby={labelId}
        className="abaabil-combobox__list"
        hidden={!open || count === 0}
      >
        {filtered.map((o, i) => (
          <li
            key={o.value}
            id={optionId(i)}
            role="option"
            aria-selected={selected === o.value}
            data-active={i === activeIndex}
            className="abaabil-combobox__option"
            onMouseDown={(e) => { e.preventDefault(); commit(i) }}
          >
            {o.label}
          </li>
        ))}
      </ul>

      <div className="abaabil-visually-hidden" aria-live="polite">
        {open ? `${count} result${count === 1 ? '' : 's'}` : ''}
      </div>
    </div>
  )
}
