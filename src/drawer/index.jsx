/**
 * Drawer, normal tier. A native <dialog> pinned to one edge of the
 * viewport. Structure only: no styles, no ARIA logic. Contains no
 * hooks, so it renders in both server and client trees; the consumer
 * holds the ref and calls showModal() and close() themselves, which is
 * what keeps this tier server-renderable.
 *
 * A <dialog>, not a fixed-position div. Everything a drawer needs that
 * is hard to build, the top layer, focus containment, an inert
 * background, Escape to close and a real backdrop, is what showModal()
 * already does, and reimplementing it is most of why other libraries'
 * drawers weigh what they do. A drawer is a modal dialog with
 * different geometry, so it is a modal dialog with different geometry.
 *
 * The side lands as a data attribute for the stylesheet to place it.
 * It is logical rather than physical: "start" and "end" follow the
 * document's direction, so a drawer that opens from the right in
 * English opens from the left in Arabic without a second component.
 * The slide direction is mirrored under a `dir="rtl"` attribute; a
 * document made RTL by the CSS `direction` property alone is placed on
 * the correct edge but slides in from the wrong one.
 *
 * @param {object} props
 * @param {'start'|'end'|'top'|'bottom'} [props.side='end']
 * @param {string} [props.className] Merged with the base class.
 */
export default function Drawer({ side = 'end', className, children, ...props }) {
  const cls = className ? `abaabil-drawer ${className}` : 'abaabil-drawer'

  return (
    <dialog className={cls} data-side={side} {...props}>
      {children}
    </dialog>
  )
}
