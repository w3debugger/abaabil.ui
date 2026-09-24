'use client'

import { useEffect, useRef, useState } from 'react'
import './command.css'
import { filterItems, groupItems } from './styled.jsx'

/**
 * Command, a11y tier. A combobox inside a modal dialog, and nothing
 * invented beyond those two APG patterns.
 *
 * The dialog half is showModal(): focus containment, the inert
 * background, Escape, the top layer, focus moving to the first
 * focusable child on open (the input, because it comes first) and
 * back to the opener on close. Like dialog's a11y tier this adds no
 * focus trap and no focus-restore code; both are the platform's.
 *
 * The combobox half is the APG editable combobox with list
 * autocomplete, the same model combobox/a11y.jsx uses: focus stays on
 * the input, the active option is conveyed through
 * aria-activedescendant, Up and Down wrap and skip disabled options,
 * Home and End jump, Enter chooses. Items are grouped under role=group
 * headings and a polite live region reads the result count, because
 * a screen reader user cannot see the list shrink as they type.
 *
 * Like combobox, this tier renders its own markup instead of wrapping
 * the normal tier: the query and the active option have to live where
 * the ARIA is written, so wrapping would mean duplicating the state
 * rather than the JSX. Links become plain options followed on Enter,
 * because an option with a focusable child is a nested interactive
 * control, which the listbox model forbids.
 *
 * @param {object} props
 * @param {string} props.id Names the dialog and the ids inside it.
 * @param {import('./index.jsx').CommandItem[]} props.items
 * @param {boolean} [props.open=false] Controlled. Drives showModal() and close().
 * @param {() => void} [props.onClose] Fires on Escape, backdrop click, close() and after a choice.
 * @param {() => void} [props.onOpen] Called when `shortcut` is pressed.
 * @param {string} [props.shortcut] A key, for example 'k', bound with Meta or Ctrl on the document.
 * @param {string} props.label Accessible name for the palette and its input.
 * @param {string} [props.placeholder]
 * @param {string} [props.emptyText='No results']
 * @param {string} [props.className]
 */
export default function Command_a11y({
  id,
  items = [],
  open = false,
  onClose,
  onOpen,
  shortcut,
  label,
  placeholder,
  emptyText = 'No results',
  className,
  ...props
}) {
  const ref = useRef(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const labelId = `${id}-label`
  const inputId = `${id}-input`
  const listId = `${id}-listbox`
  const optionId = (i) => `${id}-option-${i}`

  const named = Boolean(label || props['aria-label'] || props['aria-labelledby'])
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !named) {
    console.warn(
      'abaabil/command: no `label` given, so the palette and its search input ' +
        'have no accessible name and screen readers announce them as unnamed.'
    )
  }

  const filtered = filterItems(items, query)
  const count = filtered.length
  // An activedescendant pointing at a filtered-out or disabled option is
  // the silent failure, so clamp to the first enabled one when needed.
  const activeIndex =
    filtered[active] && !filtered[active].disabled ? active : filtered.findIndex((i) => !i.disabled)

  useEffect(() => {
    const el = ref.current
    if (open && !el.open) el.showModal()
    else if (!open && el.open) el.close()
  }, [open])

  useEffect(() => {
    if (!shortcut) return
    const handle = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcut) { e.preventDefault(); onOpen?.() }
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [shortcut, onOpen])

  useEffect(() => {
    if (activeIndex >= 0) document.getElementById(optionId(activeIndex))?.scrollIntoView?.({ block: 'nearest' })
  }, [activeIndex])

  const select = (item) => {
    if (!item || item.disabled) return
    item.onSelect?.(item)
    if (item.href) window.location.href = item.href
    ref.current.close()
  }

  // Step from the current option until an enabled one, wrapping. `from`
  // is -1 or count for Home and End.
  const move = (from, delta) => {
    for (let n = 1; n <= count; n++) {
      const i = (from + delta * n + count) % count
      if (!filtered[i].disabled) return setActive(i)
    }
  }

  const handleKeyDown = (e) => {
    if (e.nativeEvent?.isComposing) return
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); if (count) move(activeIndex, 1); break
      case 'ArrowUp':   e.preventDefault(); if (count) move(activeIndex, -1); break
      case 'Home':      e.preventDefault(); if (count) move(-1, 1); break
      case 'End':       e.preventDefault(); if (count) move(count, -1); break
      case 'Enter':     e.preventDefault(); select(filtered[activeIndex]); break
      case 'Escape':    e.preventDefault(); ref.current.close(); break
      default: break
    }
  }

  const option = (item) => {
    const i = filtered.indexOf(item)
    return (
      <li
        key={item.value ?? item.label}
        id={optionId(i)}
        role="option"
        aria-selected={i === activeIndex}
        aria-disabled={item.disabled || undefined}
        data-disabled={item.disabled || undefined}
        data-active={i === activeIndex}
        className="abaabil-command__option"
        onMouseDown={(e) => { e.preventDefault(); select(item) }}
      >
        {item.label}
      </li>
    )
  }

  const cls = className ? `abaabil-command ${className}` : 'abaabil-command'

  return (
    <dialog
      id={id}
      className={cls}
      aria-labelledby={label ? labelId : undefined}
      onMouseDown={(e) => { if (e.target === ref.current) ref.current.close() }}
      onClose={() => { setQuery(''); setActive(0); onClose?.() }}
      {...props}
      ref={ref}
    >
      <form className="abaabil-command__form" onSubmit={(e) => e.preventDefault()}>
        {label ? <label id={labelId} htmlFor={inputId} className="abaabil-visually-hidden">{label}</label> : null}
        <input
          id={inputId}
          className="abaabil-command__input"
          type="search"
          role="combobox"
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          aria-expanded={count > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
          onChange={(e) => { setQuery(e.target.value); setActive(0) }}
          onKeyDown={handleKeyDown}
        />
        <ul id={listId} role="listbox" aria-labelledby={label ? labelId : undefined} className="abaabil-command__list" hidden={!count}>
          {groupItems(filtered).map(([group, members], gi) =>
            group ? (
              <li key={group} role="group" aria-labelledby={`${id}-group-${gi}`} className="abaabil-command__group">
                <div id={`${id}-group-${gi}`} className="abaabil-command__heading">{group}</div>
                <ul role="presentation" className="abaabil-command__options">{members.map(option)}</ul>
              </li>
            ) : (
              members.map(option)
            )
          )}
        </ul>
        {count ? null : <p className="abaabil-command__empty">{emptyText}</p>}
        <div className="abaabil-visually-hidden" aria-live="polite">
          {open ? `${count} result${count === 1 ? '' : 's'}` : ''}
        </div>
      </form>
    </dialog>
  )
}
