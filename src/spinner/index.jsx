/**
 * Spinner, normal tier. One element, no text, no role. Structure only:
 * no styles, no ARIA logic. Contains no hooks, so it renders in both
 * server and client trees.
 *
 * A <span> rather than an <svg>: the ring is drawn with a border and a
 * CSS rotation in the styled tier, which is a handful of bytes and
 * scales with font-size for free. An inline SVG would be markup on
 * every instance for the same picture.
 *
 * Size lands as a data attribute so the styled tier can key off it.
 *
 * @param {object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.className] Merged with the base class.
 */
export default function Spinner({ size = 'md', className, ...props }) {
  const cls = className ? `abaabil-spinner ${className}` : 'abaabil-spinner'

  return <span className={cls} data-size={size} {...props} />
}
