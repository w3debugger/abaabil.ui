'use client'

import { useId } from 'react'
import './switch.css'
import Switch from './styled.jsx'

/**
 * Switch, a11y tier. Adds a real associated <label>, an optional
 * description wired through aria-describedby, and a dev warning when the
 * switch would have no accessible name.
 *
 * Uses useId to mint stable, unique ids, so this tier needs a client tree.
 *
 * A consumer-supplied aria-describedby is preserved and combined with the
 * generated description id rather than replaced.
 *
 * There is deliberately no on/off text rendered beside the control. A
 * switch already announces its state ("on"/"off") from the native checked
 * property, and painting the same state as adjacent text means a screen
 * reader hears it twice. If you want visible state text, render it
 * yourself and mark it aria-hidden.
 *
 * @param {object} props
 * @param {string} props.label Accessible name. The platform does not supply one.
 * @param {string} [props.description] Rendered text, wired via aria-describedby.
 * @param {string} [props.id] Overrides the generated input id.
 */
export default function Switch_a11y({
  label,
  description,
  id,
  'aria-describedby': ariaDescribedBy,
  ...props
}) {
  const baseId = useId()
  const inputId = id ?? `${baseId}-switch`
  const descriptionId = `${baseId}-description`

  const hasAccessibleName = Boolean(label || props['aria-label'] || props['aria-labelledby'])

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !hasAccessibleName) {
    console.warn(
      'abaabil/switch: no `label` given, so the switch has no accessible name ' +
        'and screen readers announce it as unnamed.'
    )
  }

  const describedBy =
    [ariaDescribedBy, description ? descriptionId : null].filter(Boolean).join(' ') || undefined

  return (
    <span className="abaabil-switch__wrapper">
      <Switch {...props} id={inputId} aria-describedby={describedBy} />
      {label ? (
        <label htmlFor={inputId} className="abaabil-switch__label">
          {label}
        </label>
      ) : null}
      {description ? (
        <span id={descriptionId} className="abaabil-switch__description">
          {description}
        </span>
      ) : null}
    </span>
  )
}
