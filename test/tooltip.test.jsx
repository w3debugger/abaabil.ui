import { readFileSync } from 'node:fs'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import Tooltip from '../src/tooltip/index.jsx'
import A11yTooltip from '../src/tooltip/a11y.jsx'

// The normal and styled tiers show and hide entirely in CSS, which jsdom
// does not apply, so visibility itself is not assertable here. What is
// assertable is the structure the CSS keys off, and everything the a11y
// tier adds on top, which is the part that needs JavaScript.

describe('Tooltip (normal tier)', () => {
  it('renders the trigger and a bubble in one wrapper', () => {
    const { container } = render(
      <Tooltip content="Saves to your account">
        <button type="button">Save</button>
      </Tooltip>
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(container.querySelector('.abaabil-tooltip__bubble'))
      .toHaveTextContent('Saves to your account')
  })

  it('carries no role at the normal tier: a tooltip role with nothing describing it says nothing', () => {
    const { container } = render(
      <Tooltip content="Hi">
        <button type="button">Save</button>
      </Tooltip>
    )
    expect(container.querySelector('.abaabil-tooltip__bubble')).not.toHaveAttribute('role')
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('carries the placement as data, which is what the CSS positions from', () => {
    const { container } = render(
      <Tooltip content="Hi" placement="bottom">
        <button type="button">Save</button>
      </Tooltip>
    )
    expect(container.querySelector('.abaabil-tooltip')).toHaveAttribute('data-placement', 'bottom')
  })

  it('defaults placement to top', () => {
    const { container } = render(
      <Tooltip content="Hi">
        <button type="button">Save</button>
      </Tooltip>
    )
    expect(container.querySelector('.abaabil-tooltip')).toHaveAttribute('data-placement', 'top')
  })

  it('does not describe the trigger: that is the a11y tier', () => {
    render(
      <Tooltip content="Hi">
        <button type="button">Save</button>
      </Tooltip>
    )
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby')
  })
})

describe('Tooltip (a11y tier)', () => {
  let warn
  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { warn.mockRestore() })

  it('describes the trigger with the bubble, which is what makes it announced', () => {
    render(
      <A11yTooltip content="Saves to your account">
        <button type="button">Save</button>
      </A11yTooltip>
    )
    const button = screen.getByRole('button', { name: 'Save' })
    const describedBy = button.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy)).toHaveTextContent('Saves to your account')
  })

  it('clones the child rather than wrapping it, so the trigger stays your element', () => {
    render(
      <A11yTooltip content="Hi">
        <button type="button" className="mine" data-testid="t">Save</button>
      </A11yTooltip>
    )
    const button = screen.getByTestId('t')
    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveClass('mine')
  })

  it('preserves a consumer aria-describedby alongside its own', () => {
    render(
      <>
        <span id="outside">Outside note</span>
        <A11yTooltip content="Hi">
          <button type="button" aria-describedby="outside">Save</button>
        </A11yTooltip>
      </>
    )
    const ids = screen.getByRole('button').getAttribute('aria-describedby').split(' ')
    expect(ids).toContain('outside')
    expect(ids).toHaveLength(2)
  })

  it('dismisses on Escape, which WCAG 1.4.13 requires and CSS cannot do', async () => {
    const { container } = render(
      <A11yTooltip content="Hi">
        <button type="button">Save</button>
      </A11yTooltip>
    )
    const wrapper = container.querySelector('.abaabil-tooltip')
    expect(wrapper).not.toHaveAttribute('data-dismissed')
    screen.getByRole('button').focus()
    await userEvent.keyboard('{Escape}')
    expect(wrapper).toHaveAttribute('data-dismissed', 'true')
  })

  it('keeps the bubble in the DOM when dismissed, so aria-describedby still resolves', async () => {
    render(
      <A11yTooltip content="Hi">
        <button type="button">Save</button>
      </A11yTooltip>
    )
    screen.getByRole('button').focus()
    await userEvent.keyboard('{Escape}')
    const id = screen.getByRole('button').getAttribute('aria-describedby')
    expect(document.getElementById(id)).toBeInTheDocument()
  })

  it('un-dismisses on the next hover, so Escape is not permanent', async () => {
    const { container } = render(
      <A11yTooltip content="Hi">
        <button type="button">Save</button>
      </A11yTooltip>
    )
    const wrapper = container.querySelector('.abaabil-tooltip')
    screen.getByRole('button').focus()
    await userEvent.keyboard('{Escape}')
    expect(wrapper).toHaveAttribute('data-dismissed', 'true')
    await userEvent.hover(wrapper)
    expect(wrapper).not.toHaveAttribute('data-dismissed')
  })

  it('warns when the child cannot receive props, which would make it invisible to keyboards', () => {
    render(<A11yTooltip content="Hi">just text</A11yTooltip>)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('abaabil/tooltip'))
  })

  it('does not warn for a real element child', () => {
    render(
      <A11yTooltip content="Hi">
        <button type="button">Save</button>
      </A11yTooltip>
    )
    expect(warn).not.toHaveBeenCalled()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <A11yTooltip content="Saves to your account">
        <button type="button">Save</button>
      </A11yTooltip>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

// jsdom applies no CSS, so the show/hide mechanism itself cannot be
// exercised here. This reads the stylesheet instead, because the rule it
// checks encodes a bug that cost real time to find: with the fade on the
// shown state, the bubble stayed at opacity 0 whenever transitions did
// not advance, while every selector said it should be visible. A tooltip
// that silently never appears is worse than one that never fades.
// Vite rewrites `new URL('<literal>', import.meta.url)` at transform
// time, so the base has to be captured at module scope first. Same trap
// as test/tiers.test.jsx, which has the same comment.
const HERE = import.meta.url

describe('Tooltip stylesheet', () => {
  const css = readFileSync(new URL('../src/tooltip/tooltip.css', HERE), 'utf8')

  it('shows instantly on focus, so appearing never depends on a transition running', () => {
    const shown = css.match(
      /\.abaabil-tooltip:focus-within \.abaabil-tooltip__bubble[^{]*\{([^}]*)\}/
    )
    expect(shown, 'the focus rule went missing').not.toBeNull()
    expect(shown[1]).toMatch(/transition:\s*none/)
    expect(shown[1]).toMatch(/visibility:\s*visible/)
  })

  // Sweeping the pointer across a toolbar must not flash every tooltip.
  // The focus rule comes after the hover rule so it wins when both apply.
  it('delays showing on hover, and lets the focus rule win by coming second', () => {
    const hover = css.match(/\.abaabil-tooltip:hover \.abaabil-tooltip__bubble[^{]*\{([^}]*)\}/)
    expect(hover, 'the hover rule went missing').not.toBeNull()
    expect(hover[1]).toMatch(/transition:\s*opacity 0s 300ms, visibility 0s 300ms/)
    expect(css.indexOf('.abaabil-tooltip:hover')).toBeLessThan(css.indexOf('.abaabil-tooltip:focus-within'))
  })

  // translate is physical, so the inset it centres against must be too:
  // a logical inset in RTL landed the bubble a full width off its trigger.
  it('centres the bubble with a physical inset, so RTL is not a bubble width off', () => {
    const bubble = css.match(/\.abaabil-tooltip__bubble \{([^}]*)\}/)
    expect(bubble[1]).toMatch(/left:\s*50%;\s*translate:\s*-50% 0/)
  })

  it('steps visibility at the end of the fade rather than interpolating it', () => {
    expect(css).toMatch(/visibility 0s linear var\(--duration-fast\)/)
  })

  it('never makes the bubble a pointer target', () => {
    expect(css).toMatch(/pointer-events:\s*none/)
  })
})
