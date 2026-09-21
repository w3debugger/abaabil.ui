/**
 * Toolbar, normal tier. A container for a row of controls. Structure
 * only: no styles, no ARIA logic, no keyboard handling. Contains no
 * hooks, so it renders in both server and client trees.
 *
 * Children are whatever you put in: buttons, links, a select, a
 * separator. Unlike tabs and menu this takes no `items` array, because
 * a toolbar's contents are heterogeneous by definition and an array of
 * `{label, onSelect}` would describe a menu, not a toolbar.
 *
 * @param {object} props
 * @param {'horizontal'|'vertical'} [props.orientation='horizontal']
 * @param {string} [props.className] Merged with the base class.
 */
export default function Toolbar({ orientation = 'horizontal', className, children, ...props }) {
  const cls = className ? `abaabil-toolbar ${className}` : 'abaabil-toolbar'

  return (
    <div className={cls} data-orientation={orientation} {...props}>
      {children}
    </div>
  )
}
