'use client'

import { useId } from 'react'
import './progress.css'
import Progress from './styled.jsx'

/**
 * Progress, a11y tier. Adds the label and description wiring, and the one
 * thing people reliably get wrong about a progress bar: what it announces.
 *
 * A bare <progress value="30" max="100"> is announced as "30 percent",
 * which is fine for a percentage and wrong for everything else. Pass
 * `valueText` when the number means something other than a percentage
 * ("3 of 8 files", "12 seconds left") and it is applied as
 * aria-valuetext, which assistive tech reads in place of the percentage.
 *
 * Uses useId to mint stable ids, so this tier needs a client tree.
 *
 * @param {object} props
 * @param {string} [props.label] Rendered as a real <label>, associated
 *   with the progress element via htmlFor/id.
 * @param {boolean} [props.hideLabel=false] Hide the label visually. It
 *   stays in the accessibility tree either way.
 * @param {string} [props.description] Help text, wired into aria-describedby.
 * @param {string} [props.valueText] Announced instead of the percentage.
 * @param {number} [props.value] Omit for indeterminate.
 * @param {number} [props.max=100]
 * @param {string} [props.id] Overrides the generated id.
 */
export default function Progress_a11y({
  label,
  hideLabel = false,
  description,
  valueText,
  value,
  max = 100,
  id,
  'aria-describedby': ariaDescribedBy,
  ...props
}) {
  const baseId = useId()
  const progressId = id ?? `${baseId}-progress`
  const descriptionId = `${baseId}-description`
  const labelId = `${baseId}-label`

  const hasAccessibleName = Boolean(label || props['aria-label'] || props['aria-labelledby'])

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !hasAccessibleName) {
    console.warn(
      'abaabil/progress: no `label` given, so the progress bar has no accessible name. ' +
        'Pass `label`, `aria-label`, or `aria-labelledby`.'
    )
  }

  const describedBy =
    [ariaDescribedBy, description ? descriptionId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className="abaabil-progress-group">
      {label ? (
        <label
          id={labelId}
          htmlFor={progressId}
          className={
            hideLabel ? 'abaabil-progress__label abaabil-visually-hidden' : 'abaabil-progress__label'
          }
        >
          {label}
        </label>
      ) : null}
      <Progress
        {...props}
        id={progressId}
        value={value}
        max={max}
        aria-valuetext={valueText}
        // The <label> alone does not name a <progress>. It is a labelable
        // element, so htmlFor is not wrong, but accessible-name tooling
        // computes nothing from it: axe names an <input> from the same
        // markup and names neither <progress> nor <meter>. Pointing
        // aria-labelledby at the label makes the name explicit rather
        // than leaving it to differ between implementations. The <label>
        // stays for its own sake, as the visible text.
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={describedBy}
      />
      {description ? (
        <div id={descriptionId} className="abaabil-progress__description">
          {description}
        </div>
      ) : null}
    </div>
  )
}
