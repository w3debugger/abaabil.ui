import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { axe } from 'jest-axe'
import Carousel from '../src/carousel/index.jsx'
import A11yCarousel from '../src/carousel/a11y.jsx'

const SLIDES = [<img key="a" alt="One" />, <img key="b" alt="Two" />, <img key="c" alt="Three" />]

// jsdom lays nothing out, so every box is 0 wide. One viewport of 300
// and three slides make a 900 wide track, which is enough to tell "at
// the end" from "at the start".
let scrollLeft = 0
beforeEach(() => {
  scrollLeft = 0
  Object.defineProperty(Element.prototype, 'clientWidth', { configurable: true, get: () => 300 })
  Object.defineProperty(Element.prototype, 'scrollWidth', { configurable: true, get: () => 900 })
  Object.defineProperty(Element.prototype, 'scrollLeft', {
    configurable: true,
    get: () => scrollLeft,
    set: (v) => {
      scrollLeft = v
    },
  })
  Element.prototype.scrollBy = vi.fn()
  Element.prototype.scrollTo = vi.fn()
})
afterEach(() => vi.restoreAllMocks())

describe('Carousel (normal tier)', () => {
  it('renders one list item per slide and two buttons, with no ARIA', () => {
    const { container } = render(<Carousel items={SLIDES} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getAllByRole('button')).toHaveLength(2)
    expect(container.querySelector('[aria-controls], [role], [aria-live]')).toBeNull()
  })

  it('takes children as slides too', () => {
    render(
      <Carousel>
        <p>a</p>
        <p>b</p>
      </Carousel>
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  // The whole component: Next is scrollBy on an overflow container.
  it('scrolls the track forward one viewport on Next', async () => {
    render(<Carousel items={SLIDES} />)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: 300, behavior: 'smooth' })
  })

  it('scrolls back on Previous', async () => {
    render(<Carousel items={SLIDES} />)
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }))
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: -300, behavior: 'smooth' })
  })

  it('wraps to the first slide from the last when looping', async () => {
    scrollLeft = 600
    render(<Carousel items={SLIDES} loop />)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(Element.prototype.scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' })
    expect(Element.prototype.scrollBy).not.toHaveBeenCalled()
  })

  it('does not wrap without loop', async () => {
    scrollLeft = 600
    render(<Carousel items={SLIDES} />)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(Element.prototype.scrollTo).not.toHaveBeenCalled()
  })

  it('jumps instead of gliding when reduced motion is requested', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    render(<Carousel items={SLIDES} />)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: 300, behavior: 'auto' })
    vi.unstubAllGlobals()
  })
})

describe('Carousel (a11y tier)', () => {
  it('is a named region described as a carousel', () => {
    render(<A11yCarousel label="Featured" items={SLIDES} />)
    const region = screen.getByRole('region', { name: 'Featured' })
    expect(region).toHaveAttribute('aria-roledescription', 'carousel')
  })

  it('names each slide by its position', () => {
    render(<A11yCarousel label="Featured" items={SLIDES} />)
    const slide = screen.getByRole('group', { name: '1 of 3' })
    expect(slide).toHaveAttribute('aria-roledescription', 'slide')
    expect(screen.getByRole('group', { name: '3 of 3' })).toBeInTheDocument()
  })

  it('points both buttons at the track, which is in the tab order', () => {
    const { container } = render(<A11yCarousel label="Featured" items={SLIDES} />)
    const track = container.querySelector('.abaabil-carousel__track')
    expect(track).toHaveAttribute('tabindex', '0')
    expect(track.id).toBeTruthy()
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('aria-controls', track.id)
    }
  })

  it('marks Previous unavailable at the start, and clears it after scrolling', () => {
    const { container } = render(<A11yCarousel label="Featured" items={SLIDES} />)
    const track = container.querySelector('.abaabil-carousel__track')
    const prev = screen.getByRole('button', { name: 'Previous' })
    expect(prev).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('button', { name: 'Next' })).toHaveAttribute('aria-disabled', 'false')

    scrollLeft = 600
    act(() => {
      fireEvent.scroll(track)
      fireEvent(track, new Event('scrollend'))
    })
    vi.useFakeTimers()
    act(() => vi.runAllTimers())
    vi.useRealTimers()
    expect(prev).toHaveAttribute('aria-disabled', 'false')
    expect(screen.getByRole('button', { name: 'Next' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('never marks a button unavailable when looping', () => {
    render(<A11yCarousel label="Featured" items={SLIDES} loop />)
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('aria-disabled', 'false')
    }
  })

  it('announces the slide once a scroll settles', () => {
    const { container } = render(<A11yCarousel label="Featured" items={SLIDES} />)
    const track = container.querySelector('.abaabil-carousel__track')
    const live = container.querySelector('[aria-live="polite"]')
    expect(live).toHaveTextContent('Slide 1 of 3')

    scrollLeft = 300
    act(() => {
      fireEvent.scroll(track)
      fireEvent(track, new Event('scrollend'))
    })
    vi.useFakeTimers()
    act(() => vi.runAllTimers())
    vi.useRealTimers()
    expect(live).toHaveTextContent('Slide 2 of 3')
  })

  it('warns when it has no name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<A11yCarousel items={SLIDES} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('has no axe violations', async () => {
    const { container } = render(<A11yCarousel label="Featured" items={SLIDES} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
