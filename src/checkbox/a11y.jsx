'use client'

import { useCallback, useEffect, useId, useRef } from 'react'
import './checkbox.css'
import Checkbox from './styled.jsx'

/**
 * Checkbox, a11y tier. Adds a real associated <label>, a description wired
 * through aria-describedby, and `indeterminate` support. indeterminate is a
 * DOM property, not an attribute, so JSX cannot set it directly: it is
 * applied to the input via a ref and an effect, and mirrored to
 * aria-checked="mixed" so it is also exposed correctly to assistive tech.
 *
 * A consumer-supplied `ref` composes with this component's own (both are
 * pulled out of `...props` and merged explicitly), so passing one does not
 * silently break `indeterminate`. *
 * DOM shape: the <label> wraps the control and its text, so the whole
 * row, gap included, is the hit target (2.5.8 asks for 24px and the box
 * is 18). The description is a sibling of the label, not a child, so it
 * stays out of the accessible name and reaches assistive tech only
 * through aria-describedby. The description id derives from the control
 * id, so a consumer `id="terms"` gives `terms-description`.
 *
 * @param {object} props
 * @param {string} props.label Accessible name. The platform does not supply one.
 * @param {string} [props.description] Rendered text, wired via aria-describedby.
 * @param {boolean} [props.indeterminate]
 * @param {string} [props.id]
 *
 * A consumer-supplied aria-describedby is preserved and combined with the
 * generated description id rather than replaced.
 */
export default function Checkbox_a11y({
  label,
  description,
  indeterminate = false,
  id,
  ref: consumerRef,
  'aria-describedby': ariaDescribedBy,
  ...props
}) {
  const ref = useRef(null)
  const baseId = useId()
  const inputId = id ?? baseId
  const descId = `${inputId}-description`
  const describedBy = [ariaDescribedBy, description ? descId : null].filter(Boolean).join(' ') || undefined

  const setRef = useCallback(
    (node) => {
      ref.current = node
      if (typeof consumerRef === 'function') consumerRef(node)
      else if (consumerRef) consumerRef.current = node
    },
    [consumerRef]
  )

  // A control named with aria-label or aria-labelledby is correctly named.
  // Warning on those too trains people to ignore the warning.
  const hasAccessibleName = Boolean(
    label || props['aria-label'] || props['aria-labelledby']
  )

  if (process.env.NODE_ENV !== 'production' && !hasAccessibleName) {
    console.warn(
      'abaabil/checkbox: no `label` given, so the checkbox has no accessible name ' +
        'and screen readers announce it as unnamed.'
    )
  }

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])

  const control = (
    <Checkbox
      {...props}
      ref={setRef}
      id={inputId}
      aria-describedby={describedBy}
      aria-checked={indeterminate ? 'mixed' : undefined}
    />
  )

  return (
    <span className="abaabil-checkbox__wrapper">
      {label ? (
        <label htmlFor={inputId} className="abaabil-checkbox__label">
          {control}
          {label}
        </label>
      ) : (
        control
      )}
      {description ? (
        <span id={descId} className="abaabil-checkbox__description">
          {description}
        </span>
      ) : null}
    </span>
  )
}

/**
 * CheckboxGroup, a11y tier. A <fieldset>/<legend> pair, the accessible
 * default for grouping checkboxes under a shared label.
 *
 * @param {object} props
 * @param {string} [props.label] Group label, rendered as the <legend>.
 * @param {string} [props.className]
 */
export function CheckboxGroup({ label, className, children, ...props }) {
  const cls = className ? `abaabil-checkbox-group ${className}` : 'abaabil-checkbox-group'
  return (
    <fieldset className={cls} {...props}>
      {label ? <legend className="abaabil-checkbox-group__legend">{label}</legend> : null}
      {children}
    </fieldset>
  )
}
