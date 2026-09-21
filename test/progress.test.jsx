import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { axe } from 'jest-axe'
import Progress from '../src/progress/index.jsx'
import A11yProgress from '../src/progress/a11y.jsx'

describe('Progress (normal tier)', () => {
  it('renders a native progress element with the base class', () => {
    render(<Progress value={30} data-testid="p" />)
    const el = screen.getByTestId('p')
    expect(el.tagName).toBe('PROGRESS')
    expect(el).toHaveClass('abaabil-progress')
  })

  it('defaults max to 100', () => {
    render(<Progress value={30} data-testid="p" />)
    expect(screen.getByTestId('p')).toHaveAttribute('max', '100')
  })

  it('leaves value unset when omitted, which is what makes it indeterminate', () => {
    render(<Progress data-testid="p" />)
    expect(screen.getByTestId('p')).not.toHaveAttribute('value')
  })

  it('does not default value to 0, which would claim an unknown task is 0% done', () => {
    render(<Progress data-testid="p" />)
    expect(screen.getByTestId('p').getAttribute('value')).toBeNull()
  })

  it('adds no ARIA attributes and no role at the normal tier', () => {
    render(<Progress value={30} data-testid="p" />)
    const el = screen.getByTestId('p')
    expect([...el.attributes].map((a) => a.name).filter((a) => a.startsWith('aria-'))).toEqual([])
    expect(el).not.toHaveAttribute('role')
  })
})

describe('Progress (a11y tier)', () => {
  let warn
  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { warn.mockRestore() })

  it('associates a real label via htmlFor/id', () => {
    render(<A11yProgress label="Uploading" value={40} />)
    const el = screen.getByRole('progressbar', { name: 'Uploading' })
    expect(screen.getByText('Uploading').tagName).toBe('LABEL')
    expect(screen.getByText('Uploading')).toHaveAttribute('for', el.id)
  })

  it('names the bar with aria-labelledby, because a <label> alone does not name a <progress>', () => {
    // <progress> is a labelable element, so htmlFor is not wrong, but
    // accessible-name tooling computes nothing from it: axe names an
    // <input> from the same markup and names neither <progress> nor
    // <meter>. Without this the label was decorative.
    render(<A11yProgress label="Uploading" value={40} />)
    const el = screen.getByRole('progressbar')
    const labelledBy = el.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    expect(document.getElementById(labelledBy)).toHaveTextContent('Uploading')
    expect(document.getElementById(labelledBy).tagName).toBe('LABEL')
  })

  it('sets no aria-labelledby when there is no label to point at', () => {
    render(<A11yProgress aria-label="Uploading" value={40} />)
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-labelledby')
  })

  it('wires description into aria-describedby', () => {
    render(<A11yProgress label="Uploading" description="3 of 8 files" value={40} />)
    const id = screen.getByRole('progressbar').getAttribute('aria-describedby')
    expect(document.getElementById(id)).toHaveTextContent('3 of 8 files')
  })

  it('sets aria-valuetext when the number is not a percentage', () => {
    render(<A11yProgress label="Uploading" value={3} max={8} valueText="3 of 8 files" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '3 of 8 files')
  })

  it('omits aria-valuetext when not given, leaving the native percentage', () => {
    render(<A11yProgress label="Uploading" value={40} />)
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuetext')
  })

  it('stays indeterminate when value is omitted', () => {
    render(<A11yProgress label="Working" />)
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('value')
  })

  it('warns in development when there is no accessible name', () => {
    render(<A11yProgress value={40} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('abaabil/progress'))
  })

  it('does not warn when named by aria-label', () => {
    render(<A11yProgress aria-label="Uploading" value={40} />)
    expect(warn).not.toHaveBeenCalled()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <A11yProgress label="Uploading" description="3 of 8 files" value={3} max={8} valueText="3 of 8 files" />
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
