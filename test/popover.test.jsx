import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { axe } from 'jest-axe'
import Popover, { PopoverTrigger, PopoverPanel } from '../src/popover/index.jsx'
import A11yPopover from '../src/popover/a11y.jsx'

// jsdom does not implement the Popover API: there is no showPopover(), and
// the `popover` attribute has no behaviour. So these tests assert the
// wiring that makes the browser do the work, not the opening and closing,
// which is the browser's to do and cannot be exercised here. The behaviour
// is verified in a real browser on the docs site instead.

describe('Popover (normal tier)', () => {
  it('renders a button wired to a panel by id, with no wrapper element', () => {
    const { container } = render(<Popover id="menu" trigger="Options">Body</Popover>)
    const button = screen.getByRole('button', { name: 'Options' })
    expect(button).toHaveAttribute('popovertarget', 'menu')
    expect(document.getElementById('menu')).toHaveAttribute('popover', 'auto')
    // A fragment, so the consumer's layout gains nothing.
    expect(container.children).toHaveLength(2)
  })

  it('gives the trigger type="button" so it never submits a form', () => {
    render(<Popover id="menu" trigger="Options">Body</Popover>)
    expect(screen.getByRole('button', { name: 'Options' })).toHaveAttribute('type', 'button')
  })

  it('defaults popovertargetaction to toggle and allows an override', () => {
    render(
      <>
        <PopoverTrigger target="a">Toggle</PopoverTrigger>
        <PopoverTrigger target="a" action="hide">Close</PopoverTrigger>
      </>
    )
    expect(screen.getByRole('button', { name: 'Toggle' })).toHaveAttribute('popovertargetaction', 'toggle')
    expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute('popovertargetaction', 'hide')
  })

  it('supports manual mode', () => {
    render(<Popover id="menu" mode="manual" trigger="Options">Body</Popover>)
    expect(document.getElementById('menu')).toHaveAttribute('popover', 'manual')
  })

  it('mints a matching anchor-name on the trigger and position-anchor on the panel', () => {
    render(<Popover id="menu" trigger="Options">Body</Popover>)
    const button = screen.getByRole('button', { name: 'Options' })
    const panel = document.getElementById('menu')
    expect(button.style.getPropertyValue('anchor-name')).toBe('--abaabil-popover-menu')
    expect(panel.style.getPropertyValue('position-anchor')).toBe('--abaabil-popover-menu')
  })

  it('sanitises ids that are not valid inside a dashed-ident', () => {
    render(<Popover id="a:b c" trigger="Options">Body</Popover>)
    const name = screen.getByRole('button', { name: 'Options' }).style.getPropertyValue('anchor-name')
    expect(name).toBe('--abaabil-popover-a-b-c')
    expect(name).toMatch(/^--[\w-]+$/)
  })

  it('adds no ARIA attributes and no role at the normal tier', () => {
    render(<Popover id="menu" trigger="Options">Body</Popover>)
    const panel = document.getElementById('menu')
    expect([...panel.attributes].map((a) => a.name).filter((a) => a.startsWith('aria-'))).toEqual([])
    expect(panel).not.toHaveAttribute('role')
  })

  it('exposes the trigger and panel separately for composition', () => {
    render(
      <div>
        <PopoverTrigger target="p1">Open</PopoverTrigger>
        <hr />
        <PopoverPanel id="p1">Panel body</PopoverPanel>
      </div>
    )
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('popovertarget', 'p1')
    expect(document.getElementById('p1')).toHaveTextContent('Panel body')
  })
})

describe('Popover (a11y tier)', () => {
  let warn
  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { warn.mockRestore() })

  it('gives the panel a role, without which its name is discarded', () => {
    // A bare <div popover> has no role, and aria-label is prohibited on
    // a generic element: the panel computed role null and no accessible
    // name at all, so this tier's whole contribution was being dropped.
    // axe flags it as aria-prohibited-attr.
    render(<A11yPopover id="menu" trigger="Options" label="Display options">Body</A11yPopover>)
    expect(document.getElementById('menu')).toHaveAttribute('role', 'group')
  })

  it('allows the role to be overridden for a panel that is really a dialog', () => {
    render(
      <A11yPopover id="menu" trigger="Options" label="Options" role="dialog">Body</A11yPopover>
    )
    expect(document.getElementById('menu')).toHaveAttribute('role', 'dialog')
  })

  it('names the panel with aria-label', () => {
    render(<A11yPopover id="menu" trigger="Options" label="Display options">Body</A11yPopover>)
    expect(document.getElementById('menu')).toHaveAttribute('aria-label', 'Display options')
  })

  it('names the panel with aria-labelledby when a visible heading already names it', () => {
    render(
      <A11yPopover id="menu" trigger="Options" labelledBy="h">
        <h2 id="h">Display options</h2>
      </A11yPopover>
    )
    const panel = document.getElementById('menu')
    expect(panel).toHaveAttribute('aria-labelledby', 'h')
    expect(panel).not.toHaveAttribute('aria-label')
  })

  it('warns in development when the panel would have no accessible name', () => {
    render(<A11yPopover id="menu" trigger="Options">Body</A11yPopover>)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('abaabil/popover'))
  })

  it('does not warn when named', () => {
    render(<A11yPopover id="menu" trigger="Options" label="Display options">Body</A11yPopover>)
    expect(warn).not.toHaveBeenCalled()
  })

  it('does not put a static aria-expanded on the trigger', () => {
    render(<A11yPopover id="menu" trigger="Options" label="Display options">Body</A11yPopover>)
    expect(screen.getByRole('button', { name: 'Options' })).not.toHaveAttribute('aria-expanded')
  })

  it('keeps the native wiring the tiers below it established', () => {
    render(<A11yPopover id="menu" trigger="Options" label="Display options">Body</A11yPopover>)
    expect(screen.getByRole('button', { name: 'Options' })).toHaveAttribute('popovertarget', 'menu')
    expect(document.getElementById('menu')).toHaveAttribute('popover', 'auto')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <A11yPopover id="menu" trigger="Options" label="Display options">
        <p>Some options.</p>
      </A11yPopover>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
