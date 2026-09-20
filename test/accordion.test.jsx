import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Disclosure, Accordion } from '../src/accordion/index.jsx'
import { Disclosure as StyledDisclosure, Accordion as StyledAccordion } from '../src/accordion/styled.jsx'
import { Disclosure as A11yDisclosure, Accordion_a11y } from '../src/accordion/a11y.jsx'

const items = [
  { key: 'a', summary: 'Section A', children: 'Panel A content' },
  { key: 'b', summary: 'Section B', children: 'Panel B content' },
  { key: 'c', summary: 'Section C', children: 'Panel C content' },
]

// Every attribute, on every element in a subtree, that is either an
// aria-* attribute or a `role` attribute.
const ariaAndRoleAttrs = (root) => {
  const found = []
  for (const el of root.querySelectorAll('*')) {
    for (const attr of el.attributes) {
      if (attr.name.startsWith('aria-') || attr.name === 'role') found.push(attr.name)
    }
  }
  return found
}

describe('Accordion (normal tier)', () => {
  it('renders zero ARIA attributes and zero role anywhere in the tree', () => {
    const { container } = render(<Accordion items={items} />)
    expect(ariaAndRoleAttrs(container)).toEqual([])
  })

  it('is really a <details>/<summary> pair, with <summary> as the first child of <details>', () => {
    render(<Disclosure summary="Title">Body</Disclosure>)
    const summary = screen.getByText('Title')
    expect(summary.tagName).toBe('SUMMARY')
    const details = summary.closest('details')
    expect(details.tagName).toBe('DETAILS')
    expect(details.firstElementChild).toBe(summary)
  })

  it('gives every Disclosure in an Accordion the same shared `name`, which is what makes native grouping exclusive', () => {
    const { container } = render(<Accordion items={items} />)
    const detailsEls = [...container.querySelectorAll('details')]
    expect(detailsEls).toHaveLength(3)
    const names = detailsEls.map((d) => d.getAttribute('name'))
    expect(names.every(Boolean)).toBe(true)
    expect(new Set(names).size).toBe(1)
  })

  // NOT COVERED: jsdom (as used by this project, jsdom ^25) does not
  // implement the browser behaviour where setting `open` on one
  // <details name="..."> closes its same-named siblings. Verified by hand:
  // programmatically setting `.open = true` on two same-named <details> in
  // a bare jsdom document leaves both open. So only the shared `name`
  // attribute above is asserted; the exclusive-open *behaviour* itself is
  // not exercised by this suite. Left as `it.skip` (not faked) so the
  // intent is visible and the assertions are ready if jsdom ever adds
  // support.
  it.skip('opening one panel closes its siblings (behaviour not testable under current jsdom)', async () => {
    const { container } = render(<Accordion items={items} />)
    const [first, second] = container.querySelectorAll('details')
    const user = userEvent.setup()
    await user.click(first.querySelector('summary'))
    expect(first.open).toBe(true)
    await user.click(second.querySelector('summary'))
    expect(second.open).toBe(true)
    expect(first.open).toBe(false)
  })

  it('sets no tabindex anywhere in the normal tier', () => {
    const { container } = render(<Accordion items={items} />)
    expect(container.querySelectorAll('[tabindex]')).toHaveLength(0)
  })
})

describe('Disclosure (normal tier, standalone)', () => {
  it('renders on its own, without an Accordion wrapper', () => {
    render(<Disclosure summary="Solo">Solo content</Disclosure>)
    const summary = screen.getByText('Solo')
    expect(summary.tagName).toBe('SUMMARY')
    const details = summary.closest('details')
    expect(details).not.toBeNull()
    expect(details).not.toHaveAttribute('name')
    expect(screen.getByText('Solo content')).toBeInTheDocument()
  })

  it('sets no tabindex when used standalone', () => {
    const { container } = render(<Disclosure summary="Solo">Solo content</Disclosure>)
    expect(container.querySelectorAll('[tabindex]')).toHaveLength(0)
  })
})

describe('Accordion / Disclosure (styled tier)', () => {
  it('re-exports the same component contract as the normal tier', () => {
    const { container } = render(<StyledAccordion items={items} />)
    const detailsEls = container.querySelectorAll('details')
    expect(detailsEls).toHaveLength(3)
    expect(ariaAndRoleAttrs(container)).toEqual([])
  })

  it('StyledDisclosure renders standalone too', () => {
    render(<StyledDisclosure summary="Solo">Solo content</StyledDisclosure>)
    expect(screen.getByText('Solo').tagName).toBe('SUMMARY')
  })
})

describe('Disclosure (a11y tier)', () => {
  it('renders standalone with no ARIA added, since a lone disclosure has no group to name', () => {
    const { container } = render(<A11yDisclosure summary="Solo">Solo content</A11yDisclosure>)
    expect(ariaAndRoleAttrs(container)).toEqual([])
  })
})

describe('Accordion_a11y (a11y tier)', () => {
  it('applies role="group" and aria-label to the wrapper when `label` is given', () => {
    const { container } = render(<Accordion_a11y items={items} label="FAQ" />)
    const group = container.querySelector('.abaabil-accordion-group')
    expect(group).toHaveAttribute('role', 'group')
    expect(group).toHaveAttribute('aria-label', 'FAQ')
  })

  it('omits role and aria-label entirely when `label` is not given, rather than emitting them empty', () => {
    const { container } = render(<Accordion_a11y items={items} />)
    const group = container.querySelector('.abaabil-accordion-group')
    expect(group).not.toHaveAttribute('role')
    expect(group).not.toHaveAttribute('aria-label')
  })

  it('sets no tabindex anywhere, since <summary> is natively focusable', () => {
    const { container } = render(<Accordion_a11y items={items} label="FAQ" />)
    expect(container.querySelectorAll('[tabindex]')).toHaveLength(0)
  })

  it('has no axe violations while every panel is closed', async () => {
    const { container } = render(<Accordion_a11y items={items} label="FAQ" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations once a panel is opened', async () => {
    const { container } = render(<Accordion_a11y items={items} label="FAQ" />)
    const user = userEvent.setup()
    await user.click(screen.getByText('Section A'))
    expect(screen.getByText('Section A').closest('details').open).toBe(true)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('emits no heading element: headingLevel is deliberately not offered', () => {
    const { container } = render(<Accordion_a11y items={items} label="FAQ" />)
    expect(container.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]')).toHaveLength(0)
  })
})
