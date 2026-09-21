/**
 * Switch, normal tier. A native checkbox carrying `role="switch"`.
 * Structure only: no styles, no label wiring. Contains no hooks, so it
 * renders in both server and client trees.
 *
 * On why the role is here and not held back for the a11y tier: the role
 * is this component's identity, not wiring. It is the same kind of choice
 * as dialog reaching for <dialog> and accordion reaching for <details> in
 * their normal tiers. A switch without `role="switch"` is not a switch at
 * all, it is abaabil/checkbox with different CSS, and shipping that as the
 * default tier would mean the component announces itself as something it
 * is not. What the a11y tier adds is the label and description wiring,
 * which genuinely is wiring.
 *
 * The checked state comes from the native checkbox, so there is no
 * aria-checked here: adding one would duplicate state the platform
 * already exposes, and duplicated state is state that can disagree.
 *
 * @param {object} props
 * @param {string} [props.className] Merged with the base class.
 */
export default function Switch({ className, ...props }) {
  const cls = className ? `abaabil-switch ${className}` : 'abaabil-switch'

  return <input type="checkbox" role="switch" className={cls} {...props} />
}
