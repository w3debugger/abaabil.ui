'use client'

import { useId } from 'react'
import './card.css'
import Card from './styled.jsx'

/**
 * Card, a11y tier.
 *
 * A card is a <div>, and a div has no role, so by default there is
 * nothing here for a screen reader to land on or skip past. That is
 * usually correct: a page of twelve cards announced as twelve named
 * groups is twelve extra stops on the way to the content.
 *
 * So the semantics are opt-in, the same arrangement accordion uses for
 * its group. Passing `heading` renders it in a real heading element at
 * the level you choose and points the card's aria-labelledby at it,
 * which makes the card a named region a screen reader user can jump to
 * and, more importantly, puts the card in the page's heading outline
 * where it belongs. Passing nothing leaves a plain div.
 *
 * `headingLevel` has no default that guesses. A heading's level depends
 * on where the card sits in the document, which this component cannot
 * know, and a page of <h3>s under no <h2> is a broken outline that
 * looks fine. So it is required alongside `heading`, and a dev-mode
 * warning fires if the heading is given without it rather than
 * silently picking one.
 *
 * `role="region"` is applied only with a heading, never alone. An
 * unnamed region is announced as "region" with no name, which is worse
 * than not being a landmark at all; the same reasoning as accordion's
 * group.
 *
 * useId is a hook, so this tier carries 'use client' while the normal
 * and styled tiers do not. That is the cost of connecting a heading to
 * the thing it names without asking every caller to invent an id.
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.heading] Rendered as the
 *   card's heading and used as its accessible name.
 * @param {2|3|4|5|6} [props.headingLevel] Required when `heading` is given.
 * @param {import('react').ReactNode} [props.header] Extra header content,
 *   rendered after the heading.
 * @param {import('react').ReactNode} [props.footer]
 * @param {string} [props.className]
 */
export default function Card_a11y({
  heading,
  headingLevel,
  header,
  footer,
  children,
  ...props
}) {
  const headingId = useId()

  if (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV !== 'production' &&
    heading &&
    !headingLevel
  ) {
    console.warn(
      'abaabil/card: `heading` was given without `headingLevel`. The correct ' +
        'level depends on where this card sits in the document, so there is no ' +
        'safe default; the heading has been rendered as a plain element instead ' +
        'of guessing and breaking the page outline.'
    )
  }

  if (!heading) {
    return (
      <Card header={header} footer={footer} {...props}>
        {children}
      </Card>
    )
  }

  const Heading = headingLevel ? `h${headingLevel}` : 'div'

  return (
    <Card
      header={
        <>
          <Heading className="abaabil-card__heading" id={headingId}>
            {heading}
          </Heading>
          {header}
        </>
      }
      footer={footer}
      role="region"
      aria-labelledby={headingId}
      {...props}
    >
      {children}
    </Card>
  )
}
