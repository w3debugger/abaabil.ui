import './separator.css'
import Separator from './styled.jsx'

/**
 * Separator, a11y tier. Two additions, both of which the platform gets
 * wrong on its own for this element.
 *
 * `aria-orientation` when vertical. <hr> has an implicit
 * aria-orientation of horizontal, and rotating it with CSS does not
 * change that, so a vertical rule is announced as a horizontal one.
 * This is the whole reason a separator is worth a component: the
 * element is right and one of its two orientations is not.
 *
 * `decorative`, which removes it from the accessibility tree entirely.
 * Most rules on a page divide things visually and mean nothing to
 * someone who cannot see them; a screen reader announcing "separator"
 * between every row of a list is noise, not structure. Marking those
 * aria-hidden is the correct answer, and it has to be opt-in rather
 * than the default because a separator between two genuinely distinct
 * regions does carry meaning.
 *
 * No hooks, so all three separator tiers render in a Server Component
 * tree and ship zero runtime JavaScript.
 *
 * @param {object} props
 * @param {'horizontal'|'vertical'} [props.orientation='horizontal']
 * @param {boolean} [props.decorative=false] Hide it from assistive
 *   technology, for a rule that is only a visual device.
 * @param {string} [props.className]
 */
export default function Separator_a11y({
  orientation = 'horizontal',
  decorative = false,
  ...props
}) {
  const semantics = decorative
    ? { 'aria-hidden': 'true' }
    : orientation === 'vertical'
      ? { 'aria-orientation': 'vertical' }
      : null

  return <Separator orientation={orientation} {...semantics} {...props} />
}
