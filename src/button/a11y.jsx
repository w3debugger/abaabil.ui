import Button from './styled.jsx'

/**
 * Button, a11y tier. Adds the behaviour that cannot be expressed through
 * CSS or plain prop spreading. No hooks, so this still renders in a
 * server tree: do not add a "use client" directive.
 *
 * @param {object} props
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.keepFocusable] Use aria-disabled instead of the
 *   native disabled attribute, so screen reader users can still find it.
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 */
export default function Button_a11y({
  as = 'button',
  disabled = false,
  keepFocusable = false,
  leftIcon,
  rightIcon,
  onClick,
  onKeyDown,
  children,
  ...props
}) {
  const label = props['aria-label'] ?? props['aria-labelledby']
  const hasText = typeof children === 'string' ? children.trim().length > 0 : Boolean(children)

  if (process.env.NODE_ENV !== 'production' && (leftIcon || rightIcon) && !hasText && !label) {
    console.warn(
      'abaabil/button: an icon-only button has no accessible name. ' +
        'Pass aria-label or aria-labelledby.'
    )
  }

  const suppressed = (handler) => (event) => {
    if (disabled) {
      event.preventDefault()
      return
    }
    handler?.(event)
  }

  const semantics =
    as === 'button'
      ? keepFocusable
        ? { 'aria-disabled': disabled || undefined }
        : { disabled }
      : {
          // <a> has no disabled state and does not activate on Space.
          role: 'button',
          tabIndex: disabled ? -1 : 0,
          'aria-disabled': disabled || undefined,
        }

  const handleKeyDown = (event) => {
    if (as !== 'button' && (event.key === ' ' || event.key === 'Enter')) {
      event.preventDefault()
      suppressed(onClick)(event)
    }
    onKeyDown?.(event)
  }

  return (
    <Button
      as={as}
      {...semantics}
      onClick={suppressed(onClick)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {leftIcon ? <span aria-hidden="true">{leftIcon}</span> : null}
      {children}
      {rightIcon ? <span aria-hidden="true">{rightIcon}</span> : null}
    </Button>
  )
}
