import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import Radio from '../src/radio/index.jsx'
import RadioA11y, { RadioGroup } from '../src/radio/a11y.jsx'

describe('Radio (normal tier)', () => {
  it('renders a native radio input with the base class', () => {
    render(<Radio data-testid="r" />)
    const r = screen.getByTestId('r')
    expect(r.tagName).toBe('INPUT')
    expect(r).toHaveAttribute('type', 'radio')
    expect(r).toHaveClass('abaabil-radio')
  })

  it('merges a consumer className instead of replacing the base class', () => {
    render(<Radio data-testid="r" className="mine" />)
    const r = screen.getByTestId('r')
    expect(r).toHaveClass('abaabil-radio')
    expect(r).toHaveClass('mine')
  })

  it('adds no ARIA attributes and no explicit role at the normal tier', () => {
    render(<Radio data-testid="r" />)
    const attrs = [...screen.getByTestId('r').attributes].map((a) => a.name)
    expect(attrs.filter((a) => a.startsWith('aria-'))).toEqual([])
    expect(attrs).not.toContain('role')
  })
})

describe('Radio (styled tier)', () => {
  it('re-exports the same component contract', async () => {
    const { default: Styled } = await import('../src/radio/styled.jsx')
    render(<Styled data-testid="r" />)
    const r = screen.getByTestId('r')
    expect(r).toHaveAttribute('type', 'radio')
    expect(r).toHaveClass('abaabil-radio')
  })
})

