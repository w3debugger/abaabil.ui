import './accordion.css'
import { Disclosure, Accordion } from './styled.jsx'

/**
 * Disclosure, a11y tier. Re-exported as-is.
 *
 * <summary> already has the correct implicit role and expanded/collapsed
 * state, and a single Disclosure has no group to name, so there is nothing
 * this tier can add without duplicating native semantics: that would be
 * redundant at best and conflicting at worst. See Accordion_a11y's docs
 * below for why this component also does not offer heading semantics.
 */
export { Disclosure }

/**
 * Accordion, a11y tier.
 *
 * Adds an accessible name for the group, but only when the consumer
 * supplies one: a wrapper `<div>` around several disclosures carries no
 * native semantics of its own, so `label` applies `role="group"` and
 * `aria-label` to it. Without a `label` this stays a plain, role-less div,
 * on purpose: an unnamed group is announced to screen reader users as
 * "group" with no name, which is worse than not grouping at all, and each
 * panel's own summary text already gives it a name. So this is opt-in, not
 * automatic.
 *
 * Deliberately does NOT offer a way to give panels heading semantics
 * (no `headingLevel` prop). <summary> has an implicit ARIA role of "button"
 * in some browsers, and a heading nested inside a button is not reliably
 * exposed to assistive technology: VoiceOver, for one, does not expose a
 * heading nested inside <summary> as a heading. The reverse, wrapping
 * <summary> in a heading element, is not an option either, because
 * <summary> must be the literal first child of <details> for the browser to
 * recognise it as the disclosure trigger. An API that emitted a heading
 * here would let a consumer believe they had solved heading navigation for
 * screen reader users when they had not, so this component does not offer
 * one. Consumers who need reliable heading navigation across sections need
 * the button-in-heading accordion pattern (an explicit heading wrapping a
 * button, with aria-expanded and aria-controls), which is a different,
 * ARIA-driven widget, not this native-<details> one. This component is a
 * disclosure/accordion, not a substitute for that pattern.
 *
 * No hooks: like Disclosure above, this renders in a server tree.
 *
 * @param {object} props
 * @param {Array<{key?: string|number, summary: import('react').ReactNode, children?: import('react').ReactNode}>} props.items
 * @param {string} [props.name] Shared native group name for exclusive open/close.
 * @param {string} [props.label] Accessible name for the group as a whole.
 * @param {string} [props.className]
 */
export function Accordion_a11y({ label, ...props }) {
  const groupProps = label ? { role: 'group', 'aria-label': label } : null
  return <Accordion {...groupProps} {...props} />
}

// Default export added in 1.1.0, matching every other component's a11y
// tier: they all default-export their main component. The named export
// above keeps working for anything already importing `{ Accordion_a11y }`.
export default Accordion_a11y
