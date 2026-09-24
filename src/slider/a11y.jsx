'use client'

import { useId, useState } from 'react'
import './slider.css'
import Slider from './styled.jsx'

/**
 * Slider, a11y tier. Adds the label and description wiring, and the two
 * things a bare range input does not give you.
 *
 * `formatValue` sets aria-valuetext. A range input announces its raw
 * number, so a price slider says "50" when it means fifty dollars and a
 * duration slider says "90" when it means a minute and a half. Anything
 * whose number is not self-explanatory needs this.
 *
 * `showValue` renders the current value in an <output>, which is the
 * element for exactly this and is associated with the input through
 * `htmlFor`. Tracking it needs state, which is the only reason this tier
 * is a client component beyond useId.
 *
 * Uncontrolled by default, like the rest of the library: pass
 * `defaultValue` and read changes through `onChange`. Passing `value`
 * makes it controlled, and then the displayed output follows your value
 * rather than the internal one.
 *
 * @param {object} props
 * @param {string} [props.label] Rendered as a real <label>.
 * @param {boolean} [props.hideLabel=false] Hide the label visually.
 * @param {string} [props.description] Help text, wired into aria-describedby.
 * @param {boolean} [props.showValue=false] Render the value in an <output>.
 * @param {(value: number) => string} [props.formatValue] Formats both the
 *   visible output and aria-valuetext.
 * @param {number} [props.min=0]
 * @param {number} [props.max=100]
 * @param {number|'any'} [props.step=1]
 * @param {string} [props.id] Overrides the generated id.
 */
export default function Slider_a11y({
  label,
  hideLabel = false,
  description,
  showValue = false,
  formatValue,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onChange,
  id,
  'aria-describedby': ariaDescribedBy,
  ...props
}) {
  const baseId = useId()
  const sliderId = id ?? `${baseId}-slider`
  const descriptionId = `${baseId}-description`

  const controlled = value !== undefined
  // Midpoint, not min: an uncontrolled range input's own default is the
  // midpoint, so starting anywhere else here would make the rendered
  // output disagree with the thumb on first paint.
  //
  // Clamped for the same reason. A range input silently pins a value
  // outside its range to the nearest end, so an unclamped copy here
  // would print a number the control is not on: defaultValue={30} with
  // max={11} showed "30" beside a thumb sitting at 11.
  //
  // Snapped to step for the same reason again. The browser moves an
  // off-step value to the nearest allowed one (ties upward, never past
  // max), so step={30} with the derived midpoint 50 put the thumb at 60
  // while the output printed 50. toPrecision strips the float noise a
  // decimal step leaves behind (0.1 * 3 is not 0.3).
  const clamp = (n) => {
    const lo = Number(min)
    const hi = Number(max)
    const s = Number(step)
    n = Math.min(Math.max(Number(n), lo), hi)
    if (!(s > 0)) return n
    const q = (n - lo) / s
    const up = lo + Math.round(q) * s
    return +(up > hi ? lo + Math.floor(q) * s : up).toPrecision(12)
  }
  const [internal, setInternal] = useState(() =>
    clamp(defaultValue ?? Math.floor((Number(min) + Number(max)) / 2))
  )
  const current = controlled ? clamp(value) : internal

  const hasAccessibleName = Boolean(label || props['aria-label'] || props['aria-labelledby'])

  if (process.env.NODE_ENV !== 'production' && !hasAccessibleName) {
    console.warn(
      'abaabil/slider: no `label` given, so the slider has no accessible name. ' +
        'Pass `label`, `aria-label`, or `aria-labelledby`.'
    )
  }

  const describedBy =
    [ariaDescribedBy, description ? descriptionId : null].filter(Boolean).join(' ') || undefined

  const text = formatValue ? formatValue(Number(current)) : undefined

  function handleChange(event) {
    if (!controlled) setInternal(event.target.value)
    onChange?.(event)
  }

  return (
    <div className="abaabil-slider-group">
      <div className="abaabil-slider__header">
        {label ? (
          <label
            htmlFor={sliderId}
            className={
              hideLabel ? 'abaabil-slider__label abaabil-visually-hidden' : 'abaabil-slider__label'
            }
          >
            {label}
          </label>
        ) : null}
        {showValue ? (
          // aria-hidden because the input already announces its own value,
          // and aria-valuetext below already carries the formatted version.
          // Without this a screen reader hears the number twice.
          <output htmlFor={sliderId} className="abaabil-slider__output" aria-hidden="true">
            {text ?? current}
          </output>
        ) : null}
      </div>
      <Slider
        {...props}
        id={sliderId}
        min={min}
        max={max}
        step={step}
        {...(controlled ? { value } : { defaultValue: internal })}
        onChange={handleChange}
        aria-valuetext={text}
        aria-describedby={describedBy}
      />
      {description ? (
        <div id={descriptionId} className="abaabil-slider__description">
          {description}
        </div>
      ) : null}
    </div>
  )
}
