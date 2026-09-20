'use client'

import { useEffect, useId, useState } from 'react'
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
 * observed via onChange. onChange is also the only signal when the
 * selection is cleared (Escape while closed), since there is no value prop.
 *
 * Extra props (id, name, required, aria-describedby, autoFocus,
 * onFocus, onClick, onBlur, onKeyDown, ...) land on the input, the
 * semantic control consumers are actually targeting. A consumer-supplied
 * onFocus/onClick/onBlur/onKeyDown composes with this component's own
 * handler rather than replacing it. className composes on the wrapper,
 * since that is the component's root box.
 *
 * @param {object} props
 * @param {Array<{value: string, label: string}>} props.options
 * @param {string} props.label Accessible name for the input.
 * @param {boolean} [props.hideLabel=true] Visually hide the label (it stays
 *   in the accessibility tree either way). Set to false to render it visibly.
 * @param {(value: string|null) => void} [props.onChange]
 */
export default function Combobox_a11y({
  options = [],
  onChange,
  label,
  placeholder,
  className,
  hideLabel = true,
  ...props
}) {
  const baseId = useId()
  const listId = `${baseId}-listbox`
  const labelId = `${baseId}-label`
  const optionId = (index) => `${baseId}-option-${index}`

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !label) {
    console.warn(
      'abaabil/combobox: no `label` given, so the combobox has no accessible name ' +
        'and screen readers announce it as unnamed.'
    )
  }

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
  const count = filtered.length

  // Single source of truth for open-ness: an open list with zero matches
  // is not actually expanded (it renders nothing, and `hidden` agrees),
  // so aria-expanded must say so too.
  const expanded = open && count > 0

  // APG requires the active option be scrolled into view as
  // aria-activedescendant moves, so a long list doesn't strand it
  // off-screen for a sighted keyboard user. block: 'nearest' avoids
  // yanking the page when the option is already visible.
  useEffect(() => {
    if (activeIndex < 0) return
    document.getElementById(optionId(activeIndex))?.scrollIntoView?.({ block: 'nearest' })
  }, [activeIndex])

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
    // Derive from the clamped activeIndex, not the raw active state: if
    // options shrinks between renders, active can be out of range, and
    // moving from a raw out-of-range value produces the wrong wrap.
    const next = activeIndex + delta
    if (next < 0) setActive(filtered.length - 1)
    else if (next >= filtered.length) setActive(0)
    else setActive(next)
  }

  const handleKeyDown = (event) => {
    // An Enter that confirms an IME composition (Arabic, Urdu, CJK, ...)
    // must not be read as "commit the active option".
    if (event.nativeEvent?.isComposing) return

    switch (event.key) {
      case 'ArrowDown': event.preventDefault(); move(1); break
      case 'ArrowUp':   event.preventDefault(); move(-1); break
      case 'Enter':     if (open && activeIndex >= 0) { event.preventDefault(); commit(activeIndex) } break
      case 'Escape':
        event.preventDefault()
        if (open) {
          setOpen(false)
          setActive(-1)
        } else {
          setQuery('')
          setSelected(null)
          // Idempotent: only notify if there was actually something
          // selected to clear, so repeated Escapes on an already-cleared
          // combobox don't emit spurious onChange(null) calls.
          if (selected !== null) onChange?.(null)
        }
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

  return (
    <div className={cls}>
      <span id={labelId} className={hideLabel ? 'abaabil-combobox__label' : 'abaabil-combobox__label--visible'}>
        {label}
      </span>
      <input
        {...props}
        className="abaabil-combobox__input"
        type="text"
        role="combobox"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        aria-labelledby={labelId}
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-activedescendant={expanded && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        onFocus={(e) => { props.onFocus?.(e); setOpen(true) }}
        onClick={(e) => { props.onClick?.(e); setOpen(true) }}
        onBlur={(e) => { props.onBlur?.(e); handleBlur(e) }}
        onKeyDown={(e) => { props.onKeyDown?.(e); handleKeyDown(e) }}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(-1) }}
      />

      <ul
        id={listId}
        role="listbox"
        aria-labelledby={labelId}
        className="abaabil-combobox__list"
        hidden={!expanded}
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
