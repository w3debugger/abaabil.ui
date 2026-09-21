import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import Tabs from '../src/tabs/index.jsx'
import A11yTabs from '../src/tabs/a11y.jsx'

const ITEMS = [
  { label: 'Overview', children: <p>Overview panel</p> },
  { label: 'Pricing', children: <p>Pricing panel</p> },
  { label: 'Support', children: <p>Support panel</p> },
]

describe('Tabs (normal tier)', () => {
  it('shows only the selected panel', () => {
    render(<Tabs items={ITEMS} />)
    expect(screen.getByText('Overview panel')).toBeInTheDocument()
    expect(screen.queryByText('Pricing panel')).toBeNull()
  })

  it('honours defaultIndex', () => {
    render(<Tabs items={ITEMS} defaultIndex={2} />)
    expect(screen.getByText('Support panel')).toBeInTheDocument()
  })

  it('switches panel on click and reports the new index', async () => {
    const onChange = vi.fn()
    render(<Tabs items={ITEMS} onChange={onChange} />)
    await userEvent.click(screen.getByText('Pricing'))
    expect(screen.getByText('Pricing panel')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('adds no ARIA attributes and no roles at the normal tier', () => {
    const { container } = render(<Tabs items={ITEMS} />)
    expect(container.querySelectorAll('[role]')).toHaveLength(0)
    const aria = [...container.querySelectorAll('*')].flatMap((el) =>
      [...el.attributes].map((a) => a.name).filter((n) => n.startsWith('aria-'))
    )
    expect(aria).toEqual([])
  })

  it('gives every tab type="button" so it never submits a form', () => {
    render(<Tabs items={ITEMS} />)
    for (const b of screen.getAllByRole('button')) expect(b).toHaveAttribute('type', 'button')
  })
})

describe('Tabs (a11y tier)', () => {
  let warn
  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { warn.mockRestore() })

  it('builds the APG structure: named tablist, tabs, one panel', () => {
    render(<A11yTabs items={ITEMS} label="Product" />)
    expect(screen.getByRole('tablist', { name: 'Product' })).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
  })

  it('pairs each tab with its panel via aria-controls and aria-labelledby', () => {
    render(<A11yTabs items={ITEMS} label="Product" />)
    const tab = screen.getAllByRole('tab')[0]
    const panel = screen.getByRole('tabpanel')
    expect(tab).toHaveAttribute('aria-controls', panel.id)
    expect(panel).toHaveAttribute('aria-labelledby', tab.id)
  })

  it('marks exactly one tab selected', async () => {
    render(<A11yTabs items={ITEMS} label="Product" />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false'])
    await userEvent.click(tabs[1])
    expect(screen.getAllByRole('tab').map((t) => t.getAttribute('aria-selected')))
      .toEqual(['false', 'true', 'false'])
  })

  it('uses a roving tabindex, so Tab steps past the tablist not through it', () => {
    render(<A11yTabs items={ITEMS} label="Product" />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs.map((t) => t.getAttribute('tabindex'))).toEqual(['0', '-1', '-1'])
  })

  it('moves and selects with ArrowRight, wrapping at the end', async () => {
    render(<A11yTabs items={ITEMS} label="Product" />)
    screen.getAllByRole('tab')[0].focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getAllByRole('tab')[1]).toHaveFocus()
    expect(screen.getByText('Pricing panel')).toBeInTheDocument()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    expect(screen.getAllByRole('tab')[0]).toHaveFocus()
  })

  it('moves with ArrowLeft, wrapping at the start', async () => {
    render(<A11yTabs items={ITEMS} label="Product" />)
    screen.getAllByRole('tab')[0].focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(screen.getAllByRole('tab')[2]).toHaveFocus()
  })

  it('jumps to the ends with Home and End', async () => {
    render(<A11yTabs items={ITEMS} label="Product" />)
    screen.getAllByRole('tab')[0].focus()
    await userEvent.keyboard('{End}')
    expect(screen.getAllByRole('tab')[2]).toHaveFocus()
    await userEvent.keyboard('{Home}')
    expect(screen.getAllByRole('tab')[0]).toHaveFocus()
  })

  it('uses the vertical arrow pair and says so, when orientation is vertical', async () => {
    render(<A11yTabs items={ITEMS} label="Product" orientation="vertical" />)
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
    screen.getAllByRole('tab')[0].focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getAllByRole('tab')[1]).toHaveFocus()
    // The horizontal pair must not also work, or the announced
    // orientation is a lie.
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getAllByRole('tab')[1]).toHaveFocus()
  })

  it('manual activation moves focus without selecting until Enter', async () => {
    render(<A11yTabs items={ITEMS} label="Product" activation="manual" />)
    screen.getAllByRole('tab')[0].focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getAllByRole('tab')[1]).toHaveFocus()
    expect(screen.getByText('Overview panel')).toBeInTheDocument()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByText('Pricing panel')).toBeInTheDocument()
  })

  it('makes the panel focusable so panels without focusable content are reachable', () => {
    render(<A11yTabs items={ITEMS} label="Product" />)
    expect(screen.getByRole('tabpanel')).toHaveAttribute('tabindex', '0')
  })

  it('warns in development when the tablist would have no accessible name', () => {
    render(<A11yTabs items={ITEMS} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('abaabil/tabs'))
  })

  it('does not warn when named by labelledBy', () => {
    render(
      <>
        <h2 id="h">Product</h2>
        <A11yTabs items={ITEMS} labelledBy="h" />
      </>
    )
    expect(warn).not.toHaveBeenCalled()
  })

  it('has no axe violations', async () => {
    const { container } = render(<A11yTabs items={ITEMS} label="Product" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
