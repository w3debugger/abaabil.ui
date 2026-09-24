import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import Switch from '../src/switch/index.jsx'
import A11ySwitch from '../src/switch/a11y.jsx'

describe('Switch (normal tier)', () => {
  it('renders a native checkbox carrying role="switch"', () => {
    render(<Switch data-testid="s" />)
    const el = screen.getByTestId('s')
    expect(el.tagName).toBe('INPUT')
    expect(el).toHaveAttribute('type', 'checkbox')
    expect(el).toHaveAttribute('role', 'switch')
    expect(el).toHaveClass('abaabil-switch')
  })

  it('is exposed to assistive tech as a switch, not a checkbox', () => {
    render(<Switch aria-label="Notifications" />)
    expect(screen.getByRole('switch', { name: 'Notifications' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).toBeNull()
  })

  it('carries no aria-* attributes: the role is identity, not wiring', () => {
    render(<Switch data-testid="s" />)
    const attrs = [...screen.getByTestId('s').attributes].map((a) => a.name)
    expect(attrs.filter((a) => a.startsWith('aria-'))).toEqual([])
  })

  it('does not duplicate checked state into aria-checked', async () => {
    render(<Switch aria-label="Notifications" />)
    const el = screen.getByRole('switch')
    expect(el).not.toHaveAttribute('aria-checked')
    await userEvent.click(el)
    expect(el).toBeChecked()
    expect(el).not.toHaveAttribute('aria-checked')
  })

  it('merges a consumer className instead of replacing the base class', () => {
    render(<Switch className="mine" data-testid="s" />)
    expect(screen.getByTestId('s')).toHaveClass('abaabil-switch')
    expect(screen.getByTestId('s')).toHaveClass('mine')
  })

  it('toggles with the keyboard like the native control it is', async () => {
    render(<Switch aria-label="Notifications" />)
    const el = screen.getByRole('switch')
    el.focus()
    await userEvent.keyboard(' ')
    expect(el).toBeChecked()
    await userEvent.keyboard(' ')
    expect(el).not.toBeChecked()
  })
})

describe('Switch (a11y tier)', () => {
  let warn
  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { warn.mockRestore() })

  it('associates a real label, and clicking it toggles the switch', async () => {
    render(<A11ySwitch label="Notifications" />)
    const el = screen.getByRole('switch', { name: 'Notifications' })
    const label = screen.getByText('Notifications')
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveAttribute('for', el.id)
    await userEvent.click(label)
    expect(el).toBeChecked()
  })

  it('wraps the control in the label so the whole row is the hit target, and keeps the description outside it', () => {
    render(<A11ySwitch label="Notifications" description="Email me about replies" />)
    const el = screen.getByRole('switch', { name: 'Notifications' })
    const label = screen.getByText('Notifications')
    expect(label).toContainElement(el)
    expect(label).not.toContainElement(screen.getByText('Email me about replies'))
  })

  it('derives the description id from a consumer-supplied id', () => {
    render(<A11ySwitch label="Notifications" id="notify" description="Help" />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-describedby', 'notify-description')
  })

  it('wires description into aria-describedby', () => {
    render(<A11ySwitch label="Notifications" description="Email me about replies" />)
    const el = screen.getByRole('switch')
    const id = el.getAttribute('aria-describedby')
    expect(document.getElementById(id)).toHaveTextContent('Email me about replies')
  })

  it('preserves a consumer aria-describedby alongside the generated id', () => {
    render(
      <>
        <span id="outside">Outside note</span>
        <A11ySwitch label="Notifications" description="Help" aria-describedby="outside" />
      </>
    )
    const ids = screen.getByRole('switch').getAttribute('aria-describedby').split(' ')
    expect(ids).toContain('outside')
    expect(ids).toHaveLength(2)
  })

  it('warns in development when the switch would have no accessible name', () => {
    render(<A11ySwitch />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('abaabil/switch'))
  })

  it('does not warn when named by aria-label instead of label', () => {
    render(<A11ySwitch aria-label="Notifications" />)
    expect(warn).not.toHaveBeenCalled()
  })

  it('reports its state through the native checked property', async () => {
    render(<A11ySwitch label="Notifications" defaultChecked />)
    const el = screen.getByRole('switch')
    expect(el).toBeChecked()
    await userEvent.click(el)
    expect(el).not.toBeChecked()
  })

  it('has no axe violations with a label and description', async () => {
    const { container } = render(
      <A11ySwitch label="Notifications" description="Email me about replies" />
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
