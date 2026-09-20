import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Combobox from '../src/combobox/a11y.jsx'

// W3C APG 1.2 editable-combobox pattern. Failures here are silent: a stale
// aria-controls id, an aria-expanded that does not flip, or an
// aria-activedescendant pointing at an unrendered option produces screen
// reader silence with no console error and no failing snapshot.

const OPTIONS = [
  { value: 'ap', label: 'Apple' },
  { value: 'ac', label: 'Apricot' },
  { value: 'bn', label: 'Banana' },
]

function getListbox(input) {
  const id = input.getAttribute('aria-controls')
  return id ? document.getElementById(id) : null
}

// Assertion 1: the invariant is not "check aria-expanded" or "check hidden"
// in isolation, it is that the two must always agree.
function assertExpandedHiddenAgreement(input) {
  const expanded = input.getAttribute('aria-expanded')
  const list = getListbox(input)
  if (expanded === 'true') {
    expect(list).not.toBeNull()
    expect(list).not.toHaveAttribute('hidden')
  } else if (list) {
    expect(list).toHaveAttribute('hidden')
  }
}

// Assertion 3: aria-activedescendant must either be absent, or name a real,
// rendered, in-scope option. A stale id here is the classic silent failure.
function assertActivedescendantIntegrity(input) {
  const id = input.getAttribute('aria-activedescendant')
  if (!id) return
  const option = document.getElementById(id)
  expect(option).not.toBeNull()
  expect(option).toHaveAttribute('role', 'option')
  const list = getListbox(input)
  expect(list).not.toBeNull()
  expect(list.contains(option)).toBe(true)
}

