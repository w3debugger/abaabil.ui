import './skeleton.css'
import Skeleton from './styled.jsx'

/**
 * Skeleton, a11y tier.
 *
 * The addition is almost entirely subtraction. Grey bars are a picture
 * of a layout, and a screen reader reading a dozen empty boxes tells
 * someone nothing except that something is wrong. So every skeleton is
 * hidden from the accessibility tree, always, with no way to opt out.
 *
 * What replaces it is one announcement for the whole region.
 * `role="status"` is an implicit polite live region: "Loading messages"
 * is read once when the placeholders appear, and nothing is read for
 * the bars themselves. Ten skeletons in a list should produce one
 * announcement, not ten, so the label belongs on the group and this
 * component only offers it on the outermost one.
 *
 * `aria-busy` is deliberately not set here. It belongs on the element
 * whose content is loading, which is the consumer's container, not on
 * the placeholder standing inside it. Setting it on the skeleton itself
 * is a common mistake that says "this grey box is loading", which is
 * both true and useless.
 *
 * Reduced motion is handled in the stylesheet: the shimmer stops and
 * the bars are simply flat. A skeleton communicates its state by
 * existing, so unlike the spinner it loses nothing by holding still.
 *
 * No hooks, so all three skeleton tiers render in a Server Component
 * tree and ship zero runtime JavaScript.
 *
 * @param {object} props
 * @param {'text'|'rect'|'circle'} [props.shape='text']
 * @param {number} [props.lines=1]
 * @param {string} [props.width]
 * @param {string} [props.height]
 * @param {string} [props.label] Announced once when the placeholders
 *   appear. Put it on one skeleton per loading region, not on each.
 * @param {string} [props.className]
 */
export default function Skeleton_a11y({ label, ...props }) {
  if (!label) return <Skeleton aria-hidden="true" {...props} />

  return (
    <span className="abaabil-skeleton-status" role="status">
      <Skeleton aria-hidden="true" {...props} />
      <span className="abaabil-visually-hidden">{label}</span>
    </span>
  )
}
