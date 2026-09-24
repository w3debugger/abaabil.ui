import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { axe } from 'jest-axe'
import Command, { filterItems } from '../src/command/index.jsx'
import A11yCommand from '../src/command/a11y.jsx'

afterEach(() => vi.restoreAllMocks())

const ITEMS = [
  { label: 'New file', keywords: ['create'], group: 'File', onSelect: vi.fn() },
  { label: 'Open file', group: 'File', onSelect: vi.fn() },
  { label: 'Archive', disabled: true, onSelect: vi.fn() },
  { label: 'Settings', keywords: 'preferences', onSelect: vi.fn() },
]

describe('filterItems', () => {
  it('matches label and keywords, case-insensitively', () => {
    expect(filterItems(ITEMS, 'NEW').map((i) => i.label)).toEqual(['New file'])
    expect(filterItems(ITEMS, 'create').map((i) => i.label)).toEqual(['New file'])
    expect(filterItems(ITEMS, 'Pref').map((i) => i.label)).toEqual(['Settings'])
    expect(filterItems(ITEMS, '  ')).toBe(ITEMS)
  })
})

describe('Command (normal tier)', () => {
  it('renders a dialog with a search input and a list, with no ARIA', () => {
    render(<Command id="cmd" open items={ITEMS} />)
    const dialog = document.getElementById('cmd')
    expect(dialog.tagName).toBe('DIALOG')
    expect(dialog.open).toBe(true)
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(3)
    const aria = [...dialog.querySelectorAll('*'), dialog].flatMap((el) =>
      [...el.attributes].map((a) => a.name).filter((n) => n.startsWith('aria-') || n === 'role')
    )
    expect(aria).toEqual([])
  })

  it('renders a real link for an item with href', () => {
    render(<Command id="cmd" open items={[{ label: 'Docs', href: '/docs' }]} />)
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs')
  })

  it('follows an href item on Enter, the same way the a11y tier does', async () => {
    render(<Command id="cmd" open items={[{ label: 'Docs', href: '#docs' }]} />)
    await userEvent.type(screen.getByRole('searchbox'), '{Enter}')
    expect(window.location.hash).toBe('#docs')
    window.location.hash = ''
  })

  it('shows the empty text when nothing matches', async () => {
    render(<Command id="cmd" open items={ITEMS} emptyText="Nothing here" />)
    await userEvent.type(screen.getByRole('searchbox'), 'zzz')
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })
})

