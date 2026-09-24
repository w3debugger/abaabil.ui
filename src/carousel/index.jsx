/**
 * Carousel, normal tier. A scroll-snap list with a previous and a next
 * button. Structure only: no styles, no ARIA. Contains no hooks, so it
 * renders in both server and client trees.
 *
 * Embla, Swiper and react-slick each ship drag physics in JavaScript:
 * pointer tracking, velocity, momentum, snapping, right-to-left, all
 * of it. The browser already has every one of those behaviours in a
 * scroll container. CSS scroll-snap lands on a slide, touch and
 * trackpad fling it with native momentum, arrow keys move it once it
 * can take focus, and a right-to-left page mirrors it. That is the
 * decision that makes this component small: the track is an overflow
 * container and the two buttons call scrollBy on it. There is no state
 * to hold, because the scroll position is the state and the browser
 * already holds it.
 *
 * Reduced motion is read again at click time, not only in the
 * stylesheet, because the `behavior` argument to scrollBy overrides
 * the stylesheet's scroll-behavior.
 */

/**
 * Moves the track one viewport in `direction` (1 forward, -1 back).
 * With `loop`, a step past either end wraps to the other one.
 *
 * scrollLeft runs from 0 to a negative number in a right-to-left
 * container, so the ends are measured by magnitude and the step is
 * signed by the container's direction.
 */
export function step(track, direction, loop) {
  const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const behavior = reduced ? 'auto' : 'smooth'
  const sign = getComputedStyle(track).direction === 'rtl' ? -1 : 1
  const end = track.scrollWidth - track.clientWidth
  const at = Math.abs(track.scrollLeft)

  if (loop && direction > 0 && at >= end - 1) track.scrollTo({ left: 0, behavior })
  else if (loop && direction < 0 && at < 1) track.scrollTo({ left: end * sign, behavior })
  else track.scrollBy({ left: direction * track.clientWidth * sign, behavior })
}

const trackOf = (event) =>
  event.currentTarget.parentElement.querySelector('.abaabil-carousel__track')

/**
 * @param {object} props
 * @param {import('react').ReactNode[]} [props.items] One slide each.
 *   `children` is the alternative, one slide per child.
 * @param {boolean} [props.loop=false] Next at the last slide returns to
 *   the first, and Previous at the first goes to the last.
 * @param {string} [props.prevLabel='Previous']
 * @param {string} [props.nextLabel='Next']
 * @param {string} [props.className] Merged with the base class.
 */
export default function Carousel({
  items,
  children,
  loop = false,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  className,
  ...props
}) {
  const cls = className ? `abaabil-carousel ${className}` : 'abaabil-carousel'
  const slides = items ?? [].concat(children ?? [])

  return (
    <div className={cls} {...props}>
      <button
        type="button"
        className="abaabil-carousel__prev"
        onClick={(event) => step(trackOf(event), -1, loop)}
      >
        <span className="abaabil-visually-hidden">{prevLabel}</span>
      </button>
      <ul className="abaabil-carousel__track">
        {slides.map((slide, i) => (
          <li key={i} className="abaabil-carousel__slide">
            {slide}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="abaabil-carousel__next"
        onClick={(event) => step(trackOf(event), 1, loop)}
      >
        <span className="abaabil-visually-hidden">{nextLabel}</span>
      </button>
    </div>
  )
}
