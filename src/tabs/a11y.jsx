'use client'

import { useId, useRef, useState } from 'react'
import './tabs.css'

/**
 * Tabs, a11y tier. The W3C APG tabs pattern in full.
 *
 * This is the one component in the library whose a11y tier does
 * substantial work, because tabs have no native element behind them.
 * Everything here is something the browser will not do for you:
 *
 * - `role="tablist"` / `role="tab"` / `role="tabpanel"`, with
 *   `aria-selected` on the tabs and `aria-controls`/`aria-labelledby`
 *   pairing each tab with its panel.
 * - Roving tabindex. Exactly one tab is in the tab sequence, so Tab moves
 *   past the whole tablist rather than through every tab in it.
 * - Arrow keys to move between tabs, Home and End to jump to the ends,
 *   wrapping at both ends. The arrows follow `orientation`, and
 *   `aria-orientation` tells assistive tech which pair to expect.
 *
 * Activation is automatic by default: moving focus selects. That is the
 * APG's own recommendation, and it is right whenever showing a panel is
 * cheap. Pass `activation="manual"` when a panel is expensive enough that
 * arrowing across the tablist should not render every one of them; then
 * focus moves without selecting and Enter or Space commits.
 *
 * @param {object} props
 * @param {Array<{key?: string|number, label: import('react').ReactNode, children?: import('react').ReactNode}>} props.items
 * @param {string} [props.label] Accessible name for the tablist, applied
 *   as aria-label.
 * @param {string} [props.labelledBy] Id of an element naming the tablist.
 *   Use this instead of `label` when a visible heading already names it.
 * @param {number} [props.defaultIndex=0]
 * @param {(index: number) => void} [props.onChange]
 * @param {'horizontal'|'vertical'} [props.orientation='horizontal']
 * @param {'automatic'|'manual'} [props.activation='automatic']
 * @param {string} [props.className]
 */
export default function Tabs_a11y({
  items,
  label,
  labelledBy,
  defaultIndex = 0,
  onChange,
  orientation = 'horizontal',
  activation = 'automatic',
  className,
  ...props
}) {
  const [selected, setSelected] = useState(defaultIndex)
  const [focused, setFocused] = useState(defaultIndex)
  const tabRefs = useRef([])
  const baseId = useId()
  const cls = className ? `abaabil-tabs ${className}` : 'abaabil-tabs'

  const tabId = (index) => `${baseId}-tab-${index}`
  const panelId = (index) => `${baseId}-panel-${index}`

  const hasAccessibleName = Boolean(
    label || labelledBy || props['aria-label'] || props['aria-labelledby']
  )

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !hasAccessibleName) {
    console.warn(
      'abaabil/tabs: no `label` or `labelledBy` given, so the tablist has no ' +
        'accessible name. Pass `label`, `labelledBy`, `aria-label`, or `aria-labelledby`.'
    )
  }

  function select(index) {
    setSelected(index)
    onChange?.(index)
  }

  function focusTab(index) {
    setFocused(index)
    tabRefs.current[index]?.focus()
    if (activation === 'automatic') select(index)
  }

  const next = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
  const prev = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'

  function handleKeyDown(event, index) {
    const last = items.length - 1
    let target = null

    if (event.key === next) target = index === last ? 0 : index + 1
    else if (event.key === prev) target = index === 0 ? last : index - 1
    else if (event.key === 'Home') target = 0
    else if (event.key === 'End') target = last
    else if (activation === 'manual' && (event.key === 'Enter' || event.key === ' ')) {
      // The button would fire onClick for these anyway, but only after
      // scrolling the page on Space. Handling them here keeps manual
      // activation from scrolling.
      event.preventDefault()
      select(index)
      return
    } else return

    // Home and End are page-scroll keys by default, and the arrows scroll
    // too once the tablist is inside a scrollable region.
    event.preventDefault()
    focusTab(target)
  }

  return (
    <div className={cls} {...props}>
      <div
        role="tablist"
        aria-label={label}
        aria-labelledby={labelledBy}
        aria-orientation={orientation}
        className="abaabil-tabs__list"
        data-orientation={orientation}
      >
        {items.map((item, index) => (
          <button
            key={item.key ?? index}
            type="button"
            role="tab"
            id={tabId(index)}
            aria-selected={index === selected}
            aria-controls={panelId(index)}
            // Roving tabindex: one stop for the whole tablist.
            tabIndex={index === focused ? 0 : -1}
            ref={(node) => {
              tabRefs.current[index] = node
            }}
            className="abaabil-tabs__tab"
            data-selected={index === selected ? 'true' : undefined}
            onClick={() => {
              setFocused(index)
              select(index)
            }}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) =>
        index === selected ? (
          <div
            key={item.key ?? index}
            role="tabpanel"
            id={panelId(index)}
            aria-labelledby={tabId(index)}
            // Focusable so that a panel whose content has no focusable
            // element of its own is still reachable from the keyboard.
            // APG asks for this only in that case; detecting it would mean
            // measuring the DOM after every render, so it is applied
            // always. The cost is one extra tab stop.
            tabIndex={0}
            className="abaabil-tabs__panel"
          >
            {item.children}
          </div>
        ) : null
      )}
    </div>
  )
}
