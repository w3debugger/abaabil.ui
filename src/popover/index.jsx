/**
 * Popover, normal tier. Built on the native Popover API, so the trigger,
 * the top layer, light-dismiss (clicking outside), Escape to close and the
 * accessibility-tree relationship between button and panel all come from
 * the browser. There is no JavaScript here at any tier, which is why every
 * popover entry point renders inside a React Server Component tree.
 *
 * Baseline: Chrome and Edge 114, Firefox 125, Safari 17. That sits exactly
 * on this library's declared floor.
 *
 * The `id` is required and is not generated. Generating one would mean
 * useId, which would mean a client boundary, which would cost this
 * component the one property that makes it interesting. An explicit id is
 * a small thing to ask in exchange for shipping zero bytes of runtime.
 */

/**
 * Turns an arbitrary id into something usable inside a CSS custom property
 * name. Ids may legally contain characters that dashed-idents may not, and
 * a malformed anchor-name would silently invalidate the declaration rather
 * than fail loudly.
 */
function anchorNameFor(id) {
  return `--abaabil-popover-${String(id).replace(/[^\w-]/g, '-')}`
}

/**
 * PopoverTrigger, normal tier. A button wired to a popover by id.
 *
 * @param {object} props
 * @param {string} props.target The id of the popover panel this opens.
 * @param {'toggle'|'show'|'hide'} [props.action='toggle'] Native
 *   popovertargetaction.
 * @param {string} [props.className] Merged with the base class.
 */
export function PopoverTrigger({ target, action = 'toggle', className, style, children, ...props }) {
  const cls = className ? `abaabil-popover__trigger ${className}` : 'abaabil-popover__trigger'

  return (
    <button
      type="button"
      popoverTarget={target}
      popoverTargetAction={action}
      className={cls}
      // Named so the panel can anchor to this button where CSS anchor
      // positioning is supported. Set per instance rather than in the
      // stylesheet, because a stylesheet cannot mint a unique name and two
      // popovers sharing one anchor name would both attach to whichever
      // trigger the browser resolved last.
      style={{ anchorName: anchorNameFor(target), ...style }}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * PopoverPanel, normal tier. The popover itself.
 *
 * @param {object} props
 * @param {string} props.id Must match the trigger's `target`.
 * @param {'auto'|'manual'} [props.mode='auto'] Native popover mode. `auto`
 *   light-dismisses and closes on Escape; `manual` does neither and must
 *   be closed by a trigger.
 * @param {string} [props.className] Merged with the base class.
 */
export function PopoverPanel({ id, mode = 'auto', className, style, children, ...props }) {
  const cls = className ? `abaabil-popover ${className}` : 'abaabil-popover'

  return (
    <div
      id={id}
      popover={mode}
      className={cls}
      style={{ positionAnchor: anchorNameFor(id), ...style }}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Popover, normal tier. The trigger and the panel as one component, for
 * the common case where they sit together.
 *
 * Renders a fragment rather than a wrapper element, so the button lands
 * exactly where you put the component and nothing is added to your layout.
 * The panel's position in the DOM does not matter: it renders in the top
 * layer.
 *
 * @param {object} props
 * @param {string} props.id Panel id; also wires the trigger.
 * @param {import('react').ReactNode} props.trigger Button content.
 * @param {object} [props.triggerProps] Spread onto the button.
 * @param {'auto'|'manual'} [props.mode='auto']
 */
export function Popover({ id, trigger, triggerProps, mode = 'auto', children, ...props }) {
  return (
    <>
      <PopoverTrigger target={id} {...triggerProps}>
        {trigger}
      </PopoverTrigger>
      <PopoverPanel id={id} mode={mode} {...props}>
        {children}
      </PopoverPanel>
    </>
  )
}

export default Popover
