'use client'

import { useState } from 'react'

/**
 * Tabs, normal tier. Structure and selection state, no styles, no ARIA,
 * no keyboard handling.
 *
 * Unlike most tiers in this library, this one carries a client boundary.
 * Tabs have no native element behind them, so there is no way to show one
 * panel at a time without state. combobox/index.jsx is a client component
 * for the same reason.
 *
 * Uncontrolled: the selected tab is internal state, observed through
 * `onChange`. Pass `defaultIndex` to choose the initially open tab.
 *
 * @param {object} props
 * @param {Array<{key?: string|number, label: import('react').ReactNode, children?: import('react').ReactNode}>} props.items
 * @param {number} [props.defaultIndex=0] Index selected on first render.
 * @param {(index: number) => void} [props.onChange] Called with the newly
 *   selected index.
 * @param {string} [props.className] Merged with the base class.
 */
export default function Tabs({ items, defaultIndex = 0, onChange, className, ...props }) {
  const [selected, setSelected] = useState(defaultIndex)
  const cls = className ? `abaabil-tabs ${className}` : 'abaabil-tabs'

  function select(index) {
    setSelected(index)
    onChange?.(index)
  }

  return (
    <div className={cls} {...props}>
      <div className="abaabil-tabs__list">
        {items.map((item, index) => (
          <button
            key={item.key ?? index}
            type="button"
            className="abaabil-tabs__tab"
            data-selected={index === selected ? 'true' : undefined}
            onClick={() => select(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) =>
        index === selected ? (
          <div key={item.key ?? index} className="abaabil-tabs__panel">
            {item.children}
          </div>
        ) : null
      )}
    </div>
  )
}
