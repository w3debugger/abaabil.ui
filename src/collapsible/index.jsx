/**
 * Collapsible, normal tier. A native <details>/<summary> pair.
 * Structure only: no styles, no ARIA logic. Contains no hooks, so it
 * renders in both server and client trees.
 *
 * This is accordion's Disclosure without the group. Accordion exists
 * for several panels that close each other, which is what the `name`
 * attribute does; a collapsible is one section that opens and shuts on
 * its own, which is the far more common case and should not require
 * importing an accordion's stylesheet to get.
 *
 * Every other library in the comparison ships both, under various
 * names: Radix and Chakra call this Collapsible, Headless UI calls it
 * Disclosure, Bootstrap and Ant Design call it Collapse.
 *
 * The browser does the whole job. Open and closed state, the toggle,
 * the keyboard behaviour and the expanded state exposed to assistive
 * technology are all <details>, which is why all three tiers here ship
 * no JavaScript at all.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.summary The always-visible trigger.
 * @param {boolean} [props.defaultOpen] Open on first render. Maps to the
 *   native `open` attribute, which the browser then owns.
 * @param {string} [props.className] Merged with the base class.
 * @param {string} [props.summaryClassName] Merged with the summary's base class.
 */
export default function Collapsible({
  summary,
  defaultOpen,
  className,
  summaryClassName,
  children,
  ...props
}) {
  const cls = className ? `abaabil-collapsible ${className}` : 'abaabil-collapsible'
  const summaryCls = summaryClassName
    ? `abaabil-collapsible__summary ${summaryClassName}`
    : 'abaabil-collapsible__summary'

  return (
    <details className={cls} open={defaultOpen} {...props}>
      <summary className={summaryCls}>{summary}</summary>
      <div className="abaabil-collapsible__panel">{children}</div>
    </details>
  )
}
