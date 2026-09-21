'use client'

import { useId } from 'react'
import './textarea.css'
import Textarea from './styled.jsx'

/**
 * Textarea, a11y tier. The same label, description and error wiring as
 * input/a11y, on a <textarea>: a real <label>, aria-describedby pointing
 * at whichever of description/error actually exist, aria-invalid, and a
 * dev warning when the field would have no accessible name.
 *
 * Uses useId to mint stable, unique ids, so this tier needs a client tree.
 *
 * Extra props (id, name, placeholder, maxLength, onChange, ...) land on
 * the textarea, the semantic control consumers are actually targeting. A
 * consumer-supplied aria-describedby is preserved and combined with the
 * generated description/error ids rather than replaced.
 *
 * @param {object} props
 * @param {string} [props.label] Rendered as a real <label>, associated
 *   with the textarea via htmlFor/id.
 * @param {boolean} [props.hideLabel=false] Visually hide the label. It stays
 *   in the accessibility tree either way, still a real <label> associated
 *   via htmlFor/id.
 * @param {string} [props.description] Rendered as help text and wired
 *   into aria-describedby.
 * @param {string} [props.error] Rendered as an error message, sets
 *   aria-invalid, and is wired into aria-describedby alongside the
 *   description.
 * @param {boolean} [props.required=false]
 * @param {string} [props.id] Overrides the generated textarea id.
 */
export default function Textarea_a11y({
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
  const textareaId = id ?? `${baseId}-textarea`
  const descriptionId = `${baseId}-description`
  const errorId = `${baseId}-error`

  const hasAccessibleName = Boolean(label || props['aria-label'] || props['aria-labelledby'])

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !hasAccessibleName) {
    console.warn(
      'abaabil/textarea: no `label` given, so the textarea has no accessible name. ' +
        'Pass `label`, `aria-label`, or `aria-labelledby`.'
    )
  }

  const describedBy =
    [ariaDescribedBy, description ? descriptionId : null, error ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <div className="abaabil-textarea-group">
      {label ? (
        <label
          htmlFor={textareaId}
          className={
            hideLabel ? 'abaabil-textarea__label abaabil-visually-hidden' : 'abaabil-textarea__label'
          }
        >
          {label}
        </label>
      ) : null}
      <Textarea
        {...props}
        id={textareaId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      {description ? (
        <div id={descriptionId} className="abaabil-textarea__description">
          {description}
        </div>
      ) : null}
      {error ? (
        <div id={errorId} className="abaabil-textarea__error" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  )
}
