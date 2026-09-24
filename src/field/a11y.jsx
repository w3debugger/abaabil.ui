'use client'

import { cloneElement, isValidElement, useId } from 'react'
import './field.css'
import Field, { Fieldset, Label } from './styled.jsx'

/**
 * Field, a11y tier. Adds the wiring input/a11y carries for its own
 * control, for any control: aria-describedby pointing at whichever of
 * description and error exist, merged with a consumer-supplied one
 * rather than replacing it, aria-invalid while there is an error, and
 * the native `required` attribute. A dev warning fires when the field
 * would have no accessible name.
 *
 * The error paragraph is not a live region, on purpose, and that
 * matches how a screen reader user meets it: the error is announced
 * with the control, as part of its description, when focus lands
 * there. role="alert" on a message that is already in the page when it
 * mounts announces nothing anyway, and a form that re-renders with
 * several errors at once would fire several alerts over each other.
 * Announcing a failed submit is the form's job, with a focused error
 * summary, not a field's.
 *
 * `id` becomes optional here through useId, which is what puts this
 * tier and only this tier in the client tree.
 *
 * @param {object} props
 * @param {string} [props.id] Overrides the generated control id.
 * @param {import('react').ReactNode} [props.label]
 * @param {boolean} [props.hideLabel=false]
 * @param {import('react').ReactNode} [props.description]
 * @param {import('react').ReactNode} [props.error]
 * @param {boolean} [props.required=false]
 * @param {import('react').ReactNode | ((props: object) => import('react').ReactNode)} props.children
 *   An element, cloned with `id`, `required`, `aria-describedby` and
 *   `aria-invalid`, or a function that receives those as one
 *   spreadable props object.
 */
export default function Field_a11y({ id, error, required = false, children, ...props }) {
  const generated = useId()
  const fieldId = id ?? generated
  const element = isValidElement(children) ? children : null

  const named = Boolean(
    props.label || element?.props['aria-label'] || element?.props['aria-labelledby']
  )
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !named) {
    console.warn(
      'abaabil/field: no `label` given, so the control has no accessible name. ' +
        'Pass `label`, or `aria-label`/`aria-labelledby` on the control.'
    )
  }

  const describedBy =
    [
      element?.props['aria-describedby'],
      props.description ? `${fieldId}-description` : null,
      error ? `${fieldId}-error` : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined

  const control = { id: fieldId, 'aria-describedby': describedBy }
  if (required) control.required = true
  if (error) control['aria-invalid'] = true

  const child =
    typeof children === 'function'
      ? children(control)
      : element
        ? cloneElement(element, control)
        : children

  return (
    <Field id={fieldId} error={error} required={required} {...props}>
      {child}
    </Field>
  )
}

/**
 * Fieldset, a11y tier. The <legend> already names the group to the
 * platform; this adds aria-describedby on the fieldset so the shared
 * description and error are read when focus enters it, and warns
 * without a label, because an unnamed group is announced as "group"
 * with no name.
 *
 * @param {object} props
 * @param {string} [props.id] Overrides the generated id.
 * @param {import('react').ReactNode} [props.label]
 * @param {import('react').ReactNode} [props.description]
 * @param {import('react').ReactNode} [props.error]
 */
export function Fieldset_a11y({ id, 'aria-describedby': ariaDescribedBy, ...props }) {
  const generated = useId()
  const fieldId = id ?? generated

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !props.label) {
    console.warn(
      'abaabil/field: Fieldset has no `label`, so the group has no accessible name.'
    )
  }

  const describedBy =
    [
      ariaDescribedBy,
      props.description ? `${fieldId}-description` : null,
      props.error ? `${fieldId}-error` : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined

  return <Fieldset id={fieldId} aria-describedby={describedBy} {...props} />
}

export { Fieldset_a11y as Fieldset, Label }
