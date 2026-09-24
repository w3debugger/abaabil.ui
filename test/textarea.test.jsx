import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import Textarea from '../src/textarea/index.jsx'
import A11yTextarea from '../src/textarea/a11y.jsx'

describe('Textarea (normal tier)', () => {
  it('renders a native textarea with the base class', () => {
    render(<Textarea data-testid="t" />)
    const el = screen.getByTestId('t')
    expect(el.tagName).toBe('TEXTAREA')
    expect(el).toHaveClass('abaabil-textarea')
  })

  it('defaults rows to 3, because the browser default of 2 is unreadable', () => {
    render(<Textarea data-testid="t" />)
    expect(screen.getByTestId('t')).toHaveAttribute('rows', '3')
  })

  it('allows rows to be overridden', () => {
    render(<Textarea rows={8} data-testid="t" />)
    expect(screen.getByTestId('t')).toHaveAttribute('rows', '8')
  })

  it('merges a consumer className instead of replacing the base class', () => {
    render(<Textarea className="mine" data-testid="t" />)
    const el = screen.getByTestId('t')
    expect(el).toHaveClass('abaabil-textarea')
    expect(el).toHaveClass('mine')
  })

  it('forwards ref as a plain prop (React 19, no forwardRef)', () => {
    let captured = null
    render(<Textarea ref={(el) => { captured = el }} data-testid="t" />)
    expect(captured).not.toBeNull()
    expect(captured.tagName).toBe('TEXTAREA')
  })

  it('adds no ARIA attributes and no role at the normal tier', () => {
    render(<Textarea data-testid="t" />)
    const el = screen.getByTestId('t')
    expect([...el.attributes].map((a) => a.name).filter((a) => a.startsWith('aria-'))).toEqual([])
    expect(el).not.toHaveAttribute('role')
  })
})

describe('Textarea (a11y tier)', () => {
  let warn
  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { warn.mockRestore() })

  it('associates a real label, and clicking it focuses the textarea', async () => {
    render(<A11yTextarea label="Bio" />)
    const field = screen.getByLabelText('Bio')
    const label = screen.getByText('Bio')
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveAttribute('for', field.id)
    await userEvent.click(label)
    expect(field).toHaveFocus()
  })

  it('shows the label visibly by default', () => {
    render(<A11yTextarea label="Bio" />)
    expect(screen.getByText('Bio')).not.toHaveClass('abaabil-visually-hidden')
  })

  it('hides the label visually but keeps it in the accessibility tree when asked', () => {
    render(<A11yTextarea label="Bio" hideLabel />)
    expect(screen.getByText('Bio')).toHaveClass('abaabil-visually-hidden')
    expect(screen.getByLabelText('Bio')).toBeInTheDocument()
  })

  it('wires description into aria-describedby', () => {
    render(<A11yTextarea label="Bio" description="Tell us about yourself" />)
    const field = screen.getByLabelText('Bio')
    const describedBy = field.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy)).toHaveTextContent('Tell us about yourself')
  })

  it('sets aria-invalid and describes the error when one is given', () => {
    render(<A11yTextarea label="Bio" error="Too short" />)
    const field = screen.getByLabelText('Bio')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    const ids = field.getAttribute('aria-describedby').split(' ')
    expect(ids.map((id) => document.getElementById(id).textContent)).toContain('Too short')
  })

  it('does not set aria-invalid when there is no error', () => {
    render(<A11yTextarea label="Bio" />)
    expect(screen.getByLabelText('Bio')).not.toHaveAttribute('aria-invalid')
  })

  it('preserves a consumer aria-describedby alongside the generated ids', () => {
    render(
      <>
        <span id="outside">Outside note</span>
        <A11yTextarea label="Bio" description="Help" error="Bad" aria-describedby="outside" />
      </>
    )
    const ids = screen.getByLabelText('Bio').getAttribute('aria-describedby').split(' ')
    expect(ids).toContain('outside')
    expect(ids).toHaveLength(3)
  })

  it('derives the description and error ids from a consumer-supplied id', () => {
    render(<A11yTextarea label="Bio" id="bio" description="Help" error="Bad" />)
    expect(screen.getByLabelText('Bio')).toHaveAttribute('aria-describedby', 'bio-description bio-error')
  })

  it('renders the error without role="alert"', () => {
    render(<A11yTextarea label="Bio" error="Too short" />)
    expect(screen.getByText('Too short')).not.toHaveAttribute('role')
  })

  it('puts className and style on the group wrapper, not on the textarea', () => {
    render(<A11yTextarea label="Bio" className="mine" style={{ flex: 1 }} />)
    const field = screen.getByLabelText('Bio')
    expect(field.parentElement).toHaveClass('abaabil-textarea-group', 'mine')
    expect(field.parentElement.style.flexGrow).toBe('1')
    expect(field).not.toHaveClass('mine')
  })

  it('warns in development when the field would have no accessible name', () => {
    render(<A11yTextarea />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('abaabil/textarea'))
  })

  it('does not warn when named by aria-label instead of label', () => {
    render(<A11yTextarea aria-label="Bio" />)
    expect(warn).not.toHaveBeenCalled()
  })

  it('accepts typed input', async () => {
    render(<A11yTextarea label="Bio" />)
    const field = screen.getByLabelText('Bio')
    await userEvent.type(field, 'hello')
    expect(field).toHaveValue('hello')
  })

  it('has no axe violations while showing an error', async () => {
    const { container } = render(
      <A11yTextarea label="Bio" description="Max 200 characters" error="Too short" />
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
