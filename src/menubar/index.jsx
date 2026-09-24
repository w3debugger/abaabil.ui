/**
 * Menubar, normal tier. A container for a row of menus. Structure only:
 * no styles, no ARIA logic, no keyboard handling. Contains no hooks, so
 * it renders in both server and client trees.
 *
 * Children are abaabil/menu instances, one per top-level menu, and that
 * is the decision that keeps this component small. A menu bar in other
 * libraries is a second implementation of the menu: its own trigger,
 * its own panel, its own item roles and keyboard. Here the menus are the
 * consumer's own Menu elements, the same way Toolbar takes arbitrary
 * controls, so nothing about opening, closing, light dismiss or the
 * items inside is written twice. What a bar adds over a row of menus is
 * only the sideways movement, and that lives in the a11y tier.
 *
 * @param {object} props
 * @param {string} [props.className] Merged with the base class.
 */
export default function Menubar({ className, children, ...props }) {
  const cls = className ? `abaabil-menubar ${className}` : 'abaabil-menubar'

  return (
    <div className={cls} {...props}>
      {children}
    </div>
  )
}
