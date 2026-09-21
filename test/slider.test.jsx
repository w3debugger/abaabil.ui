import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { axe } from 'jest-axe'
import Slider from '../src/slider/index.jsx'
import A11ySlider from '../src/slider/a11y.jsx'

// jsdom does not implement range-input keyboard behaviour: ArrowRight
// does not move a plain <input type="range"> there either, so it is not
// something this component could fix. Value changes are driven with a
// change event instead, which is the same event the browser fires. The
// arrow keys themselves are the platform's, and are checked in a real
// browser on the docs site.
const drag = (el, value) => fireEvent.change(el, { target: { value: String(value) } })

describe('Slider (normal tier)', () => {
  it('renders a native range input with the base class', () => {
    render(<Slider data-testid="s" />)
    const el = screen.getByTestId('s')
    expect(el.tagName).toBe('INPUT')
    expect(el).toHaveAttribute('type', 'range')
    expect(el).toHaveClass('abaabil-slider')
  })

  it('defaults min, max and step', () => {
    render(<Slider data-testid="s" />)
    const el = screen.getByTestId('s')
    expect(el).toHaveAttribute('min', '0')
    expect(el).toHaveAttribute('max', '100')
    expect(el).toHaveAttribute('step', '1')
  })

  it('is exposed as a slider and carries the value the platform manages', () => {
    render(<Slider aria-label="Volume" defaultValue={50} />)
    const el = screen.getByRole('slider')
    expect(el).toHaveValue('50')
    drag(el, 51)
    expect(el).toHaveValue('51')
  })

  it('adds no ARIA attributes and no role at the normal tier', () => {
    render(<Slider data-testid="s" />)
    const el = screen.getByTestId('s')
    expect([...el.attributes].map((a) => a.name).filter((a) => a.startsWith('aria-'))).toEqual([])
    expect(el).not.toHaveAttribute('role')
  })
})

describe('Slider (a11y tier)', () => {
  let warn
  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { warn.mockRestore() })

  it('associates a real label via htmlFor/id', () => {
    render(<A11ySlider label="Volume" />)
    const el = screen.getByRole('slider', { name: 'Volume' })
    expect(screen.getByText('Volume')).toHaveAttribute('for', el.id)
  })

  it('wires description into aria-describedby', () => {
    render(<A11ySlider label="Volume" description="Applies to all devices" />)
    const id = screen.getByRole('slider').getAttribute('aria-describedby')
    expect(document.getElementById(id)).toHaveTextContent('Applies to all devices')
  })

  it('sets aria-valuetext from formatValue, so a price is not announced as a bare number', () => {
    render(<A11ySlider label="Budget" defaultValue={50} formatValue={(v) => `$${v}`} />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '$50')
  })

  it('shows the formatted value in an output when asked', () => {
    const { container } = render(
      <A11ySlider label="Budget" defaultValue={50} showValue formatValue={(v) => `$${v}`} />
    )
    const output = container.querySelector('output')
    expect(output).toHaveTextContent('$50')
  })

  it('hides the visible output from assistive tech, which already hears the value', () => {
    const { container } = render(<A11ySlider label="Volume" defaultValue={50} showValue />)
    expect(container.querySelector('output')).toHaveAttribute('aria-hidden', 'true')
  })

  it('updates the output as the value changes', () => {
    const { container } = render(<A11ySlider label="Volume" defaultValue={50} showValue />)
    drag(screen.getByRole('slider'), 52)
    expect(container.querySelector('output')).toHaveTextContent('52')
  })

  it('updates aria-valuetext as the value changes, not just the visible output', () => {
    render(<A11ySlider label="Budget" defaultValue={50} formatValue={(v) => `$${v}`} />)
    const el = screen.getByRole('slider')
    drag(el, 75)
    expect(el).toHaveAttribute('aria-valuetext', '$75')
  })

  it('defaults an uncontrolled slider to the midpoint, matching the native thumb', () => {
    const { container } = render(<A11ySlider label="Volume" min={0} max={200} showValue />)
    expect(container.querySelector('output')).toHaveTextContent('100')
  })

  it('clamps a defaultValue outside the range, so the output cannot disagree with the thumb', () => {
    // A range input pins an out-of-range value to the nearest end. An
    // unclamped copy of it printed "30" next to a thumb sitting at 11.
    const { container } = render(<A11ySlider label="Volume" min={0} max={11} defaultValue={30} showValue />)
    expect(screen.getByRole('slider')).toHaveValue('11')
    expect(container.querySelector('output')).toHaveTextContent('11')
  })

  it('follows the given value when controlled', () => {
    const { container } = render(
      <A11ySlider label="Volume" value={17} onChange={() => {}} showValue />
    )
    expect(screen.getByRole('slider')).toHaveValue('17')
    expect(container.querySelector('output')).toHaveTextContent('17')
  })

  it('reports changes through onChange', () => {
    const onChange = vi.fn()
    render(<A11ySlider label="Volume" defaultValue={50} onChange={onChange} />)
    drag(screen.getByRole('slider'), 51)
    expect(onChange).toHaveBeenCalled()
  })

  it('warns in development when there is no accessible name', () => {
    render(<A11ySlider />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('abaabil/slider'))
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <A11ySlider label="Budget" description="Monthly" defaultValue={50} showValue formatValue={(v) => `$${v}`} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
