/**
 * Disclosure, normal tier. A native <details>/<summary> pair and nothing
 * else. Structure only: no styles, no ARIA logic. Contains no hooks, so it
 * renders in both server and client trees.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.summary Content for the <summary> element.
 * @param {string} [props.className] Merged with the base class.
 * @param {string} [props.summaryClassName] Merged with the summary's base class.
 */
export function Disclosure({ summary, className, summaryClassName, children, ...props }) {
  const cls = className ? `abaabil-accordion ${className}` : 'abaabil-accordion'
  const summaryCls = summaryClassName
    ? `abaabil-accordion__summary ${summaryClassName}`
    : 'abaabil-accordion__summary'

  return (
    <details className={cls} {...props}>
      <summary className={summaryCls}>{summary}</summary>
      <div className="abaabil-accordion__panel">{children}</div>
    </details>
  )
}

/**
 * Accordion, normal tier. Renders a list of Disclosures that share a
 * `name`, which is what makes the group exclusive: opening one panel closes
 * its siblings, natively, with no JavaScript.
 *
 * The `name` attribute on <details> is Baseline low (Chrome 120, Firefox
 * 130, Safari 17.2), slightly above this library's floor (Chrome 116,
 * Firefox 125, Safari 17). The degradation is safe: a browser that does not
 * group by `name` simply allows more than one panel open at a time, which
 * is still a perfectly usable accordion, just not an exclusive one.
 *
 * @param {object} props
 * @param {Array<{key?: string|number, summary: import('react').ReactNode, children?: import('react').ReactNode}>} props.items
 * @param {string} [props.name] Shared native group name. Defaults to a
 *   stable value so a plain `<Accordion items={...} />` is exclusive out of
 *   the box; pass `name={undefined}` explicitly to opt out.
 * @param {string} [props.className] Merged onto the wrapping element.
 */
export function Accordion({ items, name = 'abaabil-accordion', className, ...props }) {
  const cls = className ? `abaabil-accordion-group ${className}` : 'abaabil-accordion-group'
  return (
    <div className={cls} {...props}>
      {items.map(({ key, summary, children }, index) => (
        <Disclosure key={key ?? index} name={name} summary={summary}>
          {children}
        </Disclosure>
      ))}
    </div>
  )
}

// Default export added in 1.1.0 so accordion matches every other
// component's tiers, which all default-export their main component. The
// named export above keeps working for anything already importing
// `{ Accordion }`.
export default Accordion
