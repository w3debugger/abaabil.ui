import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { Toggle, ToggleGroup } from '../src/toggle/index.jsx'
import { Toggle as A11yToggle, ToggleGroup as A11yToggleGroup } from '../src/toggle/a11y.jsx'

afterEach(() => vi.restoreAllMocks())

const ALIGN = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Centre' },
  { value: 'right', label: 'Right' },
]

describe('Toggle (normal tier)', () => {
  it('is a real button, not a div with a click handler', () => {
    render(<Toggle>Bold</Toggle>)
    const el = screen.getByRole('button', { name: 'Bold' })
    expect(el).toHaveAttribute('type', 'button')
  })

  it('carries pressed state as data, with no ARIA at this tier', () => {
    render(<Toggle pressed>Bold</Toggle>)
    const el = screen.getByRole('button')
    expect(el).toHaveAttribute('data-pressed')
    expect(el).not.toHaveAttribute('aria-pressed')
  })
})

describe('ToggleGroup (normal tier)', () => {
  // The decision that makes this component small: radios, not buttons
  // with roving tabindex. Arrow keys, wrapping, and one-tab-stop all
  // come from the browser.
  it('renders radios for a single-select group', () => {
    render(<ToggleGroup name="align" items={ALIGN} />)
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('renders checkboxes when several may be pressed', () => {
    render(<ToggleGroup name="style" multiple items={ALIGN} />)
    expect(screen.getAllByRole('checkbox')).toHaveLength(3)
  })

  it('shares one name, which is what makes the radios a group', () => {
    render(<ToggleGroup name="align" items={ALIGN} />)
    for (const input of screen.getAllByRole('radio')) {
      expect(input).toHaveAttribute('name', 'align')
    }
  })

  it('presses the default value', () => {
    render(<ToggleGroup name="align" defaultValue="center" items={ALIGN} />)
    expect(screen.getByRole('radio', { name: 'Centre' })).toBeChecked()
  })

  it('accepts several defaults when multiple', () => {
    render(<ToggleGroup name="s" multiple defaultValue={['left', 'right']} items={ALIGN} />)
    expect(screen.getByRole('checkbox', { name: 'Left' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Right' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Centre' })).not.toBeChecked()
  })

  it('disables the members it is told to', () => {
    render(<ToggleGroup name="align" items={[{ value: 'l', label: 'Left', disabled: true }]} />)
    expect(screen.getByRole('radio', { name: 'Left' })).toBeDisabled()
  })

  // The inputs are clipped, not display:none. A hidden input is not
  // focusable, and every keyboard behaviour this component relies on
  // exists only while the input is real.
  it('keeps the inputs focusable rather than hiding them', async () => {
    render(<ToggleGroup name="align" defaultValue="left" items={ALIGN} />)
    await userEvent.tab()
    expect(screen.getByRole('radio', { name: 'Left' })).toHaveFocus()
  })

  it('moves selection with arrow keys, from the platform', async () => {
    render(<ToggleGroup name="align" defaultValue="left" items={ALIGN} />)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Centre' })).toBeChecked()
  })
})

describe('Toggle (a11y tier)', () => {
  // Without aria-pressed a screen reader says "Bold, button" whether
  // bold is on or off: the control looks obviously different and
  // sounds identical.
  it('declares its pressed state', () => {
    render(<A11yToggle pressed>Bold</A11yToggle>)
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('declares the unpressed state too, rather than omitting the attribute', () => {
    render(<A11yToggle>Bold</A11yToggle>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('names an icon-only toggle with hidden text, so speech control still matches', () => {
    render(<A11yToggle label="Bold"><svg aria-hidden="true" /></A11yToggle>)
    const el = screen.getByRole('button', { name: 'Bold' })
    expect(el).not.toHaveAttribute('aria-label')
  })

  it('warns when it has no name at all', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yToggle />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('does not warn for a toggle with visible text', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yToggle>Bold</A11yToggle>)
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('ToggleGroup (a11y tier)', () => {
  it('names the set with a real legend, which the platform announces', () => {
    render(<A11yToggleGroup name="align" label="Text alignment" items={ALIGN} />)
    expect(screen.getByRole('group', { name: 'Text alignment' })).toBeInTheDocument()
  })

  // An unnamed group is announced as "group" with no name: one more
  // thing to move past for no information.
  it('adds no group at all without a label', () => {
    render(<A11yToggleGroup name="align" items={ALIGN} />)
    expect(screen.queryByRole('group')).toBeNull()
  })
})