describe('Command (a11y tier)', () => {
  it('wires the combobox to the listbox and the active option', () => {
    render(<A11yCommand id="cmd" open label="Commands" items={ITEMS} />)
    const input = screen.getByRole('combobox', { name: 'Commands' })
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(input).toHaveAttribute('aria-expanded', 'true')
    const list = document.getElementById(input.getAttribute('aria-controls'))
    expect(list).toHaveAttribute('role', 'listbox')
    const active = document.getElementById(input.getAttribute('aria-activedescendant'))
    expect(active).toHaveTextContent('New file')
    expect(active).toHaveAttribute('aria-selected', 'true')
  })

  it('names the input from a consumer aria-label, not only from label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yCommand id="cmd" open aria-label="Commands" items={ITEMS} />)
    expect(screen.getByRole('combobox', { name: 'Commands' })).toBeInTheDocument()
    expect(warn).not.toHaveBeenCalled()
  })

  it('walks the options with the arrows in the order they are drawn, not items order', async () => {
    const items = [
      { label: 'Alpha', group: 'G1' },
      { label: 'Beta', group: 'G2' },
      { label: 'Gamma', group: 'G1' },
    ]
    render(<A11yCommand id="cmd" open label="Commands" items={items} />)
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Alpha', 'Gamma', 'Beta'])
    const input = screen.getByRole('combobox')
    await userEvent.type(input, '{ArrowDown}')
    expect(document.getElementById(input.getAttribute('aria-activedescendant'))).toHaveTextContent('Gamma')
    await userEvent.type(input, '{ArrowDown}')
    expect(document.getElementById(input.getAttribute('aria-activedescendant'))).toHaveTextContent('Beta')
  })

  it('scrolls the first option into view again when the query changes', async () => {
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll
    render(<A11yCommand id="cmd" open label="Commands" items={ITEMS} />)
    const before = scroll.mock.calls.length
    await userEvent.type(screen.getByRole('combobox'), 'f')
    expect(scroll.mock.calls.length).toBeGreaterThan(before)
  })

  it('names each group from its heading', () => {
    render(<A11yCommand id="cmd" open label="Commands" items={ITEMS} />)
    expect(screen.getByRole('group', { name: 'File' })).toBeInTheDocument()
  })

  it('narrows the options as the user types', async () => {
    render(<A11yCommand id="cmd" open label="Commands" items={ITEMS} />)
    await userEvent.type(screen.getByRole('combobox'), 'file')
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['New file', 'Open file'])
  })

  it('ArrowDown then Enter selects the second item and closes', async () => {
    const onClose = vi.fn()
    render(<A11yCommand id="cmd" open label="Commands" items={ITEMS} onClose={onClose} />)
    await userEvent.type(screen.getByRole('combobox'), '{ArrowDown}{Enter}')
    expect(ITEMS[1].onSelect).toHaveBeenCalledTimes(1)
    expect(ITEMS[0].onSelect).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('skips a disabled item with the arrow keys, in both directions', async () => {
    render(<A11yCommand id="cmd" open label="Commands" items={ITEMS} />)
    const input = screen.getByRole('combobox')
    await userEvent.type(input, '{ArrowDown}{ArrowDown}')
    expect(document.getElementById(input.getAttribute('aria-activedescendant'))).toHaveTextContent('Settings')
    await userEvent.type(input, '{ArrowDown}')
    expect(document.getElementById(input.getAttribute('aria-activedescendant'))).toHaveTextContent('New file')
    await userEvent.type(input, '{ArrowUp}{ArrowUp}')
    expect(document.getElementById(input.getAttribute('aria-activedescendant'))).toHaveTextContent('Open file')
  })

  it('Escape calls onClose', async () => {
    const onClose = vi.fn()
    render(<A11yCommand id="cmd" open label="Commands" items={ITEMS} onClose={onClose} />)
    await userEvent.type(screen.getByRole('combobox'), '{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('reads the result count to a live region as it changes', async () => {
    render(<A11yCommand id="cmd" open label="Commands" items={ITEMS} />)
    const live = document.querySelector('[aria-live="polite"]')
    expect(live).toHaveTextContent('4 results')
    await userEvent.type(screen.getByRole('combobox'), 'settings')
    expect(live).toHaveTextContent('1 result')
  })

  it('opens from Meta or Ctrl plus the shortcut key', async () => {
    const onOpen = vi.fn()
    const { unmount } = render(<A11yCommand id="cmd" label="Commands" items={ITEMS} shortcut="k" onOpen={onOpen} />)
    await userEvent.keyboard('{Meta>}k{/Meta}')
    await userEvent.keyboard('{Control>}k{/Control}')
    expect(onOpen).toHaveBeenCalledTimes(2)
    unmount()
    await userEvent.keyboard('{Meta>}k{/Meta}')
    expect(onOpen).toHaveBeenCalledTimes(2)
  })

  it('binds the shortcut once and still calls the latest onOpen after a re-render', async () => {
    const add = vi.spyOn(document, 'addEventListener')
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = render(<A11yCommand id="cmd" label="Commands" items={ITEMS} shortcut="K" onOpen={() => first()} />)
    rerender(<A11yCommand id="cmd" label="Commands" items={ITEMS} shortcut="K" onOpen={() => second()} />)
    expect(add.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(1)
    await userEvent.keyboard('{Meta>}k{/Meta}')
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('warns when it has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yCommand id="cmd" items={ITEMS} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('has no axe violations while open with results', async () => {
    const { container } = render(<A11yCommand id="cmd" open label="Commands" items={ITEMS} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
