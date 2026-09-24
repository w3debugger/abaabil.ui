import './toggle.css'
import { Toggle, ToggleGroup } from './styled.jsx'

/**
 * Toggle, a11y tier.
 *
 * `aria-pressed` is the whole addition, and it is the one thing that
 * separates a toggle from a button. Without it a screen reader
 * announces "Bold, button" whether bold is on or off, which is the
 * failure this component exists to prevent: the control looks obviously
 * different and sounds identical.
 *
 * A toggle whose only content is an icon has no accessible name, and
 * that is the other half of the same failure. This tier warns in
 * development when neither `label` nor an aria-label reaches it, the
 * same check dialog makes for the same reason.
 *
 * `label` becomes visually hidden text rather than aria-label so that
 * a toggle with a visible word keeps that word as its name and one
 * with only an icon still gets a name. Using aria-label instead would
 * override visible text, which breaks speech control: someone saying
 * "click Bold" needs the name to match what is drawn.
 *
 * No hooks, so all three toggle tiers render in a Server Component
 * tree and ship zero runtime JavaScript.
 *
 * @param {object} props
 * @param {boolean} [props.pressed=false]
 * @param {string} [props.label] Accessible name, for an icon-only toggle.
 * @param {string} [props.className]
 */
export function Toggle_a11y({ pressed = false, label, children, ...props }) {
  const named = Boolean(label || props['aria-label'] || props['aria-labelledby'] || children)

  if (process.env.NODE_ENV !== 'production' && !named) {
    console.warn(
      'abaabil/toggle: no `label`, no aria-label and no children, so this ' +
        'toggle has no accessible name and screen readers announce it as an ' +
        'unnamed button.'
    )
  }

  return (
    <Toggle pressed={pressed} aria-pressed={pressed} {...props}>
      {children}
      {label ? <span className="abaabil-visually-hidden">{label}</span> : null}
    </Toggle>
  )
}

/**
 * ToggleGroup, a11y tier.
 *
 * Adds the group's accessible name, and nothing else, because nothing
 * else is missing. A set of radios sharing a name is already one
 * widget to the browser: arrow keys move between them and wrap,
 * Tab enters and leaves the set as a unit rather than stopping on each
 * button, the pressed state is exposed and announced, and disabled
 * members are skipped. That is the entire toolbar keyboard pattern,
 * from the platform, for no bytes.
 *
 * What the platform does not supply is a name for the set. Rendering
 * the group as a <fieldset> with a <legend> is the native way to give
 * it one, and it is what this tier does when `label` is passed: a real
 * legend, announced when focus enters the group, rather than
 * role="group" plus aria-label bolted onto a div.
 *
 * Without a label it stays a plain div, deliberately. An unnamed group
 * is announced as "group" with no name, which is one more thing to
 * move past for no information. Accordion's group and card's region
 * are opt-in for the same reason.
 *
 * @param {object} props
 * @param {Array<{value: string, label: import('react').ReactNode, disabled?: boolean}>} props.items
 * @param {string} props.name
 * @param {boolean} [props.multiple=false]
 * @param {string|string[]} [props.defaultValue]
 * @param {string} [props.label] Accessible name for the set as a whole.
 * @param {string} [props.className]
 */
export function ToggleGroup_a11y({ label, className, ...props }) {
  if (!label) return <ToggleGroup className={className} {...props} />

  return (
    <fieldset className="abaabil-toggle-group__fieldset">
      <legend className="abaabil-toggle-group__legend">{label}</legend>
      <ToggleGroup className={className} {...props} />
    </fieldset>
  )
}

export { Toggle_a11y as Toggle, ToggleGroup_a11y as ToggleGroup }
export default ToggleGroup_a11y
