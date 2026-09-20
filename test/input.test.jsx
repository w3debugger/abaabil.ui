import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import Input from '../src/input/index.jsx'
import A11yInput from '../src/input/a11y.jsx'

describe('Input (normal tier)', () => {
  it('renders a native input with the base class', () => {
    render(<Input data-testid="i" />)
    const el = screen.getByTestId('i')
    expect(el.tagName).toBe('INPUT')
    expect(el).toHaveClass('abaabil-input')
  })

  it('defaults type to "text"', () => {
    render(<Input data-testid="i" />)
    expect(screen.getByTestId('i')).toHaveAttribute('type', 'text')
  })

  it('allows type to be overridden', () => {
    render(<Input type="email" data-testid="i" />)
    expect(screen.getByTestId('i')).toHaveAttribute('type', 'email')
  })

  it('merges a consumer className instead of replacing the base class', () => {
    render(<Input className="mine" data-testid="i" />)
    const el = screen.getByTestId('i')
    expect(el).toHaveClass('abaabil-input')
    expect(el).toHaveClass('mine')
  })

  it('forwards arbitrary props including ref (React 19, no forwardRef)', () => {
    let captured = null
    render(<Input ref={(el) => { captured = el }} data-testid="i" />)
    expect(captured).not.toBeNull()
    expect(captured.dataset.testid).toBe('i')
  })

  it('adds no ARIA attributes and no role at the normal tier', () => {
    render(<Input data-testid="i" />)
    const el = screen.getByTestId('i')
    const attrs = [...el.attributes].map((a) => a.name)
    expect(attrs.filter((a) => a.startsWith('aria-'))).toEqual([])
    expect(el).not.toHaveAttribute('role')
  })
})

describe('Input (a11y tier)', () => {
  let warn
  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { warn.mockRestore() })

  it('associates a real label with the input via htmlFor/id, and clicking the label focuses it', async () => {
    render(<A11yInput label="Name" />)
    const input = screen.getByLabelText('Name')
    const label = screen.getByText('Name')
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveAttribute('for', input.id)
    await userEvent.click(label)
    expect(input).toHaveFocus()
  })

  it('sets aria-describedby to the description id when only a description is given', () => {
    render(<A11yInput label="Name" description="Your full name" />)
    const input = screen.getByLabelText('Name')
    const describedBy = input.getAttribute('aria-describedby')
    const ids = describedBy.split(' ')
    expect(ids).toHaveLength(1)
    expect(document.getElementById(ids[0])).toHaveTextContent('Your full name')
  })

  it('sets aria-describedby to the error id when only an error is given', () => {
    render(<A11yInput label="Name" error="Required" />)
    const input = screen.getByLabelText('Name')
    const describedBy = input.getAttribute('aria-describedby')
    const ids = describedBy.split(' ')
    expect(ids).toHaveLength(1)
    expect(document.getElementById(ids[0])).toHaveTextContent('Required')
  })

  it('sets aria-describedby to both ids, space separated, when description and error are both given', () => {
    render(<A11yInput label="Name" description="Your full name" error="Required" />)
    const input = screen.getByLabelText('Name')
    const describedBy = input.getAttribute('aria-describedby')
    const ids = describedBy.split(' ')
    expect(ids).toHaveLength(2)
    ids.forEach((id) => expect(document.getElementById(id)).not.toBeNull())
  })

  it('omits aria-describedby entirely when there is no description and no error', () => {
    render(<A11yInput label="Name" />)
    expect(screen.getByLabelText('Name')).not.toHaveAttribute('aria-describedby')
  })

  it('merges a consumer-supplied aria-describedby with the generated description/error ids', () => {
    render(
      <A11yInput label="Name" description="Help" error="Bad" aria-describedby="custom-hint" />
    )
    const input = screen.getByLabelText('Name')
    const ids = input.getAttribute('aria-describedby').split(' ')
    expect(ids).toContain('custom-hint')
    expect(ids).toHaveLength(3)
  })

  it('sets aria-invalid when an error is present', () => {
    render(<A11yInput label="Name" error="Required" />)
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when there is no error', () => {
    render(<A11yInput label="Name" />)
    expect(screen.getByLabelText('Name')).not.toHaveAttribute('aria-invalid')
  })

  it('lets a consumer-supplied id win over the generated one, and the label still points at it', () => {
    render(<A11yInput label="Name" id="custom-id" />)
    const input = screen.getByLabelText('Name')
    expect(input).toHaveAttribute('id', 'custom-id')
    expect(screen.getByText('Name')).toHaveAttribute('for', 'custom-id')
  })

  it('generates unique ids across multiple instances', () => {
    render(
      <>
        <A11yInput label="First" />
        <A11yInput label="Second" />
      </>
    )
    const first = screen.getByLabelText('First')
    const second = screen.getByLabelText('Second')
    expect(first.id).not.toBe(second.id)
  })

  it('warns when there is no label, aria-label, or aria-labelledby', () => {
    render(<A11yInput data-testid="i" />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('does not warn when aria-label is supplied instead of a label', () => {
    render(<A11yInput aria-label="Name" />)
    expect(warn).not.toHaveBeenCalled()
  })

  it('does not warn when aria-labelledby is supplied instead of a label', () => {
    render(
      <>
        <span id="ext-label">Name</span>
        <A11yInput aria-labelledby="ext-label" />
      </>
    )
    expect(warn).not.toHaveBeenCalled()
  })

  it('has no axe violations for a labelled input', async () => {
    const { container } = render(<A11yInput label="Name" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations for an input showing both a description and an error', async () => {
    const { container } = render(
      <A11yInput label="Name" description="Help text" error="Required" />
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
