import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { axe } from 'jest-axe'
import Field, { Fieldset, Label } from '../src/field/index.jsx'
import A11yField, { Fieldset as A11yFieldset } from '../src/field/a11y.jsx'
import Input from '../src/input/index.jsx'

afterEach(() => vi.restoreAllMocks())

const ariaAttrs = (el) => [...el.attributes].map((a) => a.name).filter((a) => a.startsWith('aria-'))

describe('Field (normal tier)', () => {
  it('renders a real label pointing at the control by id', () => {
    render(
      <Field id="name" label="Name">
        <input />
      </Field>
    )
    const label = screen.getByText('Name')
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveAttribute('for', 'name')
    expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'name')
  })

  it('renders description and error at ids derived from the field id', () => {
    render(
      <Field id="name" label="Name" description="Full name" error="Required">
        <input />
      </Field>
    )
    expect(document.getElementById('name-description')).toHaveTextContent('Full name')
    expect(document.getElementById('name-error')).toHaveTextContent('Required')
  })

  it('calls a function child with the ids so the consumer wires their own control', () => {
    let args
    render(
      <Field id="dob" label="Date of birth" description="DD/MM/YYYY" error="Invalid">
        {(a) => {
          args = a
          return <input id={a.id} />
        }}
      </Field>
    )
    expect(args).toEqual({
      id: 'dob',
      describedBy: 'dob-description dob-error',
      invalid: true,
      required: false,
    })
  })

  it('passes native required to the control, and nothing else', () => {
    render(
      <Field id="name" label="Name" required>
        <input />
      </Field>
    )
    expect(screen.getByLabelText('Name')).toBeRequired()
  })

  it('adds no ARIA anywhere at the normal tier', () => {
    const { container } = render(
      <Field id="name" label="Name" description="Full name" error="Required">
        <input />
      </Field>
    )
    for (const el of container.querySelectorAll('*')) {
      expect(ariaAttrs(el)).toEqual([])
      expect(el).not.toHaveAttribute('role')
    }
  })

  it('visually hides the label on request, keeping it a real label', () => {
    render(
      <Field id="q" label="Search" hideLabel>
        <input />
      </Field>
    )
    expect(screen.getByText('Search')).toHaveClass('abaabil-visually-hidden')
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
  })
})

describe('Fieldset and Label (normal tier)', () => {
  it('renders a fieldset named by a real legend', () => {
    render(
      <Fieldset id="plan" label="Plan" description="Pick one">
        <input type="radio" name="plan" />
      </Fieldset>
    )
    const group = screen.getByRole('group', { name: 'Plan' })
    expect(group.tagName).toBe('FIELDSET')
    expect(group.querySelector('legend')).toHaveTextContent('Plan')
    expect(document.getElementById('plan-description')).toHaveTextContent('Pick one')
  })

  it('Label is a bare label with the class', () => {
    render(<Label htmlFor="x">Bare</Label>)
    const el = screen.getByText('Bare')
    expect(el.tagName).toBe('LABEL')
    expect(el).toHaveClass('abaabil-field__label')
  })
})

describe('Field (a11y tier)', () => {
  it('wires aria-describedby to both description and error, and sets aria-invalid', () => {
    render(
      <A11yField label="Email" description="Work address" error="Enter an email">
        <Input />
      </A11yField>
    )
    const input = screen.getByLabelText('Email')
    const ids = input.getAttribute('aria-describedby').split(' ')
    expect(ids).toHaveLength(2)
    expect(document.getElementById(ids[0])).toHaveTextContent('Work address')
    expect(document.getElementById(ids[1])).toHaveTextContent('Enter an email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('omits aria-invalid and aria-describedby when there is nothing to point at', () => {
    render(
      <A11yField label="Email">
        <Input />
      </A11yField>
    )
    const input = screen.getByLabelText('Email')
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it('generates an id when none is given, and uses the given one otherwise', () => {
    render(
      <>
        <A11yField label="A"><Input /></A11yField>
        <A11yField id="b" label="B"><Input /></A11yField>
      </>
    )
    expect(screen.getByLabelText('A').id).not.toBe('')
    expect(screen.getByLabelText('B')).toHaveAttribute('id', 'b')
  })

  it('preserves a consumer aria-describedby ahead of the generated ids', () => {
    render(
      <A11yField id="e" label="Email" description="Work address">
        <Input aria-describedby="hint" />
      </A11yField>
    )
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-describedby', 'hint e-description')
  })

  it('gives a function child one spreadable props object', () => {
    render(
      <A11yField id="f" label="Name" error="Required" required>
        {(props) => <input {...props} />}
      </A11yField>
    )
    const input = screen.getByLabelText('Name')
    expect(input).toBeRequired()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'f-error')
  })

  it('warns in dev when the field has no label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yField><Input /></A11yField>)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('does not warn when the control names itself', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yField><Input aria-label="Search" /></A11yField>)
    expect(warn).not.toHaveBeenCalled()
  })

  it('has no axe violations around an Input with an error', async () => {
    const { container } = render(
      <A11yField label="Email" description="Work address" error="Enter a valid email address.">
        <Input type="email" />
      </A11yField>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Fieldset (a11y tier)', () => {
  it('describes the group by its description and error', () => {
    render(
      <A11yFieldset id="plan" label="Plan" description="Pick one" error="Choose a plan">
        <input type="radio" name="plan" aria-label="Free" />
      </A11yFieldset>
    )
    expect(screen.getByRole('group', { name: 'Plan' })).toHaveAttribute(
      'aria-describedby',
      'plan-description plan-error'
    )
  })

  it('warns in dev without a label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yFieldset><input type="radio" aria-label="Free" /></A11yFieldset>)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })
})
