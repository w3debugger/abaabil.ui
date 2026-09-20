import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Combobox from '../src/combobox/index.jsx'

const OPTIONS = [
  { value: 'ar', label: 'Arabic' },
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'Urdu' },
]

describe('Combobox (normal tier)', () => {
  it('renders a text input and no list until opened', () => {
    render(<Combobox options={OPTIONS} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('opens the list on focus and shows every option', async () => {
    render(<Combobox options={OPTIONS} />)
    await userEvent.click(screen.getByRole('textbox'))
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('filters options as the user types', async () => {
    render(<Combobox options={OPTIONS} />)
    await userEvent.type(screen.getByRole('textbox'), 'ur')
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByRole('listitem')).toHaveTextContent('Urdu')
  })

  it('calls onChange with the option value when one is clicked', async () => {
    const onChange = vi.fn()
    render(<Combobox options={OPTIONS} onChange={onChange} />)
    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.click(screen.getByText('English'))
    expect(onChange).toHaveBeenCalledWith('en')
  })

  it('adds no ARIA attributes at the normal tier', async () => {
    render(<Combobox options={OPTIONS} />)
    await userEvent.click(screen.getByRole('textbox'))
    const all = [...document.querySelectorAll('*')]
    const aria = all.flatMap((el) =>
      [...el.attributes].map((a) => a.name).filter((n) => n.startsWith('aria-'))
    )
    expect(aria).toEqual([])
  })

  it('closes the list when the input blurs', async () => {
    render(
      <>
        <Combobox options={OPTIONS} />
        <button type="button">elsewhere</button>
      </>
    )
    await userEvent.click(screen.getByRole('textbox'))
    expect(screen.queryByRole('list')).toBeInTheDocument()
    await userEvent.click(screen.getByText('elsewhere'))
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
