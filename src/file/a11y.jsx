'use client'

import { useId } from 'react'
import './file.css'
import File from './styled.jsx'

/**
 * File, a11y tier. The same label, description and error wiring as
 * input, plus the one thing specific to file pickers: saying what is
 * acceptable before the dialog opens rather than after it rejects
 * something.
 *
 * `accept` is a filter on the file dialog, not an announcement. A
 * screen reader user hears nothing about it, and neither does anyone
 * who drags a file onto the control. Pass `description` with the same
 * information in words; it is wired through aria-describedby, so it is
 * read out with the field rather than sitting near it.
 *
 * Uses useId to mint stable ids, so this tier needs a client tree.
 *
 * @param {object} props
 * @param {string} [props.label] Rendered as a real <label>.
 * @param {boolean} [props.hideLabel=false] Hide it visually; it stays in
 *   the accessibility tree.
 * @param {string} [props.description] Help text, wired into
 *   aria-describedby. Say what you accept here, in words.
 * @param {string} [props.error] Sets aria-invalid and joins
 *   aria-describedby.
 * @param {boolean} [props.required=false]
 * @param {string} [props.id] Overrides the generated id.
 */
export default function File_a11y({
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
  const inputId = id ?? `${baseId}-file`
  const descriptionId = `${baseId}-description`
  const errorId = `${baseId}-error`

  const hasAccessibleName = Boolean(label || props['aria-label'] || props['aria-labelledby'])

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !hasAccessibleName) {
    console.warn(
      'abaabil/file: no `label` given, so the file input has no accessible name. ' +
        'Pass `label`, `aria-label`, or `aria-labelledby`.'
    )
  }

  if (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV !== 'production' &&
    props.accept &&
    !description
  ) {
    console.warn(
      'abaabil/file: `accept` filters the file dialog but is never announced, ' +
        'and it does not apply to files dropped onto the control. Pass a ' +
        '`description` saying what is accepted.'
    )
  }

  const describedBy =
    [ariaDescribedBy, description ? descriptionId : null, error ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <div className="abaabil-file-group">
      {label ? (
        <label
          htmlFor={inputId}
          className={hideLabel ? 'abaabil-file__label abaabil-visually-hidden' : 'abaabil-file__label'}
        >
          {label}
        </label>
      ) : null}
      <File
        {...props}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      {description ? (
        <div id={descriptionId} className="abaabil-file__description">
          {description}
        </div>
      ) : null}
      {error ? (
        <div id={errorId} className="abaabil-file__error" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  )
}