describe('Combobox a11y: aria-expanded / hidden agreement', () => {
  it('a query matching nothing collapses aria-expanded and hides the listbox', async () => {
    render(<Combobox options={OPTIONS} label="Fruit" />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.type(input, 'zzz')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(getListbox(input)).toHaveAttribute('hidden')
    assertExpandedHiddenAgreement(input)
  })

  it('holds the invariant through open, filter, navigate, commit, reopen, and blur', async () => {
    const onChange = vi.fn()
    render(
      <>
        <Combobox options={OPTIONS} onChange={onChange} label="Fruit" />
        <button type="button">elsewhere</button>
      </>
    )
    const input = screen.getByRole('combobox')
    assertExpandedHiddenAgreement(input)

    await userEvent.click(input)
    assertExpandedHiddenAgreement(input)

    await userEvent.type(input, 'ap')
    assertExpandedHiddenAgreement(input)

    await userEvent.keyboard('{ArrowDown}')
    assertExpandedHiddenAgreement(input)

    await userEvent.keyboard('{Enter}')
    assertExpandedHiddenAgreement(input)

    await userEvent.click(input)
    assertExpandedHiddenAgreement(input)

    fireEvent.keyDown(input, { key: 'Escape' })
    assertExpandedHiddenAgreement(input)

    await userEvent.click(input)
    assertExpandedHiddenAgreement(input)

    await userEvent.click(screen.getByText('elsewhere'))
    assertExpandedHiddenAgreement(input)
  })
})

describe('Combobox a11y: closed listbox is out of the accessibility tree', () => {
  it('queryByRole("listbox") is null while closed', () => {
    render(<Combobox options={OPTIONS} label="Fruit" />)
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

describe('Combobox a11y: aria-activedescendant referential integrity', () => {
  it('stays valid or absent through every interaction that can move or clear it', async () => {
    const onChange = vi.fn()
    render(
      <>
        <Combobox options={OPTIONS} onChange={onChange} label="Fruit" />
        <button type="button">elsewhere</button>
      </>
    )
    const input = screen.getByRole('combobox')

    await userEvent.click(input)
    assertActivedescendantIntegrity(input)

    // ArrowDown past the end wraps
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}')
    assertActivedescendantIntegrity(input)

    // ArrowUp past the start wraps
    await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}')
    assertActivedescendantIntegrity(input)

    // Home/End are not handled by this component; the invariant must still hold
    fireEvent.keyDown(input, { key: 'Home' })
    assertActivedescendantIntegrity(input)
    fireEvent.keyDown(input, { key: 'End' })
    assertActivedescendantIntegrity(input)

    // typing that shrinks the list
    await userEvent.type(input, 'ap')
    assertActivedescendantIntegrity(input)

    // typing to empty
    await userEvent.clear(input)
    assertActivedescendantIntegrity(input)

    // move, then Escape
    await userEvent.keyboard('{ArrowDown}')
    fireEvent.keyDown(input, { key: 'Escape' })
    assertActivedescendantIntegrity(input)

    // reopen, move, then blur
    await userEvent.click(input)
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.click(screen.getByText('elsewhere'))
    assertActivedescendantIntegrity(input)

    // reopen, move, then commit
    await userEvent.click(input)
    await userEvent.keyboard('{ArrowDown}{Enter}')
    assertActivedescendantIntegrity(input)

    // re-click-to-reopen
    await userEvent.click(input)
    assertActivedescendantIntegrity(input)
  })
})

describe('Combobox a11y: reopen cycle (regression: a click after a keyboard commit failed to reopen)', () => {
  it('click opens; ArrowDown+Enter commits and closes; clicking again while focused reopens; Escape closes; click reopens; blur closes', async () => {
    const onChange = vi.fn()
    render(
      <>
        <Combobox options={OPTIONS} onChange={onChange} label="Fruit" />
        <button type="button">elsewhere</button>
      </>
    )
    const input = screen.getByRole('combobox')

    await userEvent.click(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(input).toHaveFocus()

    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(onChange).toHaveBeenCalledWith('ap')
    expect(input).toHaveFocus()

    expect(document.activeElement).toBe(input)
    await userEvent.click(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(input).toHaveFocus()

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveFocus()

    await userEvent.click(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(input).toHaveFocus()

    await userEvent.click(screen.getByText('elsewhere'))
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('Combobox a11y: Escape has two stages and is idempotent', () => {
  it('first Escape closes without touching the text or firing onChange', async () => {
    const onChange = vi.fn()
    render(<Combobox options={OPTIONS} onChange={onChange} label="Fruit" />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.type(input, 'ap')
    expect(input).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveValue('ap')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('spamming Escape after a commit clears once, notifies once, then goes silent', async () => {
    const onChange = vi.fn()
    render(<Combobox options={OPTIONS} onChange={onChange} label="Fruit" />)
    const input = screen.getByRole('combobox')

    await userEvent.click(input)
    await userEvent.click(screen.getByRole('option', { name: 'Apple' }))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(input).toHaveAttribute('aria-expanded', 'false')

    fireEvent.keyDown(input, { key: 'Escape' })
    fireEvent.keyDown(input, { key: 'Escape' })
    fireEvent.keyDown(input, { key: 'Escape' })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(input).toHaveValue('')
    expect(onChange.mock.calls).toEqual([['ap'], [null]])
  })
})

describe('Combobox a11y: focus never leaves the input', () => {
  it('selecting an option by mouse keeps focus on the input', async () => {
    const onChange = vi.fn()
    render(<Combobox options={OPTIONS} onChange={onChange} label="Fruit" />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.click(screen.getByRole('option', { name: 'Banana' }))
    expect(onChange).toHaveBeenCalledWith('bn')
    expect(input).toHaveFocus()
  })

  it('no element in the tree carries a tabindex', async () => {
    const { container } = render(<Combobox options={OPTIONS} label="Fruit" />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    expect(container.querySelectorAll('[tabindex]')).toHaveLength(0)
  })
})

describe('Combobox a11y: option id uniqueness and scoping', () => {
  it('ids stay unique at every filter width: all, two, one match', async () => {
    render(<Combobox options={OPTIONS} label="Fruit" />)
    const input = screen.getByRole('combobox')

    let ids = screen.getAllByRole('option', { hidden: true }).map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toHaveLength(3)

    await userEvent.type(input, 'ap')
    ids = screen.getAllByRole('option', { hidden: true }).map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toHaveLength(2)

    await userEvent.type(input, 'ple')
    ids = screen.getAllByRole('option', { hidden: true }).map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toHaveLength(1)
  })

  it('two comboboxes on the same page scope their option ids disjointly', () => {
    render(
      <>
        <Combobox options={OPTIONS} label="Fruit A" />
        <Combobox options={OPTIONS} label="Fruit B" />
      </>
    )
    const allIds = screen.getAllByRole('option', { hidden: true }).map((o) => o.id)
    // 3 options per combobox, 2 comboboxes: unique-as-a-set proves the
    // useId prefix scopes each combobox's ids away from the other's.
    expect(allIds).toHaveLength(6)
    expect(new Set(allIds).size).toBe(6)
  })
})

describe('Combobox a11y: aria-selected', () => {
  it('is false on every option before any commit, and every option states it explicitly', async () => {
    render(<Combobox options={OPTIONS} label="Fruit" />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)
    for (const option of options) {
      expect(option).toHaveAttribute('aria-selected', 'false')
    }
  })

  it('marks exactly the committed option true after commit and reopen', async () => {
    render(<Combobox options={OPTIONS} label="Fruit" />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.click(screen.getByRole('option', { name: 'Apricot' }))

    await userEvent.click(input)
    const options = screen.getAllByRole('option')
    for (const option of options) {
      expect(option.getAttribute('aria-selected')).toMatch(/^(true|false)$/)
    }
    const selected = options.filter((o) => o.getAttribute('aria-selected') === 'true')
    expect(selected).toHaveLength(1)
    expect(selected[0]).toHaveTextContent('Apricot')
  })
})

describe('Combobox a11y: live region announces result counts', () => {
  it('exists closed with empty text, then announces counts as the query changes', async () => {
    const { container } = render(<Combobox options={OPTIONS} label="Fruit" />)
    const live = container.querySelector('[aria-live="polite"]')
    expect(live).not.toBeNull()
    expect(live).toHaveTextContent('')

    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    expect(live).toHaveTextContent('3 results')

    await userEvent.type(input, 'ple')
    expect(live).toHaveTextContent('1 result')

    await userEvent.clear(input)
    await userEvent.type(input, 'zzz')
    expect(live).toHaveTextContent('0 results')
  })
})

describe('Combobox a11y: Tab commits and closes', () => {
  it('commits the active option and closes', async () => {
    const onChange = vi.fn()
    render(<Combobox options={OPTIONS} onChange={onChange} label="Fruit" />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.keyboard('{ArrowDown}')
    fireEvent.keyDown(input, { key: 'Tab' })
    expect(onChange).toHaveBeenCalledWith('ap')
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('does not commit when there is no active option', async () => {
    const onChange = vi.fn()
    render(<Combobox options={OPTIONS} onChange={onChange} label="Fruit" />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    fireEvent.keyDown(input, { key: 'Tab' })
    expect(onChange).not.toHaveBeenCalled()
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('Combobox a11y: IME composition', () => {
  it('an Enter that is part of an IME composition does not commit', async () => {
    const onChange = vi.fn()
    render(<Combobox options={OPTIONS} onChange={onChange} label="Fruit" />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.keyboard('{ArrowDown}')
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
    expect(onChange).not.toHaveBeenCalled()
    expect(input).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('Combobox a11y: prop passthrough', () => {
  it('lands id, name, and required on the input, not the wrapper', () => {
    const { container } = render(
      <Combobox options={OPTIONS} id="fruit-picker" name="fruit" required label="Fruit" />
    )
    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('id', 'fruit-picker')
    expect(input).toHaveAttribute('name', 'fruit')
    expect(input).toBeRequired()
    const wrapper = container.firstChild
    expect(wrapper).not.toHaveAttribute('id')
    expect(wrapper).not.toHaveAttribute('name')
  })

  it('composes className on the wrapper as "abaabil-combobox <custom>"', () => {
    const { container } = render(<Combobox options={OPTIONS} className="custom" label="Fruit" />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('abaabil-combobox')
    expect(wrapper).toHaveClass('custom')
    expect(screen.getByRole('combobox')).not.toHaveClass('custom')
  })

  it('composes a consumer onKeyDown with the internal handler, firing once', async () => {
    const onKeyDown = vi.fn()
    render(<Combobox options={OPTIONS} onKeyDown={onKeyDown} label="Fruit" />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(input.getAttribute('aria-activedescendant')).toContain('option-0')
  })

  it('composes a consumer onFocus with the internal handler, firing once', async () => {
    const onFocus = vi.fn()
    render(<Combobox options={OPTIONS} onFocus={onFocus} label="Fruit" />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(input).toHaveAttribute('aria-expanded', 'true')
  })

  it('composes a consumer onBlur with the internal handler, firing once', async () => {
    const onBlur = vi.fn()
    render(
      <>
        <Combobox options={OPTIONS} onBlur={onBlur} label="Fruit" />
        <button type="button">elsewhere</button>
      </>
    )
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.click(screen.getByText('elsewhere'))
    expect(onBlur).toHaveBeenCalledTimes(1)
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('Combobox a11y: autoComplete is always off', () => {
  it('is present by default', () => {
    render(<Combobox options={OPTIONS} label="Fruit" />)
    expect(screen.getByRole('combobox')).toHaveAttribute('autocomplete', 'off')
  })

  it('cannot be overridden by a consumer prop', () => {
    render(<Combobox options={OPTIONS} autoComplete="on" label="Fruit" />)
    expect(screen.getByRole('combobox')).toHaveAttribute('autocomplete', 'off')
  })
})
