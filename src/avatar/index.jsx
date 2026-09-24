/**
 * Avatar, normal tier. An image when there is one, initials when there
 * is not. Structure only: no styles, no ARIA logic. Contains no hooks,
 * so it renders in both server and client trees.
 *
 * There is deliberately no fallback-on-load-error. Detecting a broken
 * image needs an onError handler and state, which would make every tier
 * a client component for a case the server usually already knows about.
 * Pass no `src` and you get initials.
 *
 * @param {object} props
 * @param {string} [props.src] Image URL. Omit for initials.
 * @param {string} [props.name] Used for the initials, and by the a11y
 *   tier for the accessible name.
 * @param {string} [props.alt=''] Alt text for the image. Empty by
 *   default, which is the right answer more often than not: an avatar
 *   beside a visible name is decorative.
 * @param {string} [props.className] Merged with the base class.
 */
export default function Avatar({ src, name, alt = '', className, children, ...props }) {
  const cls = className ? `abaabil-avatar ${className}` : 'abaabil-avatar'

  return (
    <span className={cls} {...props}>
      {src ? (
        <img src={src} alt={alt} className="abaabil-avatar__image" />
      ) : (
        <span className="abaabil-avatar__initials">{children ?? initials(name)}</span>
      )}
    </span>
  )
}

/**
 * First letter of the first and last word. Not the first two letters of
 * the string, which turns "Fatima Ahmed" into "FA" but "Ali" into "AL",
 * and not a slice of every word, which turns a four-part Arabic name
 * into four letters in a circle.
 *
 * Uses Intl.Segmenter where available so a name whose first character
 * is an emoji or an astral-plane letter is not cut in half. One
 * segmenter for the module: constructing one is an ICU object, and
 * an avatar list would otherwise build two per row per render.
 */
const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter() : null

export function initials(name) {
  if (!name) return ''
  const words = String(name).trim().split(/\s+/).filter(Boolean)
  if (!words.length) return ''
  const first = (w) => {
    if (seg) {
      const [g] = seg.segment(w)
      return g ? g.segment : w[0]
    }
    return [...w][0]
  }
  return words.length === 1
    ? first(words[0]).toUpperCase()
    : (first(words[0]) + first(words[words.length - 1])).toUpperCase()
}
