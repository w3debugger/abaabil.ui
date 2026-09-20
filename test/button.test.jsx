import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import Button from '../src/button/index.jsx'
import A11yButton from '../src/button/a11y.jsx'

describe('Button (normal tier)', () => {
  it('renders a button element with the base class', () => {
    render(<Button>Save</Button>)
    const btn = screen.getByRole('button', { name: 'Save' })
    expect(btn.tagName).toBe('BUTTON')
    expect(btn).toHaveClass('abaabil-button')
  })

  it('defaults type to "button" so it never submits a form by accident', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('allows type to be overridden for real submit buttons', () => {
    render(<Button type="submit">Send</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('merges a consumer className instead of replacing the base class', () => {
    render(<Button className="mine">Save</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('abaabil-button')
    expect(btn).toHaveClass('mine')
  })

  it('renders as another element via `as` and omits type there', () => {
    render(<Button as="a" href="/x">Link</Button>)
    const link = screen.getByRole('link', { name: 'Link' })
    expect(link.tagName).toBe('A')
    expect(link).not.toHaveAttribute('type')
  })

  it('forwards arbitrary props including ref (React 19, no forwardRef)', () => {
    let captured = null
    render(<Button ref={(el) => { captured = el }} data-testid="b">Save</Button>)
    expect(captured).not.toBeNull()
    expect(captured.dataset.testid).toBe('b')
  })

  it('adds no ARIA attributes at the normal tier', () => {
    render(<Button>Save</Button>)
    const attrs = [...screen.getByRole('button').attributes].map((a) => a.name)
    expect(attrs.filter((a) => a.startsWith('aria-'))).toEqual([])
  })
})

describe('Button (styled tier)', () => {
  it('re-exports the same component contract', async () => {
    const { default: Styled } = await import('../src/button/styled.jsx')
    render(<Styled>Save</Styled>)
    const btn = screen.getByRole('button', { name: 'Save' })
    expect(btn).toHaveClass('abaabil-button')
    expect(btn).toHaveAttribute('type', 'button')
  })
})

describe('Button (a11y tier)', () => {
  let warn
  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { warn.mockRestore() })

  it('uses the native disabled attribute by default', () => {
    render(<A11yButton disabled>Save</A11yButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('uses aria-disabled and stays focusable when keepFocusable is set', async () => {
    const onClick = vi.fn()
    render(<A11yButton disabled keepFocusable onClick={onClick}>Save</A11yButton>)
    const btn = screen.getByRole('button')
    expect(btn).not.toBeDisabled()
    expect(btn).toHaveAttribute('aria-disabled', 'true')
    btn.focus()
    expect(btn).toHaveFocus()
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('warns in development when an icon-only button has no accessible name', () => {
    render(<A11yButton leftIcon={<svg />} />)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('accessible name')
    )
  })

  it('does not warn when an icon-only button has aria-label', () => {
    render(<A11yButton leftIcon={<svg />} aria-label="Close" />)
    expect(warn).not.toHaveBeenCalled()
  })

  it('marks decorative icons aria-hidden so they are not announced', () => {
    render(<A11yButton leftIcon={<svg data-testid="icon" />}>Save</A11yButton>)
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true')
  })

  it('gives link-buttons a button role and Space activation', async () => {
    const onClick = vi.fn()
    render(<A11yButton as="a" href="#x" onClick={onClick}>Go</A11yButton>)
    const el = screen.getByRole('button', { name: 'Go' })
    expect(el.tagName).toBe('A')
    expect(el).toHaveAttribute('tabindex', '0')
    el.focus()
    await userEvent.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('removes a disabled link-button from the tab order', () => {
    render(<A11yButton as="a" href="#x" disabled>Go</A11yButton>)
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute('tabindex', '-1')
  })
})
