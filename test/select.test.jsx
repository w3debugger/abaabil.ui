import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import Select from '../src/select/index.jsx'
import A11ySelect from '../src/select/a11y.jsx'

const OPTIONS = [
  { value: 'ar', label: 'Arabic' },
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'Urdu' },
]

describe('Select (normal tier)', () => {
  it('renders a native select with the base class', () => {
    render(<Select data-testid="s" options={OPTIONS} />)
    const el = screen.getByTestId('s')
    expect(el.tagName).toBe('SELECT')
    expect(el).toHaveClass('abaabil-select')
  })

  it('renders options from the `options` array', () => {
    render(<Select options={OPTIONS} />)
    expect(screen.getAllByRole('option')).toHaveLength(3)
    expect(screen.getByRole('option', { name: 'English' }).value).toBe('en')
  })

  it('renders `children` untouched when given instead of `options`, including optgroup', () => {
    render(
      <Select data-testid="s">
        <optgroup label="Languages">
          <option value="en">English</option>
          <option value="ar">Arabic</option>
        </optgroup>
      </Select>
    )
    const el = screen.getByTestId('s')
    const group = el.querySelector('optgroup')
    expect(group).not.toBeNull()
    expect(group).toHaveAttribute('label', 'Languages')
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  it('merges a consumer className instead of replacing the base class', () => {
    render(<Select className="mine" options={OPTIONS} data-testid="s" />)
    const el = screen.getByTestId('s')
    expect(el).toHaveClass('abaabil-select')
    expect(el).toHaveClass('mine')
  })

  it('adds no ARIA attributes and no role at the normal tier', () => {
    render(<Select options={OPTIONS} data-testid="s" />)
    const el = screen.getByTestId('s')
    const attrs = [...el.attributes].map((a) => a.name)
    expect(attrs.filter((a) => a.startsWith('aria-'))).toEqual([])
    expect(el).not.toHaveAttribute('role')
  })
})

describe('Select (a11y tier)', () => {
  let warn
  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { warn.mockRestore() })

  it('associates a real label with the select via htmlFor/id, and clicking the label focuses it', async () => {
    render(<A11ySelect label="Language" options={OPTIONS} />)
    const select = screen.getByLabelText('Language')
    const label = screen.getByText('Language')
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveAttribute('for', select.id)
    await userEvent.click(label)
    expect(select).toHaveFocus()
  })

  it('renders the `options` array form', () => {
    render(<A11ySelect label="Language" options={OPTIONS} />)
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('renders the `children` form, allowing optgroup through untouched', () => {
    render(
      <A11ySelect label="Language">
        <optgroup label="Popular">
          <option value="en">English</option>
        </optgroup>
      </A11ySelect>
    )
    const select = screen.getByLabelText('Language')
    const group = select.querySelector('optgroup')
    expect(group).not.toBeNull()
    expect(group).toHaveAttribute('label', 'Popular')
  })

  it('reports the chosen value via onChange', async () => {
    const onChange = vi.fn()
    render(<A11ySelect label="Language" options={OPTIONS} onChange={onChange} />)
    const select = screen.getByLabelText('Language')
    await userEvent.selectOptions(select, 'en')
    expect(select.value).toBe('en')
    expect(onChange).toHaveBeenCalled()
    const event = onChange.mock.calls[0][0]
    expect(event.target.value).toBe('en')
  })

  it('sets aria-describedby to the description id when only a description is given', () => {
    render(<A11ySelect label="Language" description="Pick one" options={OPTIONS} />)
    const select = screen.getByLabelText('Language')
    const describedBy = select.getAttribute('aria-describedby')
    const ids = describedBy.split(' ')
    expect(ids).toHaveLength(1)
    expect(document.getElementById(ids[0])).toHaveTextContent('Pick one')
  })

  it('sets aria-describedby to the error id when only an error is given', () => {
    render(<A11ySelect label="Language" error="Required" options={OPTIONS} />)
    const select = screen.getByLabelText('Language')
    const describedBy = select.getAttribute('aria-describedby')
    const ids = describedBy.split(' ')
    expect(ids).toHaveLength(1)
    expect(document.getElementById(ids[0])).toHaveTextContent('Required')
  })

  it('sets aria-describedby to both ids, space separated, when description and error are both given', () => {
    render(
      <A11ySelect label="Language" description="Pick one" error="Required" options={OPTIONS} />
    )
    const select = screen.getByLabelText('Language')
    const describedBy = select.getAttribute('aria-describedby')
    const ids = describedBy.split(' ')
    expect(ids).toHaveLength(2)
    ids.forEach((id) => expect(document.getElementById(id)).not.toBeNull())
  })

  it('omits aria-describedby entirely when there is no description and no error', () => {
    render(<A11ySelect label="Language" options={OPTIONS} />)
    expect(screen.getByLabelText('Language')).not.toHaveAttribute('aria-describedby')
  })

  it('merges a consumer-supplied aria-describedby with the generated description/error ids', () => {
    render(
      <A11ySelect
        label="Language"
        description="Pick one"
        error="Required"
        aria-describedby="custom-hint"
        options={OPTIONS}
      />
    )
    const select = screen.getByLabelText('Language')
    const ids = select.getAttribute('aria-describedby').split(' ')
    expect(ids).toContain('custom-hint')
    expect(ids).toHaveLength(3)
  })

  it('sets aria-invalid when an error is present', () => {
    render(<A11ySelect label="Language" error="Required" options={OPTIONS} />)
    expect(screen.getByLabelText('Language')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when there is no error', () => {
    render(<A11ySelect label="Language" options={OPTIONS} />)
    expect(screen.getByLabelText('Language')).not.toHaveAttribute('aria-invalid')
  })

  it('lets a consumer-supplied id win over the generated one, and the label still points at it', () => {
    render(<A11ySelect label="Language" id="custom-id" options={OPTIONS} />)
    const select = screen.getByLabelText('Language')
    expect(select).toHaveAttribute('id', 'custom-id')
    expect(screen.getByText('Language')).toHaveAttribute('for', 'custom-id')
  })

  it('derives the description and error ids from a consumer-supplied id', () => {
    render(
      <A11ySelect label="Language" id="lang" description="Pick one" error="Required" options={OPTIONS} />
    )
    expect(screen.getByLabelText('Language')).toHaveAttribute('aria-describedby', 'lang-description lang-error')
  })

  it('puts className and style on the group wrapper, not on the select', () => {
    render(<A11ySelect label="Language" className="mine" style={{ flex: 1 }} options={OPTIONS} />)
    const select = screen.getByLabelText('Language')
    expect(select.parentElement).toHaveClass('abaabil-select-group', 'mine')
    expect(select.parentElement.style.flexGrow).toBe('1')
    expect(select).not.toHaveClass('mine')
    expect(select.getAttribute('style')).toBeNull()
  })

  it('generates unique ids across multiple instances', () => {
    render(
      <>
        <A11ySelect label="First" options={OPTIONS} />
        <A11ySelect label="Second" options={OPTIONS} />
      </>
    )
    const first = screen.getByLabelText('First')
    const second = screen.getByLabelText('Second')
    expect(first.id).not.toBe(second.id)
  })

  it('warns when there is no label', () => {
    render(<A11ySelect options={OPTIONS} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('has no axe violations for a labelled select', async () => {
    const { container } = render(<A11ySelect label="Language" options={OPTIONS} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations for a select showing both a description and an error', async () => {
    const { container } = render(
      <A11ySelect
        label="Language"
        description="Pick one"
        error="Required"
        options={OPTIONS}
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('shows the label by default, and hides it only when hideLabel is set', () => {
    render(<A11ySelect label="Language" options={OPTIONS} />)
    const select = screen.getByLabelText('Language')
    const label = screen.getByText('Language')
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveAttribute('for', select.id)
    expect(label).not.toHaveClass('abaabil-visually-hidden')
  })

  it('renders the label visibly when hideLabel is false, without the visually-hidden class', () => {
    render(<A11ySelect label="Language" hideLabel={false} options={OPTIONS} />)
    const select = screen.getByLabelText('Language')
    const label = screen.getByText('Language')
    expect(label).toHaveAttribute('for', select.id)
    expect(label).not.toHaveClass('abaabil-visually-hidden')
  })
})
