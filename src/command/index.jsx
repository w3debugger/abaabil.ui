'use client'

import { useState } from 'react'

/**
 * Command, normal tier. A command palette: a <dialog> holding a search
 * input and the list of actions that match it. Structure and filtering
 * only: no styles, no ARIA, no keyboard model beyond what the input and
 * the form already have.
 *
 * The platform supplies the dialog (`open`, Escape via showModal in the
 * a11y tier, the top layer, the backdrop), the search input (its clear
 * button, its caret handling) and the form (Enter submits, which here
 * picks the first match). What this tier adds is one piece of state,
 * the query, because a list that narrows as you type cannot exist
 * without it. That is the only reason this tier carries a client
 * boundary; tabs and combobox are the precedents.
 *
 * The decision that keeps it small: filtering is a plain function over
 * `label` plus `keywords`, exported so the a11y tier and tests share
 * it, and the open state is the consumer's. `open` is rendered as the
 * native attribute at this tier, so the palette shows non-modally and
 * closes by the consumer flipping the prop. The a11y tier is where
 * showModal() turns it into a real modal.
 *
 * @typedef {object} CommandItem
 * @property {string} label
 * @property {string} [value] Key. Falls back to label.
 * @property {string} [group] Heading the item is listed under.
 * @property {string|string[]} [keywords] Extra terms the filter matches.
 * @property {(item: CommandItem) => void} [onSelect]
 * @property {string} [href] Rendered as a real link.
 * @property {boolean} [disabled]
 */

/**
 * Case-insensitive substring match over label and keywords.
 * @param {CommandItem[]} items
 * @param {string} query
 */
export function filterItems(items, query) {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter((item) =>
    [item.label].concat(item.keywords ?? []).some((s) => s.toLowerCase().includes(q))
  )
}

/**
 * Items in first-seen group order. Ungrouped items share the '' key.
 * @param {CommandItem[]} items
 * @returns {Array<[string, CommandItem[]]>}
 */
export function groupItems(items) {
  const groups = new Map()
  for (const item of items) {
    const key = item.group ?? ''
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(item)
  }
  return [...groups]
}

/**
 * @param {object} props
 * @param {string} props.id Names the dialog. Required, like popover and menu.
 * @param {CommandItem[]} props.items
 * @param {boolean} [props.open=false] Controlled.
 * @param {() => void} [props.onClose] Called after an item is chosen.
 * @param {string} [props.placeholder]
 * @param {string} [props.emptyText='No results']
 * @param {string} [props.className] Merged with the base class.
 */
export default function Command({
  id,
  items = [],
  open = false,
  onClose,
  placeholder,
  emptyText = 'No results',
  className,
  ...props
}) {
  const [query, setQuery] = useState('')
  const filtered = filterItems(items, query)
  const cls = className ? `abaabil-command ${className}` : 'abaabil-command'

  const select = (item) => {
    if (item.disabled) return
    item.onSelect?.(item)
    setQuery('')
    onClose?.()
  }

  const option = (item) => (
    <li
      key={item.value ?? item.label}
      className="abaabil-command__option"
      data-disabled={item.disabled || undefined}
      onClick={() => select(item)}
    >
      {item.href ? <a className="abaabil-command__link" href={item.href}>{item.label}</a> : item.label}
    </li>
  )

  return (
    <dialog id={id} className={cls} open={open} onClose={() => { setQuery(''); onClose?.() }} {...props}>
      <form
        className="abaabil-command__form"
        onSubmit={(e) => { e.preventDefault(); const first = filtered.find((i) => !i.disabled); if (first) select(first) }}
      >
        <input
          className="abaabil-command__input"
          type="search"
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {filtered.length ? (
          <ul className="abaabil-command__list">
            {groupItems(filtered).map(([group, members]) =>
              group ? (
                <li key={group} className="abaabil-command__group">
                  <div className="abaabil-command__heading">{group}</div>
                  <ul className="abaabil-command__options">{members.map(option)}</ul>
                </li>
              ) : (
                members.map(option)
              )
            )}
          </ul>
        ) : (
          <p className="abaabil-command__empty">{emptyText}</p>
        )}
      </form>
    </dialog>
  )
}
