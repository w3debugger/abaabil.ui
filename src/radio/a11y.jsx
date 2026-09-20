'use client'

import { createContext, useContext, useId } from 'react'
import './radio.css'
import Radio from './styled.jsx'

const RadioGroupContext = createContext(null)

/**
 * Radio, a11y tier. Adds a real associated <label> and a description wired
 * through aria-describedby. When rendered inside a <RadioGroup>, the shared
 * `name` is picked up from context automatically. A radio group without a
 * shared `name` renders fine but is not actually one group: arrow-key
 * navigation and single-selection both key off it, and nothing visual shows
 * the breakage.
 *
 * @param {object} props
 * @param {string} props.label Accessible name. The platform does not supply one.
 * @param {string} [props.description] Rendered text, wired via aria-describedby.
 * @param {string} [props.name] Overrides the name inherited from RadioGroup.
 * @param {string} [props.id]
 *
 * A consumer-supplied aria-describedby is preserved and combined with the
 * generated description id rather than replaced.
 */
export default function Radio_a11y({
  label,
  description,
  name,
  id,
  'aria-describedby': ariaDescribedBy,
  ...props
}) {
  const group = useContext(RadioGroupContext)
  const baseId = useId()
  const inputId = id ?? baseId
  const descId = `${baseId}-description`
  const describedBy = [ariaDescribedBy, description ? descId : null].filter(Boolean).join(' ') || undefined

  // A control named with aria-label or aria-labelledby is correctly named.
  // Warning on those too trains people to ignore the warning.
  const hasAccessibleName = Boolean(
    label || props['aria-label'] || props['aria-labelledby']
  )

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !hasAccessibleName) {
    console.warn(
      'abaabil/radio: no `label` given, so the radio has no accessible name ' +
        'and screen readers announce it as unnamed.'
    )
  }

  return (
    <span className="abaabil-radio__wrapper">
      <Radio
        {...props}
        id={inputId}
        name={name ?? group?.name}
        aria-describedby={describedBy}
      />
      {label ? (
        <label htmlFor={inputId} className="abaabil-radio__label">
          {label}
        </label>
      ) : null}
      {description ? (
        <span id={descId} className="abaabil-radio__description">
          {description}
        </span>
      ) : null}
    </span>
  )
}

/**
 * RadioGroup, a11y tier. A <fieldset>/<legend> pair that also supplies the
 * shared `name` every descendant <Radio> needs to behave as one native
 * radio group. Generates a name via useId when none is given, so a group
 * works correctly even when the consumer does not think to pass one.
 *
 * @param {object} props
 * @param {string} [props.label] Group label, rendered as the <legend>.
 * @param {string} [props.name] Shared name for every radio in the group.
 * @param {string} [props.className]
 */
export function RadioGroup({ label, name, className, children, ...props }) {
  const generatedName = useId()
  const cls = className ? `abaabil-radio-group ${className}` : 'abaabil-radio-group'

  return (
    <RadioGroupContext.Provider value={{ name: name ?? generatedName }}>
      <fieldset className={cls} {...props}>
        {label ? <legend className="abaabil-radio-group__legend">{label}</legend> : null}
        {children}
      </fieldset>
    </RadioGroupContext.Provider>
  )
}
