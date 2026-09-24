import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { axe } from 'jest-axe'
import Otp from '../src/otp/index.jsx'
import A11yOtp from '../src/otp/a11y.jsx'

afterEach(() => vi.restoreAllMocks())

describe('Otp (normal tier)', () => {
  // The decision that makes this component small: one real text field,
  // not six inputs with focus juggling. Autofill, paste and backspace
  // all come from the platform.
  it('renders one textbox wired for SMS autofill and the numeric keyboard', () => {
    render(<Otp />)
    const el = screen.getByRole('textbox')
    expect(screen.getAllByRole('textbox')).toHaveLength(1)
    expect(el).toHaveAttribute('inputmode', 'numeric')
    expect(el).toHaveAttribute('autocomplete', 'one-time-code')
    expect(el).toHaveAttribute('pattern', '[0-9]*')
    expect(el).toHaveAttribute('maxlength', '6')
  })

  it('sizes the strip from the length prop', () => {
    render(<Otp length={4} />)
    const el = screen.getByRole('textbox')
    expect(el).toHaveAttribute('maxlength', '4')
    expect(el.style.getPropertyValue('--otp-length')).toBe('4')
  })

  it('accepts letters and shows the full keyboard when alphanumeric', () => {
    render(<Otp alphanumeric />)
    const el = screen.getByRole('textbox')
    expect(el).toHaveAttribute('pattern', '[A-Za-z0-9]*')
    expect(el).toHaveAttribute('inputmode', 'text')
  })

  it('refuses a letter in the numeric variant through the pattern check', async () => {
    render(<Otp />)
    const el = screen.getByRole('textbox')
    await userEvent.type(el, '12a')
    expect(el.checkValidity()).toBe(false)
    expect(el.validity.patternMismatch).toBe(true)
  })

  it('adds no ARIA attributes and no role at the normal tier', () => {
    render(<Otp />)
    const el = screen.getByRole('textbox')
    expect([...el.attributes].filter((a) => a.name.startsWith('aria-'))).toEqual([])
    expect(el).not.toHaveAttribute('role')
  })
})

describe('Otp (a11y tier)', () => {
  it('fires onComplete once, with the value, when the code reaches its length', async () => {
    const onComplete = vi.fn()
    render(<A11yOtp label="Code" onComplete={onComplete} />)
    await userEvent.type(screen.getByLabelText('Code'), '123456')
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith('123456')
  })

  it('still runs a consumer onInput alongside onComplete', async () => {
    const onInput = vi.fn()
    render(<A11yOtp label="Code" length={2} onInput={onInput} onComplete={() => {}} />)
    await userEvent.type(screen.getByLabelText('Code'), '12')
    expect(onInput).toHaveBeenCalledTimes(2)
  })

  it('associates a real label via htmlFor/id', async () => {
    render(<A11yOtp label="Code" />)
    const input = screen.getByLabelText('Code')
    const label = screen.getByText('Code')
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveAttribute('for', input.id)
    await userEvent.click(label)
    expect(input).toHaveFocus()
  })

  it('hides the label visually when asked, keeping it a real <label>', () => {
    render(<A11yOtp label="Code" hideLabel />)
    expect(screen.getByText('Code')).toHaveClass('abaabil-visually-hidden')
    expect(screen.getByLabelText('Code')).toBeInTheDocument()
  })

  it('joins description and error into aria-describedby and sets aria-invalid', () => {
    render(<A11yOtp label="Code" description="Six digits" error="Wrong code" aria-describedby="hint" />)
    const input = screen.getByLabelText('Code')
    const ids = input.getAttribute('aria-describedby').split(' ')
    expect(ids).toHaveLength(3)
    expect(ids).toContain('hint')
    expect(document.getElementById(ids[1])).toHaveTextContent('Six digits')
    expect(document.getElementById(ids[2])).toHaveTextContent('Wrong code')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('omits aria-describedby and aria-invalid when there is nothing to point at', () => {
    render(<A11yOtp label="Code" />)
    const input = screen.getByLabelText('Code')
    expect(input).not.toHaveAttribute('aria-describedby')
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('passes required and a consumer id through, and derives the message ids from that id', () => {
    render(<A11yOtp label="Code" id="otp" required description="Six digits" error="Wrong" />)
    const input = screen.getByLabelText('Code')
    expect(input).toHaveAttribute('id', 'otp')
    expect(input).toBeRequired()
    expect(input).toHaveAttribute('aria-describedby', 'otp-description otp-error')
    expect(screen.getByText('Wrong')).not.toHaveAttribute('role')
  })

  it('puts className and style on the group wrapper, keeping --otp-length on the input', () => {
    render(<A11yOtp label="Code" length={4} className="mine" style={{ flex: 1 }} />)
    const input = screen.getByLabelText('Code')
    expect(input.parentElement).toHaveClass('abaabil-otp-group', 'mine')
    expect(input.parentElement.style.flexGrow).toBe('1')
    expect(input).not.toHaveClass('mine')
    expect(input.style.getPropertyValue('--otp-length')).toBe('4')
  })

  it('warns when it has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yOtp />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('does not warn when aria-label is supplied instead of a label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yOtp aria-label="Code" />)
    expect(warn).not.toHaveBeenCalled()
  })

  it('has no axe violations with a label and an error', async () => {
    const { container } = render(
      <A11yOtp label="Verification code" description="Sent by SMS" error="That code has expired" />
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
