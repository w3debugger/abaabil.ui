import { readFileSync } from 'node:fs'
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

const HERE = import.meta.url

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

  // aria-atomic on the region made every addition re-announce every
  // toast already up. On each toast it reads that one message whole.
  it('makes each toast atomic rather than the live region', () => {
    const { container } = render(
      <ToastLive>
        <A11yToast duration={null} data-testid="t">Saved</A11yToast>
      </ToastLive>
    )
    for (const region of container.querySelectorAll('[aria-live]')) {
      expect(region).not.toHaveAttribute('aria-atomic')
    }
    expect(screen.getByTestId('t')).toHaveAttribute('aria-atomic', 'true')
  })

  // The README promised politeness from the variant; nothing sorted
  // until ToastLive took children.
  it('sorts children by variant: danger is assertive, the rest polite', () => {
    const { container } = render(
      <ToastLive>
        <A11yToast duration={null} variant="success">Saved</A11yToast>
        <A11yToast duration={null} variant="danger">Failed</A11yToast>
        <A11yToast duration={null}>Note</A11yToast>
      </ToastLive>
    )
    const polite = container.querySelector('[aria-live="polite"]')
    const assertive = container.querySelector('[aria-live="assertive"]')
    expect(polite).toHaveTextContent('Saved')
    expect(polite).toHaveTextContent('Note')
    expect(polite).not.toHaveTextContent('Failed')
    expect(assertive).toHaveTextContent('Failed')
  })

  it('still takes the two hand-sorted slots', () => {
    const { container } = render(
      <ToastLive polite={<A11yToast duration={null}>Saved</A11yToast>} assertive={<A11yToast duration={null}>Failed</A11yToast>} />
    )
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('Saved')
    expect(container.querySelector('[aria-live="assertive"]')).toHaveTextContent('Failed')
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

  // Leaving by pointer while focus is still inside must not resume the
  // timer; the toast would vanish from under a keyboard user reaching
  // for its button.
  it('stays paused after the pointer leaves while focus is still inside', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onDismiss = vi.fn()
    render(<A11yToast duration={3000} onDismiss={onDismiss} data-testid="t">Saved</A11yToast>)
    const el = screen.getByTestId('t')
    screen.getByRole('button', { name: 'Dismiss' }).focus()
    await user.hover(el)
    await user.unhover(el)
    act(() => { vi.advanceTimersByTime(10000) })
    expect(onDismiss).not.toHaveBeenCalled()
  })

  // The close button unmounts with the toast, so without this focus
  // dropped to body.
  it('returns focus to where it came from when the close button is used', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <>
        <button type="button">Before</button>
        <A11yToast duration={null} onDismiss={() => {}}>Saved</A11yToast>
      </>
    )
    screen.getByRole('button', { name: 'Before' }).focus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Dismiss' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus()
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

// jsdom applies no CSS, so layout is read from the stylesheet.
describe('Toast stylesheet', () => {
  const css = readFileSync(new URL('../src/toast/toast.css', HERE), 'utf8')

  // column-reverse put an appended toast furthest from the bottom edge
  // and ran Tab order bottom to top.
  it('stacks a bottom region as a plain column', () => {
    const bottom = css.match(/\.abaabil-toast-region\[data-position="bottom"\] \{([^}]*)\}/)
    expect(bottom[1]).not.toMatch(/flex-direction/)
  })

  it('gives the close button a hit area past its 24px box', () => {
    expect(css).toMatch(/\.abaabil-toast__close::before \{[^}]*inset: -0\.625rem/)
  })
})
