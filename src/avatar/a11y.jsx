import './avatar.css'
import { initials } from './styled.jsx'

/**
 * Avatar, a11y tier.
 *
 * The whole question with an avatar is whether it carries information
 * or repeats it, and the answer changes per use, which is why this tier
 * asks rather than guesses.
 *
 * - Beside a visible name, the avatar is **decorative**. It says
 *   nothing the text does not, and giving it a name means hearing the
 *   person twice. That is the default here.
 * - Alone, in a stack of collaborators or a comment with no byline, it
 *   is the only thing identifying someone, so it needs a name. Pass
 *   `decorative={false}`.
 *
 * Both cases are handled properly rather than left to `alt`. A
 * decorative image gets `alt=""` and the initials fallback is hidden
 * from assistive tech entirely; a meaningful one gets the name on
 * whichever of the two is rendered. The initials are never the
 * accessible name: "FA" read aloud is not a person.
 *
 * No hooks, so this renders inside a React Server Component tree. All
 * three avatar tiers ship zero runtime JavaScript.
 *
 * @param {object} props
 * @param {string} [props.src]
 * @param {string} [props.name] The person. Used for the initials and,
 *   when not decorative, for the accessible name.
 * @param {boolean} [props.decorative=true] Whether the avatar repeats
 *   information already on screen.
 * @param {string} [props.className]
 */
export default function Avatar_a11y({
  src,
  name,
  decorative = true,
  className,
  children,
  ...props
}) {
  const cls = className ? `abaabil-avatar ${className}` : 'abaabil-avatar'

  if (
    process.env.NODE_ENV !== 'production' &&
    !decorative &&
    !name
  ) {
    console.warn(
      'abaabil/avatar: decorative={false} means this avatar is the only thing ' +
        'identifying someone, so it needs a `name`. Without one it is announced ' +
        'as an unlabelled image.'
    )
  }

  const text = children ?? initials(name)

  return (
    <span className={cls} {...props}>
      {src ? (
        <img
          src={src}
          alt={decorative ? '' : name || ''}
          className="abaabil-avatar__image"
        />
      ) : decorative ? (
        // Hidden outright rather than given alt="": initials are a
        // drawing of a name, and there is nothing here worth announcing
        // when the name is already on screen.
        <span className="abaabil-avatar__initials" aria-hidden="true">
          {text}
        </span>
      ) : (
        // role="img" so the name lands on something that can carry it.
        // aria-label on a bare <span> is prohibited and gets discarded,
        // which is how a label silently does nothing.
        <span className="abaabil-avatar__initials" role="img" aria-label={name}>
          <span aria-hidden="true">{text}</span>
        </span>
      )}
    </span>
  )
}
