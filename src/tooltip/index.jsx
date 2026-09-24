/**
 * Tooltip, normal tier. A wrapper, the thing being described, and the
 * bubble. Structure only: no styles, no ARIA logic. Contains no hooks,
 * so it renders in both server and client trees.
 *
 * Showing and hiding is done in CSS, by :hover and :focus-within on the
 * wrapper (see tooltip.css). That is why the normal and styled tiers
 * need no JavaScript at all: the two events that should reveal a tooltip
 * are both expressible as selectors, and a JavaScript implementation of
 * them would be a reimplementation of :hover.
 *
 * What CSS cannot do is Escape-to-dismiss and the aria-describedby
 * association. Those are the a11y tier.
 *
 * The bubble is positioned inside the wrapper, not in the top layer, so
 * an ancestor with `overflow` other than visible (a table cell, a card,
 * a scrolling toolbar) clips it, and `placement="top"` on a trigger at
 * the top of the viewport is cut off. Use `placement="bottom"` in a
 * page header.
 *
 * There is no role="tooltip" here, unlike on abaabil/switch, where the
 * role is the component's identity and stays in the normal tier. The
 * difference is that a switch's role does something on its own: it
 * changes how a reachable, interactive control is announced. A tooltip
 * is never encountered directly; assistive tech reaches it through the
 * aria-describedby on its trigger. Without that association the role
 * announces nothing to nobody, so it belongs with the wiring that makes
 * it mean something, in the a11y tier.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.content The tooltip text.
 * @param {string} [props.placement='top'] 'top' | 'bottom'.
 * @param {string} [props.className] Merged with the base class.
 * @param {import('react').ReactNode} props.children The trigger. Must be
 *   focusable, or keyboard users never see the tooltip.
 */
export default function Tooltip({ content, placement = 'top', className, children, ...props }) {
  const cls = className ? `abaabil-tooltip ${className}` : 'abaabil-tooltip'

  return (
    <span className={cls} data-placement={placement} {...props}>
      {children}
      <span className="abaabil-tooltip__bubble">{content}</span>
    </span>
  )
}
