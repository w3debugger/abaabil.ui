import './collapsible.css'
import Collapsible from './styled.jsx'

/**
 * Collapsible, a11y tier. Re-exported unchanged, and that is the
 * finding rather than an omission.
 *
 * <summary> already carries the right role, already exposes expanded
 * and collapsed state, already responds to Enter and Space, and is
 * already in the tab order. Adding aria-expanded on top of it does not
 * reinforce the native state, it competes with it: browsers compute
 * the state from the element's own open attribute, and an author
 * value that disagrees produces a control announcing one thing while
 * doing another. Adding role="button" replaces a correct implicit role
 * with an explicit one that is sometimes worse.
 *
 * So the honest a11y tier for this component is empty. Importing it
 * gets you the same component as `abaabil/collapsible/styled` for a
 * handful of bytes, and it exists so that a codebase can import the
 * a11y tier everywhere without having to remember which components
 * needed one. Accordion's Disclosure is re-exported the same way, for
 * the same reason.
 *
 * What this tier does NOT offer is a way to give the summary heading
 * semantics. A heading nested inside <summary> is not reliably exposed
 * as a heading (VoiceOver does not expose it), and <summary> must be
 * the literal first child of <details>, so it cannot be wrapped in one
 * either. An API for it would let a consumer believe they had solved
 * heading navigation when they had not. The full explanation is in
 * accordion's a11y tier, which reaches the same conclusion.
 */
export default Collapsible
