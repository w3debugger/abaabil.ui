import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { axe } from 'jest-axe'
import FileInput from '../src/file/index.jsx'
import A11yFile from '../src/file/a11y.jsx'

describe('File (normal tier)', () => {
  it('renders a real file input, not a button hiding one', () => {
    render(<FileInput data-testid="f" />)
    const el = screen.getByTestId('f')
    expect(el.tagName).toBe('INPUT')
    expect(el).toHaveAttribute('type', 'file')
    expect(el).toHaveClass('abaabil-file')
  })

  it('forwards accept and multiple to the platform', () => {
    render(<FileInput accept=".pdf,.png" multiple data-testid="f" />)
    const el = screen.getByTestId('f')
    expect(el).toHaveAttribute('accept', '.pdf,.png')
    expect(el).toHaveAttribute('multiple')
  })

  it('adds no ARIA attributes and no role at the normal tier', () => {
    render(<FileInput data-testid="f" />)
    const el = screen.getByTestId('f')
    expect([...el.attributes].map((a) => a.name).filter((a) => a.startsWith('aria-'))).toEqual([])
    expect(el).not.toHaveAttribute('role')
  })
})

describe('File (a11y tier)', () => {
  let warn
  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { warn.mockRestore() })

  it('associates a real label via htmlFor/id', () => {
    render(<A11yFile label="Attachment" />)
    const el = screen.getByLabelText('Attachment')
    expect(el).toHaveAttribute('type', 'file')
    expect(screen.getByText('Attachment')).toHaveAttribute('for', el.id)
  })

  it('wires description and error into aria-describedby', () => {
    render(<A11yFile label="Attachment" description="PDF or PNG, under 5 MB." error="Too large." />)
    const el = screen.getByLabelText('Attachment')
    const ids = el.getAttribute('aria-describedby').split(' ')
    const texts = ids.map((id) => document.getElementById(id).textContent)
    expect(texts).toContain('PDF or PNG, under 5 MB.')
    expect(texts).toContain('Too large.')
    expect(el).toHaveAttribute('aria-invalid', 'true')
  })

  it('warns when there is no accessible name', () => {
    render(<A11yFile />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('abaabil/file'))
  })

  it('warns when accept is set with nothing saying so in words', () => {
    // accept filters the dialog silently and does not apply to a drop,
    // so on its own it tells the user nothing.
    render(<A11yFile label="Attachment" accept=".pdf" />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accept'))
  })

  it('does not warn about accept when a description explains it', () => {
    render(<A11yFile label="Attachment" accept=".pdf" description="PDF only." />)
    expect(warn).not.toHaveBeenCalled()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <A11yFile label="Attachment" description="PDF or PNG, under 5 MB." accept=".pdf,.png" />
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
