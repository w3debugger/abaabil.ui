import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { axe } from 'jest-axe'

import Button from '../src/button/a11y.jsx'
import Dialog from '../src/dialog/a11y.jsx'
import Combobox from '../src/combobox/a11y.jsx'
import Input from '../src/input/a11y.jsx'
import Checkbox, { CheckboxGroup } from '../src/checkbox/a11y.jsx'
import Radio, { RadioGroup } from '../src/radio/a11y.jsx'
import Select from '../src/select/a11y.jsx'
import { Accordion_a11y } from '../src/accordion/a11y.jsx'
import Textarea from '../src/textarea/a11y.jsx'
import SwitchControl from '../src/switch/a11y.jsx'
import Popover from '../src/popover/a11y.jsx'
import Tabs from '../src/tabs/a11y.jsx'
import Alert from '../src/alert/a11y.jsx'

const LANGUAGES = [
  { value: 'ar', label: 'Arabic' },
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'Urdu' },
]

// Cross-component axe sweep, one meaningful (non-empty) state per component
// at the a11y tier, not just a bare render.
describe('Cross-component axe sweep (a11y tier)', () => {
  it('button: no violations', async () => {
    const { container } = render(<Button leftIcon={<svg aria-hidden="true" />}>Save</Button>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('dialog: no violations while open', async () => {
    const { container } = render(
      <Dialog open label="Settings">
        <p>Update your account settings below.</p>
        <button type="button">Close</button>
      </Dialog>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('combobox: no violations while open with options', async () => {
    const { container } = render(<Combobox options={LANGUAGES} label="Language" />)
    await userEvent.click(screen.getByRole('combobox'))
    expect(await axe(container)).toHaveNoViolations()
  })

  it('input: no violations while showing an error', async () => {
    const { container } = render(
      <Input
        label="Email"
        description="We will not share it."
        error="Enter a valid email address."
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('checkbox: no violations for a labelled group', async () => {
    const { container } = render(
      <CheckboxGroup label="Notifications">
        <Checkbox label="Email me" defaultChecked />
        <Checkbox label="Text me" description="Standard rates may apply." />
      </CheckboxGroup>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('radio: no violations for a group with several options', async () => {
    const { container } = render(
      <RadioGroup label="Preferred language">
        <Radio label="Arabic" value="ar" defaultChecked />
        <Radio label="English" value="en" />
        <Radio label="Urdu" value="ur" />
      </RadioGroup>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('select: no violations while showing an error', async () => {
    const { container } = render(
      <Select
        label="Language"
        options={LANGUAGES}
        description="Pick one."
        error="This field is required."
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('accordion: no violations with items, one expanded', async () => {
    const items = [
      { key: 'shipping', summary: 'Shipping', children: 'Ships in 3-5 business days.' },
      { key: 'returns', summary: 'Returns', children: 'Returns accepted within 30 days.' },
    ]
    const { container } = render(<Accordion_a11y label="FAQ" items={items} />)
    // Toggle the native <details> directly: reliable regardless of jsdom's
    // click-to-toggle support, and it is the same observable open state.
    container.querySelector('details').open = true
    expect(await axe(container)).toHaveNoViolations()
  })

  it('textarea: no violations while showing an error', async () => {
    const { container } = render(
      <Textarea label="Bio" description="Max 200 characters." error="Too short." />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('switch: no violations with a label and description', async () => {
    const { container } = render(
      <SwitchControl label="Email notifications" description="Only for replies to you." />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('popover: no violations with a named panel', async () => {
    // jsdom has no Popover API, so the panel is inert here and axe sees it
    // in its closed-but-rendered state. That is still the state worth
    // checking: it is where the name and the button wiring live.
    const { container } = render(
      <Popover id="display-options" trigger="Options" label="Display options">
        <p>Choose how results are shown.</p>
      </Popover>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('tabs: no violations, and still none after moving to another tab', async () => {
    const items = [
      { key: 'a', label: 'Overview', children: <p>Overview panel.</p> },
      { key: 'b', label: 'Pricing', children: <p>Pricing panel.</p> },
    ]
    const { container } = render(<Tabs items={items} label="Product" />)
    expect(await axe(container)).toHaveNoViolations()
    await userEvent.click(screen.getByRole('tab', { name: 'Pricing' }))
    expect(await axe(container)).toHaveNoViolations()
  })

  it('alert: no violations for the interrupting variant', async () => {
    const { container } = render(
      <Alert variant="danger" title="Could not save">Check your connection.</Alert>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
