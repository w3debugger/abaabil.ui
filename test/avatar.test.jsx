import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { axe } from 'jest-axe'
import Avatar, { initials } from '../src/avatar/index.jsx'
import A11yAvatar from '../src/avatar/a11y.jsx'

describe('initials', () => {
  it('takes the first letter of the first and last word', () => {
    expect(initials('Fatima Ahmed')).toBe('FA')
    expect(initials('Zaid ibn Thabit al-Ansari')).toBe('ZA')
  })

  it('gives one letter for a single name, not two letters of it', () => {
    expect(initials('Ali')).toBe('A')
  })

  it('handles empty and whitespace input', () => {
    expect(initials('')).toBe('')
    expect(initials(undefined)).toBe('')
    expect(initials('   ')).toBe('')
  })

  it('does not split a multi-code-unit first character in half', () => {
    // Slicing by code unit would return half a surrogate pair and
    // render a replacement glyph.
    const out = initials('😀 Smith')
    expect(out.startsWith('😀')).toBe(true)
  })

  it('handles non-Latin names', () => {
    expect(initials('فاطمة أحمد')).toBe('فأ')
  })
})

describe('Avatar (normal tier)', () => {
  it('renders an image when given a src', () => {
    render(<Avatar src="/a.png" name="Fatima Ahmed" alt="Fatima Ahmed" />)
    expect(screen.getByRole('img', { name: 'Fatima Ahmed' })).toHaveAttribute('src', '/a.png')
  })

  it('falls back to initials with no src', () => {
    const { container } = render(<Avatar name="Fatima Ahmed" />)
    expect(container.querySelector('.abaabil-avatar__initials')).toHaveTextContent('FA')
  })

  it('defaults alt to empty, which is right more often than not', () => {
    const { container } = render(<Avatar src="/a.png" name="Fatima Ahmed" />)
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('adds no ARIA attributes and no role at the normal tier', () => {
    const { container } = render(<Avatar name="Fatima Ahmed" />)
    const aria = [...container.querySelectorAll('*')].flatMap((el) =>
      [...el.attributes].map((a) => a.name).filter((n) => n.startsWith('aria-'))
    )
    expect(aria).toEqual([])
    expect(container.querySelector('[role]')).toBeNull()
  })
})

describe('Avatar (a11y tier)', () => {
  let warn
  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { warn.mockRestore() })

  it('is decorative by default: beside a visible name it says nothing new', () => {
    const { container } = render(<A11yAvatar src="/a.png" name="Fatima Ahmed" />)
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('hides the initials fallback outright when decorative', () => {
    const { container } = render(<A11yAvatar name="Fatima Ahmed" />)
    expect(container.querySelector('.abaabil-avatar__initials')).toHaveAttribute('aria-hidden', 'true')
  })

  it('names the image when it is the only thing identifying someone', () => {
    render(<A11yAvatar src="/a.png" name="Fatima Ahmed" decorative={false} />)
    expect(screen.getByRole('img', { name: 'Fatima Ahmed' })).toBeInTheDocument()
  })

  it('names the initials fallback with the person, never the letters', () => {
    render(<A11yAvatar name="Fatima Ahmed" decorative={false} />)
    const el = screen.getByRole('img', { name: 'Fatima Ahmed' })
    // "FA" read aloud is not a person, so the letters are hidden and
    // the name is carried by a role that can hold one.
    expect(el.querySelector('[aria-hidden="true"]')).toHaveTextContent('FA')
  })

  it('warns when it is meaningful but has no name to give', () => {
    render(<A11yAvatar decorative={false} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('abaabil/avatar'))
  })

  it('does not warn in the decorative default', () => {
    render(<A11yAvatar name="Fatima Ahmed" />)
    expect(warn).not.toHaveBeenCalled()
  })

  it('has no axe violations either way', async () => {
    const decorative = render(<A11yAvatar src="/a.png" name="Fatima Ahmed" />)
    expect(await axe(decorative.container)).toHaveNoViolations()
    const meaningful = render(<A11yAvatar name="Fatima Ahmed" decorative={false} />)
    expect(await axe(meaningful.container)).toHaveNoViolations()
  })
})
