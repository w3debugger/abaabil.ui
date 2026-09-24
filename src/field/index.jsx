import { cloneElement, isValidElement } from 'react'

/**
 * Field, Fieldset and Label, normal tier. Structure only: no styles, no
 * ARIA logic. Contains no hooks, so all three render in server and
 * client trees.
 *
 * The platform already ties a label to a control through htmlFor and
 * id, and a legend to a group through <fieldset>. What it does not
 * supply is the layout of label, description and error around a
 * control that is not this library's own. Input, textarea, select and
 * combobox each carry that wiring inside their a11y tier; Field is the
 * same wiring with the control left open, so a date picker, a masked
 * input or a third-party editor gets the same label, help text and
 * error as an abaabil input, in the same place, at the same size.
 *
 * The decision that keeps it small: Field never renders a control. The
 * child is either an element, which is cloned with the id the label
 * points at, or a function, which is called with the ids and left to
 * wire itself. There is no `as`, no `component`, no registry of
 * control types. The id is a required prop for the same reason it is
 * on popover: generating one would need useId, and useId would move
 * every tier out of the server tree for the sake of a string the
 * consumer already has.
 */

const describedBy = (id, description, error) =>
  [description ? `${id}-description` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') ||
  undefined

/**
 * A bare <label> with the field's label class, for people who only want
 * the label.
 * @param {object} props
 * @param {string} [props.className] Merged with the base class.
 */
export function Label({ className, ...props }) {
  const cls = className ? `abaabil-field__label ${className}` : 'abaabil-field__label'
  return <label className={cls} {...props} />
}

/**
 * The description and error paragraphs, shared by Field and Fieldset.
 * @param {{ id: string, description?: import('react').ReactNode, error?: import('react').ReactNode }} props
 */
function Messages({ id, description, error }) {
  return (
    <>
      {description ? (
        <p id={`${id}-description`} className="abaabil-field__description">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="abaabil-field__error">
          {error}
        </p>
      ) : null}
    </>
  )
}

/**
 * @param {object} props
 * @param {string} props.id Required. The control's id; the label points
 *   at it and the description and error ids derive from it.
 * @param {import('react').ReactNode} [props.label] Rendered as a real
 *   <label htmlFor={id}>.
 * @param {boolean} [props.hideLabel=false] Visually hide the label. It
 *   stays a real <label> in the accessibility tree.
 * @param {import('react').ReactNode} [props.description] Help text,
 *   rendered at `${id}-description`.
 * @param {import('react').ReactNode} [props.error] Error text, rendered
 *   at `${id}-error`.
 * @param {boolean} [props.required=false] Set on the control. The label
 *   draws its mark from the control's own attribute.
 * @param {import('react').ReactNode | ((args: { id: string, describedBy?: string, invalid: boolean, required: boolean }) => import('react').ReactNode)} props.children
 *   An element, cloned with `id` (and `required` when set), or a
 *   function that receives the ids and wires its own control.
 * @param {string} [props.className] Merged with the base class.
 */
export default function Field({
  id,
  label,
  hideLabel = false,
  description,
  error,
  required = false,
  children,
  className,
  ...props
}) {
  const cls = className ? `abaabil-field ${className}` : 'abaabil-field'
  const control = required ? { id, required } : { id }
  const child =
    typeof children === 'function'
      ? children({ id, describedBy: describedBy(id, description, error), invalid: Boolean(error), required })
      : isValidElement(children)
        ? cloneElement(children, control)
        : children

  return (
    <div className={cls} {...props}>
      {label ? (
        <Label htmlFor={id} className={hideLabel ? 'abaabil-visually-hidden' : undefined}>
          {label}
        </Label>
      ) : null}
      {child}
      <Messages id={id} description={description} error={error} />
    </div>
  )
}

/**
 * A <fieldset> with a <legend>, for a group of checkboxes or radios that
 * share one label, description and error.
 * @param {object} props
 * @param {string} props.id Required. The fieldset's id; the description
 *   and error ids derive from it.
 * @param {import('react').ReactNode} [props.label] Rendered as the <legend>.
 * @param {import('react').ReactNode} [props.description]
 * @param {import('react').ReactNode} [props.error]
 * @param {string} [props.className] Merged with the base class.
 */
export function Fieldset({ id, label, description, error, children, className, ...props }) {
  const cls = className ? `abaabil-fieldset ${className}` : 'abaabil-fieldset'

  return (
    <fieldset id={id} className={cls} {...props}>
      {label ? <legend className="abaabil-fieldset__legend">{label}</legend> : null}
      {children}
      <Messages id={id} description={description} error={error} />
    </fieldset>
  )
}
