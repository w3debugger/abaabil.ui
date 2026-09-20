'use client'

import { useId } from 'react'
import './select.css'
import Select from './styled.jsx'

/**
 * Select, a11y tier. Adds a real associated <label>, a description wired
 * through aria-describedby, and an error that sets aria-invalid and joins
 * the error id into aria-describedby alongside the description.
 *
 * useId is the only hook this tier needs (ids must stay unique with
 * several selects on one page), which is also why it is the only tier
 * carrying "use client".
 *
 * @param {object} props
 * @param {string} [props.label] Accessible name, rendered as a real
 *   <label>. Omitted entirely (not rendered as an empty tag) when not
 *   given, so a consumer naming the control via aria-label instead does
 *   not get a stray empty <label for="...">.
 * @param {boolean} [props.hideLabel=true] Visually hide the label (it stays
 *   in the accessibility tree either way, still a real <label> associated
 *   via htmlFor/id). Set to false to render it visibly. Matches combobox's
 *   `hideLabel` semantics and default.
 * @param {string} [props.description] Rendered and wired via aria-describedby.
 * @param {string} [props.error] Rendered, sets aria-invalid, and is joined
 *   into aria-describedby alongside the description.
 * @param {string} [props.id] Explicit id for the select. Defaults to a
 *   generated one.
 * @param {string} [props.className] Merged onto the wrapper.
 *
 * A consumer-supplied aria-describedby is preserved and combined with the
 * generated description/error ids rather than replaced.
 */
export default function Select_a11y({
  label,
  hideLabel = false,
  description,
  error,
  id,
  className,
  'aria-describedby': ariaDescribedBy,
  ...props
}) {
  const baseId = useId()
  const selectId = id ?? `${baseId}-select`
  const descriptionId = description ? `${baseId}-description` : undefined
  const errorId = error ? `${baseId}-error` : undefined
  const describedBy = [ariaDescribedBy, descriptionId, errorId].filter(Boolean).join(' ') || undefined

  // A control named with aria-label or aria-labelledby is correctly named.
  // Warning on those too trains people to ignore the warning.
  const hasAccessibleName = Boolean(
    label || props['aria-label'] || props['aria-labelledby']
  )

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !hasAccessibleName) {
    console.warn(
      'abaabil/select: no `label` given, so the select has no accessible name ' +
        'and screen readers announce it as unnamed.'
    )
  }

  const cls = className ? `abaabil-select-group ${className}` : 'abaabil-select-group'

  return (
    <div className={cls}>
      {label ? (
        <label
          htmlFor={selectId}
          className={hideLabel ? 'abaabil-select__label abaabil-visually-hidden' : 'abaabil-select__label'}
        >
          {label}
        </label>
      ) : null}
      <Select
        {...props}
        id={selectId}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
      />
      {description ? (
        <p id={descriptionId} className="abaabil-select__description">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="abaabil-select__error">
          {error}
        </p>
      ) : null}
    </div>
  )
}
