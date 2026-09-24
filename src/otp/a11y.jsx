'use client'

import { useId } from 'react'
import './otp.css'
import Otp from './styled.jsx'

/**
 * Otp, a11y tier. Adds the same wiring as input's a11y tier: a real
 * <label>, aria-describedby pointing at whichever of description/error
 * exist, aria-invalid, and a dev warning when the field would have no
 * accessible name. Uses useId for the ids, so this tier needs a client
 * tree.
 *
 * `onComplete` is the one addition: it fires with the value from an
 * onInput handler the moment the entry reaches `length`, whether that
 * came from typing, paste or SMS autofill. No state is kept for it, so
 * the field stays uncontrolled and the consumer's own onInput still
 * runs. Nothing extra is announced: a single text field with a label
 * needs no live region.
 *
 * @param {object} props
 * @param {string} [props.label] Rendered as a real <label>, associated
 *   with the input via htmlFor/id.
 * @param {boolean} [props.hideLabel=false] Visually hide the label (it
 *   stays in the accessibility tree, still a real <label>).
 * @param {string} [props.description] Help text wired into aria-describedby.
 * @param {string} [props.error] Error message, sets aria-invalid, and is
 *   wired into aria-describedby alongside the description.
 * @param {boolean} [props.required=false]
 * @param {string} [props.id] Overrides the generated input id.
 * @param {number} [props.length=6]
 * @param {(value: string) => void} [props.onComplete] Called with the
 *   value when the entry reaches `length`.
 */
export default function Otp_a11y({
  label,
  hideLabel = false,
  description,
  error,
  required = false,
  id,
  length = 6,
  onComplete,
  onInput,
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
      'abaabil/otp: no `label` given, so the code field has no accessible name. ' +
        'Pass `label`, `aria-label`, or `aria-labelledby`.'
    )
  }

  const describedBy =
    [ariaDescribedBy, description ? descriptionId : null, error ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined

  const handleInput = (event) => {
    onInput?.(event)
    const { value } = event.currentTarget
    if (onComplete && value.length === length) onComplete(value)
  }

  return (
    <div className="abaabil-otp-group">
      {label ? (
        <label
          htmlFor={inputId}
          className={hideLabel ? 'abaabil-otp__label abaabil-visually-hidden' : 'abaabil-otp__label'}
        >
          {label}
        </label>
      ) : null}
      <Otp
        {...props}
        id={inputId}
        length={length}
        required={required}
        onInput={handleInput}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      {description ? (
        <div id={descriptionId} className="abaabil-otp__description">
          {description}
        </div>
      ) : null}
      {error ? (
        <div id={errorId} className="abaabil-otp__error" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  )
}
