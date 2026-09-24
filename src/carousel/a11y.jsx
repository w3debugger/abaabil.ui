'use client'

import './carousel.css'
import { useEffect, useId, useRef, useState } from 'react'
import { step } from './styled.jsx'

/**
 * Carousel, a11y tier. The W3C APG carousel pattern, minus autoplay.
 *
 * The platform already scrolls, snaps and flings the track. What it
 * does not do is say what the thing is or where you are in it, so this
 * tier adds the region with its name and "carousel" role description,
 * a "slide, n of N" group per slide, the track in the tab order so the
 * arrow keys page through it natively, `aria-controls` from each button
 * to the track, `aria-disabled` on a button with nowhere to go, and a
 * polite live region that reads "Slide n of N" once a scroll settles.
 * The track and slides are divs here rather than the normal tier's
 * list, because `role="group"` is not permitted on an <li> and the
 * slide's own name already carries the count a list would.
 *
 * The one hook is a scroll listener. It waits for the browser's own
 * `scrollend` where that exists and falls back to a 150ms quiet period
 * on `scroll`, so a fling reports once, at rest, rather than on every
 * frame. Position is `scrollLeft` over one slide's width, which is
 * right whether one slide or three are in view.
 *
 * No autoplay, on purpose. If it is ever added it must pause on hover,
 * on focus, and whenever reduced motion is requested, or it fails WCAG
 * 2.2.2 for everyone who reads slower than the timer.
 *
 * @param {object} props
 * @param {import('react').ReactNode[]} [props.items]
 * @param {string} [props.label] Accessible name for the region. A
 *   carousel with no name is announced as "carousel" and nothing else.
 * @param {boolean} [props.loop=false]
 * @param {string} [props.prevLabel='Previous']
 * @param {string} [props.nextLabel='Next']
 * @param {string} [props.className]
 */
export default function Carousel_a11y({
  items,
  children,
  label,
  loop = false,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  className,
  ...props
}) {
  const trackId = useId()
  const trackRef = useRef(null)
  const [pos, setPos] = useState({ index: 0, atStart: true, atEnd: false })
  const cls = className ? `abaabil-carousel ${className}` : 'abaabil-carousel'
  const slides = items ?? [].concat(children ?? [])
  const count = slides.length

  if (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV !== 'production' &&
    !(label || props['aria-label'] || props['aria-labelledby'])
  ) {
    console.warn(
      'abaabil/carousel: no `label` given, so the carousel has no accessible ' +
        'name and is announced as an unnamed region. Pass `label`, `aria-label`, ' +
        'or `aria-labelledby`.'
    )
  }

  useEffect(() => {
    const track = trackRef.current
    let timer
    const settle = () => {
      const at = Math.abs(track.scrollLeft)
      const width = track.firstElementChild?.clientWidth || track.clientWidth || 1
      setPos({
        index: Math.round(at / width),
        atStart: at < 1,
        atEnd: at >= track.scrollWidth - track.clientWidth - 1,
      })
    }
    const native = 'onscrollend' in track
    const type = native ? 'scrollend' : 'scroll'
    const onScroll = native
      ? settle
      : () => {
          clearTimeout(timer)
          timer = setTimeout(settle, 150)
        }
    settle()
    track.addEventListener(type, onScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      track.removeEventListener(type, onScroll)
    }
  }, [])

  return (
    <div className={cls} role="region" aria-roledescription="carousel" aria-label={label} {...props}>
      <button
        type="button"
        className="abaabil-carousel__prev"
        aria-controls={trackId}
        aria-disabled={!loop && pos.atStart}
        onClick={() => step(trackRef.current, -1, loop)}
      >
        <span className="abaabil-visually-hidden">{prevLabel}</span>
      </button>
      <div
        ref={trackRef}
        id={trackId}
        className="abaabil-carousel__track"
        tabIndex={0}
        aria-label={label}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="abaabil-carousel__slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
          >
            {slide}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="abaabil-carousel__next"
        aria-controls={trackId}
        aria-disabled={!loop && pos.atEnd}
        onClick={() => step(trackRef.current, 1, loop)}
      >
        <span className="abaabil-visually-hidden">{nextLabel}</span>
      </button>
      <span className="abaabil-visually-hidden" aria-live="polite">
        Slide {pos.index + 1} of {count}
      </span>
    </div>
  )
}
