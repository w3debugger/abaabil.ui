import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import Collapsible from '../src/collapsible/index.jsx'
import A11yCollapsible from '../src/collapsible/a11y.jsx'

describe('Collapsible (normal tier)', () => {
  it('renders a native details/summary pair', () => {
    const { container } = render(<Collapsible summary="More">Body</Collapsible>)
    const details = container.querySelector('details')
    expect(details).toBeInTheDocument()
    expect(details.firstChild.tagName).toBe('SUMMARY')
  })

  it('starts closed, and opens when told to', () => {
    const { container, rerender } = render(<Collapsible summary="More">Body</Collapsible>)
    expect(container.querySelector('details')).not.toHaveAttribute('open')
    rerender(<Collapsible summary="More" defaultOpen>Body</Collapsible>)
    expect(container.querySelector('details')).toHaveAttribute('open')
  })

  // The difference from accordion: no shared name, so nothing closes
  // anything else.
  it('sets no name, so two of them do not close each other', () => {
    const { container } = render(
      <>
        <Collapsible summary="One">A</Collapsible>
        <Collapsible summary="Two">B</Collapsible>
      </>
    )
    for (const d of container.querySelectorAll('details')) {
      expect(d).not.toHaveAttribute('name')
    }
  })

  it('toggles from the platform, with no JavaScript of its own', async () => {
    const { container } = render(<Collapsible summary="More">Body</Collapsible>)
    await userEvent.click(screen.getByText('More'))
    expect(container.querySelector('details')).toHaveAttribute('open')
  })
})

describe('Collapsible (a11y tier)', () => {
  // The finding is that there is nothing to add. <summary> already has
  // the role, the state and the keyboard behaviour; an author-supplied
  // aria-expanded competes with the browser's own rather than
  // reinforcing it.
  it('is the same component, adding no competing ARIA', () => {
    const { container } = render(<A11yCollapsible summary="More">Body</A11yCollapsible>)
    const summary = container.querySelector('summary')
    expect(summary).not.toHaveAttribute('aria-expanded')
    expect(summary).not.toHaveAttribute('role')
  })

  it('exposes its open state through the native attribute', () => {
    const { container } = render(
      <A11yCollapsible summary="More" defaultOpen>Body</A11yCollapsible>
    )
    expect(container.querySelector('details')).toHaveAttribute('open')
  })
})
