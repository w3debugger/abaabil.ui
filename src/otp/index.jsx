/**
 * Otp, normal tier. Structure only: no styles, no ARIA logic. Contains
 * no hooks, so it renders in both server and client trees.
 *
 * A one-time code field. The platform already ships everything this
 * pattern needs: `autoComplete="one-time-code"` lets iOS, Android and
 * password managers fill it from an SMS, `inputMode` picks the right
 * keyboard, `pattern` refuses the wrong characters at submit, and
 * `maxLength` stops the entry at the code's length. Paste, backspace,
 * selection, RTL and screen readers work because it is a text field.
 *
 * The decision that makes this small: it is ONE input, not one per
 * digit. The six-box look is the stylesheet's job (a monospace font,
 * letter-spacing sized to the box, and the boxes drawn as a repeating
 * background), so there is no focus juggling, no paste splitter, no
 * backspace-across-boxes handler, and nothing for autofill to fight.
 * `--otp-length` is set inline so the stylesheet can size the strip.
 *
 * @param {object} props
 * @param {number} [props.length=6] Number of characters in the code.
 * @param {boolean} [props.alphanumeric=false] Accept letters as well as
 *   digits, and show the full keyboard instead of the numeric one.
 * @param {string} [props.className] Merged with the base class.
 */
export default function Otp({ length = 6, alphanumeric = false, className, style, ...props }) {
  const cls = className ? `abaabil-otp ${className}` : 'abaabil-otp'

  return (
    <input
      type="text"
      inputMode={alphanumeric ? 'text' : 'numeric'}
      autoComplete="one-time-code"
      pattern={alphanumeric ? '[A-Za-z0-9]*' : '[0-9]*'}
      maxLength={length}
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      className={cls}
      style={{ '--otp-length': length, ...style }}
      {...props}
    />
  )
}
