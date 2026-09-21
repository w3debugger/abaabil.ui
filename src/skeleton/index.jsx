/**
 * Skeleton, normal tier. A placeholder box standing in for content that
 * has not arrived. Structure only: no styles, no ARIA logic. Contains
 * no hooks, so it renders in both server and client trees.
 *
 * Shape lands as a data attribute so the styled tier can key off it.
 * Width and height are inline custom properties rather than props the
 * stylesheet knows about, because a skeleton's size is whatever the
 * content it replaces happens to be and no set of variants covers it.
 *
 * `lines` draws several text bars instead of one, with the last one
 * short, which is what a paragraph of text looks like. Without it,
 * every caller writes the same loop.
 *
 * @param {object} props
 * @param {'text'|'rect'|'circle'} [props.shape='text']
 * @param {number} [props.lines=1] Only meaningful for shape="text".
 * @param {string} [props.width] Any CSS length. Defaults to the full width.
 * @param {string} [props.height] Any CSS length. Text and circle derive
 *   their own from the font size if this is omitted.
 * @param {string} [props.className] Merged with the base class.
 */
export default function Skeleton({
  shape = 'text',
  lines = 1,
  width,
  height,
  className,
  style,
  ...props
}) {
  const cls = className ? `abaabil-skeleton ${className}` : 'abaabil-skeleton'
  const sized = {
    ...(width ? { '--skeleton-width': width } : null),
    ...(height ? { '--skeleton-height': height } : null),
    ...style,
  }

  if (shape === 'text' && lines > 1) {
    return (
      <span className="abaabil-skeleton-lines" style={sized} {...props}>
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className={cls} data-shape="text" />
        ))}
      </span>
    )
  }

  return <span className={cls} data-shape={shape} style={sized} {...props} />
}
