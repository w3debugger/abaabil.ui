import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Toast, ToastRegion } from '../src/toast/index.jsx'
import {
  Toast as A11yToast,
  ToastRegion as A11yToastRegion,
  ToastLive,
} from '../src/toast/a11y.jsx'

afterEach(() => vi.restoreAllMocks())

describe('Toast (normal tier)', () => {
  it('renders a plain container with the variant as data and no live region', () => {
    render(<Toast data-testid="t">Saved</Toast>)
    const el = screen.getByTestId('t')
    expect(el).toHaveAttribute('data-variant', 'neutral')
    expect(el).not.toHaveAttribute('aria-live')
    expect(el).not.toHaveAttribute('role')
  })

  it('renders the region with its placement as data', () => {
    render(<ToastRegion align="start" position="top" data-testid="r" />)
    const el = screen.getByTestId('r')
    expect(el).toHaveAttribute('data-align', 'start')
    expect(el).toHaveAttribute('data-position', 'top')
  })
})

describe('ToastRegion (a11y tier)', () => {
  // Toasts disappear on a timer. Without a landmark, someone who hears
  // a message and wants to re-read it has nowhere to go.
  it('is a named landmark', () => {
    render(<A11yToastRegion />)
    expect(screen.getByRole('region', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('takes a different name', () => {
    render(<A11yToastRegion label="Alerts" />)
    expect(screen.getByRole('region', { name: 'Alerts' })).toBeInTheDocument()
  })

  // The single most common way this pattern breaks: a live region
  // inserted together with its first message announces nothing,
  // because there was no region for the screen reader to be watching.
  it('renders both live regions even with nothing in them', () => {
    const { container } = render(
      <A11yToastRegion>
        <ToastLive polite={null} assertive={null} />
      </A11yToastRegion>
    )
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument()
    expect(container.querySelector('[aria-live="assertive"]')).toBeInTheDocument()
  })

  it('makes both live regions atomic, so the whole message is read as one', () => {
    const { container } = render(<ToastLive polite={null} assertive={null} />)
    for (const region of container.querySelectorAll('[aria-live]')) {
      expect(region).toHaveAttribute('aria-atomic', 'true')
    }
  })
})

describe('Toast (a11y tier)', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => vi.useRealTimers())

  it('dismisses itself after its duration', () => {
    const onDismiss = vi.fn()
    render(<A11yToast duration={3000} onDismiss={onDismiss}>Saved</A11yToast>)
    expect(onDismiss).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(3000) })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('stays put when given no duration', () => {
    const onDismiss = vi.fn()
    render(<A11yToast duration={null} onDismiss={onDismiss}>Saved</A11yToast>)
    act(() => { vi.advanceTimersByTime(60000) })
    expect(onDismiss).not.toHaveBeenCalled()
  })

  // Stops a message vanishing from under someone reading it, or
  // reaching for its button.
  it('pauses its timer while the pointer is over it', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onDismiss = vi.fn()
    render(<A11yToast duration={3000} onDismiss={onDismiss} data-testid="t">Saved</A11yToast>)
    await user.hover(screen.getByTestId('t'))
    act(() => { vi.advanceTimersByTime(10000) })
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('resumes when the pointer leaves', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onDismiss = vi.fn()
    render(<A11yToast duration={3000} onDismiss={onDismiss} data-testid="t">Saved</A11yToast>)
    const el = screen.getByTestId('t')
    await user.hover(el)
    await user.unhover(el)
    act(() => { vi.advanceTimersByTime(3000) })
    expect(onDismiss).toHaveBeenCalled()
  })

  it('dismisses from its close button', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onDismiss = vi.fn()
    render(<A11yToast duration={null} onDismiss={onDismiss}>Saved</A11yToast>)
    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalled()
  })

  it('renders no close button when there is nothing to call', () => {
    render(<A11yToast duration={null}>Saved</A11yToast>)
    expect(screen.queryByRole('button')).toBeNull()
  })

  // WCAG 2.2.1: a five-second window to hit Undo fails for most
  // people and all of them under pressure.
  it('warns when an action is put on a timer', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <A11yToast duration={5000} action={<button type="button">Undo</button>}>
        Message deleted
      </A11yToast>
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('2.2.1'))
  })

  it('does not warn for an action with no timer', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <A11yToast duration={null} action={<button type="button">Undo</button>}>
        Message deleted
      </A11yToast>
    )
    expect(warn).not.toHaveBeenCalled()
  })
})
