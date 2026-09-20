import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import Checkbox from '../src/checkbox/index.jsx'
import CheckboxA11y, { CheckboxGroup } from '../src/checkbox/a11y.jsx'

describe('Checkbox (normal tier)', () => {
  it('renders a native checkbox input with the base class', () => {
    render(<Checkbox data-testid="cb" />)
    const cb = screen.getByTestId('cb')
    expect(cb.tagName).toBe('INPUT')
    expect(cb).toHaveAttribute('type', 'checkbox')
    expect(cb).toHaveClass('abaabil-checkbox')
  })

  it('merges a consumer className instead of replacing the base class', () => {
    render(<Checkbox data-testid="cb" className="mine" />)
    const cb = screen.getByTestId('cb')
    expect(cb).toHaveClass('abaabil-checkbox')
    expect(cb).toHaveClass('mine')
  })

  it('adds no ARIA attributes and no explicit role at the normal tier', () => {
    render(<Checkbox data-testid="cb" />)
    const attrs = [...screen.getByTestId('cb').attributes].map((a) => a.name)
    expect(attrs.filter((a) => a.startsWith('aria-'))).toEqual([])
    expect(attrs).not.toContain('role')
  })
})

describe('Checkbox (styled tier)', () => {
  it('re-exports the same component contract', async () => {
    const { default: Styled } = await import('../src/checkbox/styled.jsx')
    render(<Styled data-testid="cb" />)
    const cb = screen.getByTestId('cb')
    expect(cb).toHaveAttribute('type', 'checkbox')
    expect(cb).toHaveClass('abaabil-checkbox')
  })
})

describe('Checkbox (a11y tier)', () => {
  let warn
  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { warn.mockRestore() })

  it('associates a real <label> with the input via htmlFor/id', () => {
    render(<CheckboxA11y label="Subscribe" />)
    const cb = screen.getByRole('checkbox', { name: 'Subscribe' })
    const label = screen.getByText('Subscribe')
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveAttribute('for', cb.id)
    expect(cb.id).toBeTruthy()
  })

  it('toggles the checkbox when the label is clicked', async () => {
    render(<CheckboxA11y label="Subscribe" />)
    const cb = screen.getByRole('checkbox', { name: 'Subscribe' })
    expect(cb.checked).toBe(false)
    await userEvent.click(screen.getByText('Subscribe'))
    expect(cb.checked).toBe(true)
    await userEvent.click(screen.getByText('Subscribe'))
    expect(cb.checked).toBe(false)
  })

  it('sets aria-describedby to the description id when description is given', () => {
    render(<CheckboxA11y label="Subscribe" description="You can unsubscribe anytime." />)
    const cb = screen.getByRole('checkbox', { name: 'Subscribe' })
    const describedBy = cb.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    const descEl = document.getElementById(describedBy)
    expect(descEl).toHaveTextContent('You can unsubscribe anytime.')
  })

  it('omits aria-describedby when there is no description and no consumer value', () => {
    render(<CheckboxA11y label="Subscribe" />)
    expect(screen.getByRole('checkbox', { name: 'Subscribe' })).not.toHaveAttribute('aria-describedby')
  })

  it('merges a consumer-supplied aria-describedby with the generated description id', () => {
    render(
      <>
        <span id="external-hint">External hint</span>
        <CheckboxA11y label="Subscribe" description="Generated hint" aria-describedby="external-hint" />
      </>
    )
    const cb = screen.getByRole('checkbox', { name: 'Subscribe' })
    const ids = cb.getAttribute('aria-describedby').split(' ')
    expect(ids).toContain('external-hint')
    expect(ids).toHaveLength(2)
    const descId = ids.find((id) => id !== 'external-hint')
    expect(document.getElementById(descId)).toHaveTextContent('Generated hint')
  })

  it('keeps a consumer-supplied aria-describedby even without a description', () => {
    render(
      <>
        <span id="external-hint">External hint</span>
        <CheckboxA11y label="Subscribe" aria-describedby="external-hint" />
      </>
    )
    expect(screen.getByRole('checkbox', { name: 'Subscribe' })).toHaveAttribute('aria-describedby', 'external-hint')
  })

  it('generates unique ids across two rendered instances', () => {
    render(
      <>
        <CheckboxA11y label="First" />
        <CheckboxA11y label="Second" />
      </>
    )
    const first = screen.getByRole('checkbox', { name: 'First' })
    const second = screen.getByRole('checkbox', { name: 'Second' })
    expect(first.id).toBeTruthy()
    expect(second.id).toBeTruthy()
    expect(first.id).not.toBe(second.id)
  })

  it('warns in development when there is no accessible name', () => {
    render(<CheckboxA11y />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('does not warn when a label is supplied', () => {
    render(<CheckboxA11y label="Subscribe" />)
    expect(warn).not.toHaveBeenCalled()
  })

  it('sets input.indeterminate as a DOM property and mirrors it to aria-checked="mixed"', () => {
    const { rerender } = render(<CheckboxA11y label="Select all" indeterminate />)
    const cb = screen.getByRole('checkbox', { name: 'Select all' })
    expect(cb.indeterminate).toBe(true)
    expect(cb).toHaveAttribute('aria-checked', 'mixed')

    rerender(<CheckboxA11y label="Select all" indeterminate={false} />)
    expect(cb.indeterminate).toBe(false)
    expect(cb).not.toHaveAttribute('aria-checked')
  })

  it('composes a consumer-supplied ref with the internal ref indeterminate needs', () => {
    const consumerRef = createRef()
    render(<CheckboxA11y label="Select all" indeterminate ref={consumerRef} />)
    expect(consumerRef.current).not.toBeNull()
    expect(consumerRef.current.tagName).toBe('INPUT')
    expect(consumerRef.current.indeterminate).toBe(true)
  })
})

describe('CheckboxGroup (a11y tier)', () => {
  it('renders a real fieldset/legend pair, and the legend names the group', () => {
    render(
      <CheckboxGroup label="Notification preferences">
        <CheckboxA11y label="Email" />
        <CheckboxA11y label="SMS" />
      </CheckboxGroup>
    )
    const group = screen.getByRole('group', { name: 'Notification preferences' })
    expect(group.tagName).toBe('FIELDSET')
    const legend = screen.getByText('Notification preferences')
    expect(legend.tagName).toBe('LEGEND')
    expect(screen.getByRole('checkbox', { name: 'Email' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'SMS' })).toBeInTheDocument()
  })
})

describe('Checkbox accessibility (axe)', () => {
  it('has no violations for a labelled checkbox with a description', async () => {
    const { container } = render(
      <CheckboxA11y label="Subscribe" description="You can unsubscribe anytime." />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no violations for a CheckboxGroup', async () => {
    const { container } = render(
      <CheckboxGroup label="Notification preferences">
        <CheckboxA11y label="Email" />
        <CheckboxA11y label="SMS" description="Standard rates may apply." />
      </CheckboxGroup>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