describe('Radio (a11y tier)', () => {
  let warn
  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { warn.mockRestore() })

  it('associates a real <label> with the input via htmlFor/id', () => {
    render(<RadioA11y label="Small" />)
    const r = screen.getByRole('radio', { name: 'Small' })
    const label = screen.getByText('Small')
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveAttribute('for', r.id)
    expect(r.id).toBeTruthy()
  })

  it('wraps the control in the label so the whole row is the hit target, and keeps the description outside it', () => {
    render(<RadioA11y label="Small" description="Fits most." />)
    const r = screen.getByRole('radio', { name: 'Small' })
    const label = screen.getByText('Small')
    expect(label).toContainElement(r)
    expect(label).not.toContainElement(screen.getByText('Fits most.'))
  })

  it('derives the description id from a consumer-supplied id', () => {
    render(<RadioA11y label="Small" id="size-s" description="Fits most." />)
    expect(screen.getByRole('radio', { name: 'Small' })).toHaveAttribute('aria-describedby', 'size-s-description')
  })

  it('selects the radio when the label is clicked', async () => {
    render(<RadioA11y label="Small" />)
    const r = screen.getByRole('radio', { name: 'Small' })
    expect(r.checked).toBe(false)
    await userEvent.click(screen.getByText('Small'))
    expect(r.checked).toBe(true)
  })

  it('sets aria-describedby to the description id when description is given', () => {
    render(<RadioA11y label="Small" description="Fits most." />)
    const r = screen.getByRole('radio', { name: 'Small' })
    const describedBy = r.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy)).toHaveTextContent('Fits most.')
  })

  it('omits aria-describedby when there is no description and no consumer value', () => {
    render(<RadioA11y label="Small" />)
    expect(screen.getByRole('radio', { name: 'Small' })).not.toHaveAttribute('aria-describedby')
  })

  it('merges a consumer-supplied aria-describedby with the generated description id', () => {
    render(
      <>
        <span id="external-hint">External hint</span>
        <RadioA11y label="Small" description="Generated hint" aria-describedby="external-hint" />
      </>
    )
    const r = screen.getByRole('radio', { name: 'Small' })
    const ids = r.getAttribute('aria-describedby').split(' ')
    expect(ids).toContain('external-hint')
    expect(ids).toHaveLength(2)
    const descId = ids.find((id) => id !== 'external-hint')
    expect(document.getElementById(descId)).toHaveTextContent('Generated hint')
  })

  it('keeps a consumer-supplied aria-describedby even without a description', () => {
    render(
      <>
        <span id="external-hint">External hint</span>
        <RadioA11y label="Small" aria-describedby="external-hint" />
      </>
    )
    expect(screen.getByRole('radio', { name: 'Small' })).toHaveAttribute('aria-describedby', 'external-hint')
  })

  it('generates unique ids across two rendered instances', () => {
    render(
      <>
        <RadioA11y label="First" />
        <RadioA11y label="Second" />
      </>
    )
    const first = screen.getByRole('radio', { name: 'First' })
    const second = screen.getByRole('radio', { name: 'Second' })
    expect(first.id).toBeTruthy()
    expect(second.id).toBeTruthy()
    expect(first.id).not.toBe(second.id)
  })

  it('warns in development when there is no accessible name', () => {
    render(<RadioA11y />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('does not warn when a label is supplied', () => {
    render(<RadioA11y label="Small" />)
    expect(warn).not.toHaveBeenCalled()
  })

  it('renders with no shared name outside of a RadioGroup', () => {
    render(<RadioA11y label="Small" />)
    expect(screen.getByRole('radio', { name: 'Small' })).not.toHaveAttribute('name')
  })
})

describe('RadioGroup (a11y tier)', () => {
  it('renders a real fieldset/legend pair, and the legend names the group', () => {
    render(
      <RadioGroup label="Shirt size">
        <RadioA11y label="Small" value="s" />
        <RadioA11y label="Large" value="l" />
      </RadioGroup>
    )
    const group = screen.getByRole('group', { name: 'Shirt size' })
    expect(group.tagName).toBe('FIELDSET')
    const legend = screen.getByText('Shirt size')
    expect(legend.tagName).toBe('LEGEND')
  })

  it('gives every radio in the group the same shared name', () => {
    render(
      <RadioGroup label="Shirt size">
        <RadioA11y label="Small" value="s" />
        <RadioA11y label="Large" value="l" />
      </RadioGroup>
    )
    const small = screen.getByRole('radio', { name: 'Small' })
    const large = screen.getByRole('radio', { name: 'Large' })
    expect(small.name).toBeTruthy()
    expect(small.name).toBe(large.name)
  })

  it('selecting one radio deselects its sibling, because they share a name', async () => {
    render(
      <RadioGroup label="Shirt size">
        <RadioA11y label="Small" value="s" />
        <RadioA11y label="Large" value="l" />
      </RadioGroup>
    )
    const small = screen.getByRole('radio', { name: 'Small' })
    const large = screen.getByRole('radio', { name: 'Large' })

    await userEvent.click(small)
    expect(small.checked).toBe(true)
    expect(large.checked).toBe(false)

    await userEvent.click(large)
    expect(large.checked).toBe(true)
    expect(small.checked).toBe(false)
  })

  it('uses an explicit group name for every radio when one is given', () => {
    render(
      <RadioGroup label="Shirt size" name="shirt-size">
        <RadioA11y label="Small" value="s" />
        <RadioA11y label="Large" value="l" />
      </RadioGroup>
    )
    expect(screen.getByRole('radio', { name: 'Small' })).toHaveAttribute('name', 'shirt-size')
    expect(screen.getByRole('radio', { name: 'Large' })).toHaveAttribute('name', 'shirt-size')
  })

  it("lets a radio's own name prop override the group's name", () => {
    render(
      <RadioGroup label="Shirt size" name="shirt-size">
        <RadioA11y label="Small" value="s" />
        <RadioA11y label="Custom" value="c" name="custom-name" />
      </RadioGroup>
    )
    expect(screen.getByRole('radio', { name: 'Small' })).toHaveAttribute('name', 'shirt-size')
    expect(screen.getByRole('radio', { name: 'Custom' })).toHaveAttribute('name', 'custom-name')
  })
})

describe('Radio accessibility (axe)', () => {
  it('has no violations for a labelled radio with a description', async () => {
    const { container } = render(
      <RadioA11y label="Small" description="Fits most." />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no violations for a RadioGroup', async () => {
    const { container } = render(
      <RadioGroup label="Shirt size">
        <RadioA11y label="Small" value="s" />
        <RadioA11y label="Large" value="l" description="Roomier fit." />
      </RadioGroup>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
