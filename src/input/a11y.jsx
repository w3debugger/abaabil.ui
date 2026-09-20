'use client'

import { useId } from 'react'
import './input.css'
import Input from './styled.jsx'

/**
 * Input, a11y tier. Adds the label, description and error wiring that
 * teams get wrong by hand: a real <label>, aria-describedby pointing at
 * whichever of description/error actually exist, aria-invalid, and a dev
 * warning when the input would have no accessible name.
 *
 * Uses useId to mint stable, unique ids for the label and the description
 * and error text, so this tier needs a client tree.
 *
 * Extra props (id, name, placeholder, aria-describedby, onChange, ...)
 * land on the input, the semantic control consumers are actually
 * targeting. A consumer-supplied aria-describedby is preserved and
 * combined with the generated description/error ids rather than replaced.
 *
 * @param {object} props
 * @param {string} [props.label] Rendered as a real <label>, associated
 *   with the input via htmlFor/id.
 * @param {boolean} [props.hideLabel=false] Visually hide the label (it stays
 *   in the accessibility tree either way, still a real <label> associated
 *   via htmlFor/id). Set to false to render it visibly. Matches combobox's
 *   `hideLabel` semantics and default.
 * @param {string} [props.description] Rendered as help text and wired
 *   into aria-describedby.
 * @param {string} [props.error] Rendered as an error message, sets
 *   aria-invalid, and is wired into aria-describedby alongside the
 *   description.
 * @param {boolean} [props.required=false]
 * @param {string} [props.id] Overrides the generated input id.
 */
export default function Input_a11y({
  label,
  hideLabel = false,
  description,
  error,
  required = false,
  id,
  'aria-describedby': ariaDescribedBy,
  ...props
}) {
  const baseId = useId()
  const inputId = id ?? `${baseId}-input`
  const descriptionId = `${baseId}-description`
  const errorId = `${baseId}-error`

  const hasAccessibleName = Boolean(label || props['aria-label'] || props['aria-labelledby'])

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !hasAccessibleName) {
    console.warn(
      'abaabil/input: no `label` given, so the input has no accessible name. ' +
        'Pass `label`, `aria-label`, or `aria-labelledby`.'
    )
  }

  const describedBy =
    [ariaDescribedBy, description ? descriptionId : null, error ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <div className="abaabil-input-group">
      {label ? (
        <label
          htmlFor={inputId}
          className={hideLabel ? 'abaabil-input__label abaabil-visually-hidden' : 'abaabil-input__label'}
        >
          {label}
        </label>
      ) : null}
      <Input
        {...props}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      {description ? (
        <div id={descriptionId} className="abaabil-input__description">
          {description}
        </div>
      ) : null}
      {error ? (
        <div id={errorId} className="abaabil-input__error" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  )
}
