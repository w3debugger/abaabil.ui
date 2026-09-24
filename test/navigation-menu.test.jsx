import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { axe } from 'jest-axe'
import NavigationMenu from '../src/navigation-menu/index.jsx'
import A11yNavigationMenu from '../src/navigation-menu/a11y.jsx'

// jsdom implements no Popover API, so panels never actually open here.
// What that leaves testable is the wiring the browser acts on, the ARIA,
// and the keyboard handling, which is ours. Opening, light-dismiss and
// Escape-to-close are the browser's and are checked on the docs site.

afterEach(() => vi.restoreAllMocks())

const ITEMS = [
  { label: 'Home', href: '/', current: true },
  {
    label: 'Products',
    items: [
      { label: 'Editor', href: '/editor', description: 'Write and publish.' },
      { label: 'Analytics', href: '/analytics' },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
]

// Stand in for the Popover API jsdom does not have.
const stub = (panel) => {
  panel.showPopover = vi.fn()
  panel.hidePopover = vi.fn()
  return panel
}

describe('NavigationMenu (normal tier)', () => {
  it('is a nav around a list of real links', () => {
    render(<NavigationMenu id="n" items={ITEMS} />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '/pricing')
  })

  it('renders an entry with children as a popover trigger and a panel with a matching id', () => {
    render(<NavigationMenu id="n" items={ITEMS} />)
    const trigger = screen.getByRole('button', { name: 'Products' })
    expect(trigger).toHaveAttribute('popovertarget', 'n-1')
    const panel = document.getElementById('n-1')
    expect(panel).toHaveAttribute('popover', 'auto')
    expect(panel.querySelector('a[href="/editor"]')).toHaveTextContent('Write and publish.')
    expect(trigger.style.getPropertyValue('anchor-name')).toBe('--abaabil-navigation-menu-n-1')
    expect(panel.style.getPropertyValue('position-anchor')).toBe('--abaabil-navigation-menu-n-1')
  })

  it('marks the current link as data only, with no ARIA at this tier', () => {
    const { container } = render(<NavigationMenu id="n" items={ITEMS} />)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('data-current')
    expect(container.querySelector('[aria-current], [aria-expanded], [aria-label]')).toBeNull()
  })
})

describe('NavigationMenu (a11y tier)', () => {
  it('names the nav and the current page', () => {
    render(<A11yNavigationMenu id="n" label="Main" items={ITEMS} />)
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Pricing' })).not.toHaveAttribute('aria-current')
  })

  it('warns, gently, when the nav has no name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yNavigationMenu id="n" items={ITEMS} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('label'))
  })

  it("tracks aria-expanded from the panel's own toggle event", () => {
    render(<A11yNavigationMenu id="n" label="Main" items={ITEMS} />)
    const trigger = screen.getByRole('button', { name: 'Products' })
    const panel = document.getElementById('n-1')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent(panel, Object.assign(new Event('toggle'), { newState: 'open' }))
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    fireEvent(panel, Object.assign(new Event('toggle'), { newState: 'closed' }))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens on ArrowDown and moves focus to the first link in the panel', async () => {
    render(<A11yNavigationMenu id="n" label="Main" items={ITEMS} />)
    const panel = stub(document.getElementById('n-1'))
    screen.getByRole('button', { name: 'Products' }).focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(panel.showPopover).toHaveBeenCalled()
    expect(screen.getByRole('link', { name: /Editor/ })).toHaveFocus()
  })

  it('closes on Escape inside the panel and returns focus to the trigger', async () => {
    render(<A11yNavigationMenu id="n" label="Main" items={ITEMS} />)
    const panel = stub(document.getElementById('n-1'))
    screen.getByRole('link', { name: 'Analytics' }).focus()
    await userEvent.keyboard('{Escape}')
    expect(panel.hidePopover).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Products' })).toHaveFocus()
  })

  it('closes on ArrowUp too, the disclosure pattern\'s way back', async () => {
    render(<A11yNavigationMenu id="n" label="Main" items={ITEMS} />)
    const panel = stub(document.getElementById('n-1'))
    screen.getByRole('link', { name: 'Analytics' }).focus()
    await userEvent.keyboard('{ArrowUp}')
    expect(panel.hidePopover).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Products' })).toHaveFocus()
  })

  it('opens after the pointer rests on a trigger only when asked to', () => {
    vi.useFakeTimers()
    try {
      render(<A11yNavigationMenu id="n" label="Main" openOnHover items={ITEMS} />)
      const panel = stub(document.getElementById('n-1'))
      const trigger = screen.getByRole('button', { name: 'Products' })
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
      fireEvent.pointerLeave(trigger)
      vi.advanceTimersByTime(200)
      expect(panel.showPopover).not.toHaveBeenCalled()
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
      vi.advanceTimersByTime(200)
      expect(panel.showPopover).toHaveBeenCalledTimes(1)
    } finally {
      vi.useRealTimers()
    }
  })

  // These are links, so this is a disclosure navigation, not a menu
  // widget. A screen reader told otherwise would try to operate it as one.
  it('never claims to be a menu', () => {
    const { container } = render(<A11yNavigationMenu id="n" label="Main" items={ITEMS} />)
    expect(container.querySelector('[role="menu"], [role="menuitem"], [role="menubar"]')).toBeNull()
    expect(screen.getByRole('button', { name: 'Products' })).not.toHaveAttribute('aria-haspopup')
  })

  it('has no axe violations', async () => {
    const { container } = render(<A11yNavigationMenu id="n" label="Main" items={ITEMS} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
