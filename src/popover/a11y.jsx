import './popover.css'
import { Popover, PopoverTrigger, PopoverPanel } from './styled.jsx'

/**
 * Popover, a11y tier.
 *
 * This tier is small, and that is the point rather than an omission. The
 * Popover API already gives the panel its top layer, light-dismiss,
 * Escape, and the button-to-panel relationship in the accessibility tree.
 * Focus order follows the DOM into the open panel and back out. None of
 * that needs reimplementing, and reimplementing it would mean shipping
 * JavaScript to duplicate the browser.
 *
 * What is genuinely missing is a name for the panel. A popover is a
 * region of content with no implicit accessible name, so without one a
 * screen reader announces it as an unnamed group. That is what this tier
 * adds, plus the dev warning that catches its absence.
 *
 * No hooks, so like the tiers below it this renders inside a React Server
 * Component tree. All three popover entry points ship zero runtime
 * JavaScript.
 *
 * Deliberately not added: `aria-expanded` on the trigger. It would have to
 * be a static value here, and a static aria-expanded is worse than none,
 * because it states a collapsed/expanded fact that stops being true the
 * moment the popover opens. Browsers expose the popovertarget relationship
 * natively.
 */

/**
 * @param {object} props
 * @param {string} props.id Panel id; also wires the trigger.
 * @param {import('react').ReactNode} props.trigger Button content.
 * @param {string} [props.label] Accessible name for the panel, applied as
 *   aria-label.
 * @param {string} [props.labelledBy] Id of an element naming the panel,
 *   applied as aria-labelledby. Use this instead of `label` when the panel
 *   already renders a visible heading, so the name is not duplicated.
 * @param {object} [props.triggerProps] Spread onto the button.
 * @param {'auto'|'manual'} [props.mode='auto']
 */
export default function Popover_a11y({
  id,
  trigger,
  label,
  labelledBy,
  triggerProps,
  mode = 'auto',
  children,
  ...props
}) {
  const hasAccessibleName = Boolean(
    label || labelledBy || props['aria-label'] || props['aria-labelledby']
  )

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && !hasAccessibleName) {
    console.warn(
      'abaabil/popover: no `label` or `labelledBy` given, so the panel has no ' +
        'accessible name and screen readers announce it as an unnamed group.'
    )
  }

  return (
    <Popover
      id={id}
      trigger={trigger}
      triggerProps={triggerProps}
      mode={mode}
      aria-label={label}
      aria-labelledby={labelledBy}
      {...props}
    >
      {children}
    </Popover>
  )
}

export { PopoverTrigger, PopoverPanel }
