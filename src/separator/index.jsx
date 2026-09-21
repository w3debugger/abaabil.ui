/**
 * Separator, normal tier. An <hr>, which is the element for this and
 * already carries role="separator" in every browser. Structure only:
 * no styles, no ARIA logic. Contains no hooks, so it renders in both
 * server and client trees.
 *
 * <hr> rather than a <div>: the semantics arrive free, and the element
 * is void, which is the honest shape for a thing that separates two
 * regions rather than containing anything.
 *
 * Orientation lands as a data attribute so the styled tier can key off
 * it, the same arrangement alert and badge use for their variants. The
 * a11y tier is what turns it into aria-orientation, because a vertical
 * <hr> is still announced as a horizontal rule unless told otherwise.
 *
 * @param {object} props
 * @param {'horizontal'|'vertical'} [props.orientation='horizontal']
 * @param {string} [props.className] Merged with the base class.
 */
export default function Separator({ orientation = 'horizontal', className, ...props }) {
  const cls = className ? `abaabil-separator ${className}` : 'abaabil-separator'

  return <hr className={cls} data-orientation={orientation} {...props} />
}
