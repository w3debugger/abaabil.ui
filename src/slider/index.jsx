/**
 * Slider, normal tier. A native <input type="range"> and nothing else.
 * Structure only: no styles, no ARIA logic. Contains no hooks, so it
 * renders in both server and client trees.
 *
 * Keyboard support, the value, the min/max/step arithmetic and the
 * announced role all come from the platform. There is no reason to
 * reimplement any of it, and a div with role="slider" is how most
 * libraries end up shipping a control that cannot be dragged with a
 * keyboard.
 *
 * @param {object} props
 * @param {number} [props.min=0]
 * @param {number} [props.max=100]
 * @param {number} [props.step=1]
 * @param {string} [props.className] Merged with the base class.
 */
export default function Slider({ min = 0, max = 100, step = 1, className, ...props }) {
  const cls = className ? `abaabil-slider ${className}` : 'abaabil-slider'

  return <input type="range" className={cls} min={min} max={max} step={step} {...props} />
}
