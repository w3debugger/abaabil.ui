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
 * `className` and `style` land on the wrapper, `.abaabil-input-group`,
 * which is the flex item in a consumer's layout and so the layout hook.
 * Every other prop (id, name, placeholder, aria-describedby, onChange,
 * ...) lands on the input, the semantic control consumers are actually
 * targeting. A consumer-supplied aria-describedby is preserved and
 * combined with the generated description/error ids rather than replaced.
 *
 * The description and error ids derive from the input id, so a consumer
 * who passes `id="email"` gets `email-description` and `email-error`,
 * the same shape field gives. The error is not a live region, for the
 * reason written out in field/a11y: it is read with the control as part
 * of its description, and a submit that shows several errors at once
 * would otherwise fire several alerts over each other.
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
 * @param {string} [props.className] Merged onto the wrapper's base class.
 * @param {object} [props.style] Applied to the wrapper.
 */
export default function Input_a11y({
  label,
  hideLabel = false,
  description,
  error,
  required = false,
  id,
  className,
  style,
  'aria-describedby': ariaDescribedBy,
  ...props
}) {
  const baseId = useId()
  const inputId = id ?? `${baseId}-input`
  const descriptionId = `${inputId}-description`
  const errorId = `${inputId}-error`

  const hasAccessibleName = Boolean(label || props['aria-label'] || props['aria-labelledby'])

  if (process.env.NODE_ENV !== 'production' && !hasAccessibleName) {
    console.warn(
      'abaabil/input: no `label` given, so the input has no accessible name. ' +
        'Pass `label`, `aria-label`, or `aria-labelledby`.'
    )
  }

  const describedBy =
    [ariaDescribedBy, description ? descriptionId : null, error ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined

  const cls = className ? `abaabil-input-group ${className}` : 'abaabil-input-group'

  return (
    <div className={cls} style={style}>
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
        <div id={errorId} className="abaabil-input__error">
          {error}
        </div>
      ) : null}
    </div>
  )
}
