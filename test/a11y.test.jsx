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
import Progress from '../src/progress/a11y.jsx'
import Slider from '../src/slider/a11y.jsx'
import Breadcrumb from '../src/breadcrumb/a11y.jsx'
import TooltipControl from '../src/tooltip/a11y.jsx'
import MenuControl from '../src/menu/a11y.jsx'
import Pagination from '../src/pagination/a11y.jsx'
import FileField from '../src/file/a11y.jsx'
import ToolbarControl from '../src/toolbar/a11y.jsx'
import AvatarControl from '../src/avatar/a11y.jsx'
import BadgeControl from '../src/badge/a11y.jsx'
import AlertDialog from '../src/alert-dialog/a11y.jsx'
import Card from '../src/card/a11y.jsx'
import Collapsible from '../src/collapsible/a11y.jsx'
import Drawer from '../src/drawer/a11y.jsx'
import SeparatorControl from '../src/separator/a11y.jsx'
import SkeletonControl from '../src/skeleton/a11y.jsx'
import SpinnerControl from '../src/spinner/a11y.jsx'
import { Toast, ToastRegion, ToastLive } from '../src/toast/a11y.jsx'
import { Toggle, ToggleGroup } from '../src/toggle/a11y.jsx'

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

  it('progress: no violations with a label and a value text', async () => {
    const { container } = render(
      <Progress label="Uploading" description="Large files take longer." value={3} max={8} valueText="3 of 8 files" />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('slider: no violations with a formatted value on show', async () => {
    const { container } = render(
      <Slider label="Budget" description="Per month." defaultValue={50} showValue formatValue={(v) => `$${v}`} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('breadcrumb: no violations for a trail ending on the current page', async () => {
    const { container } = render(
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Docs', href: '/docs' }, { label: 'Breadcrumb' }]} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('tooltip: no violations describing a real trigger', async () => {
    const { container } = render(
      <TooltipControl content="Saves to your account">
        <button type="button">Save</button>
      </TooltipControl>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('menu: no violations for the menu button pattern', async () => {
    // jsdom has no Popover API, so axe sees the panel rendered but never
    // opened. The roles and the trigger wiring are what matter here.
    const { container } = render(
      <MenuControl
        id="axe-menu"
        trigger="Actions"
        label="File actions"
        items={[{ label: 'Duplicate' }, { label: 'Delete' }]}
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('pagination: no violations mid-range, with gaps on both sides', async () => {
    const { container } = render(
      <Pagination page={10} pageCount={20} href={(p) => `?page=${p}`} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('file: no violations while showing an error', async () => {
    const { container } = render(
      <FileField label="Attachment" description="PDF or PNG, under 5 MB." error="Too large." accept=".pdf,.png" />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('toolbar: no violations with a mixed set of controls', async () => {
    const { container } = render(
      <ToolbarControl label="Formatting">
        <button type="button">Bold</button>
        <button type="button">Italic</button>
        <hr />
        <button type="button" disabled>Strike</button>
      </ToolbarControl>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('avatar: no violations decorative or meaningful', async () => {
    const dec = render(<AvatarControl name="Fatima Ahmed" />)
    expect(await axe(dec.container)).toHaveNoViolations()
    const meaningful = render(<AvatarControl name="Fatima Ahmed" decorative={false} />)
    expect(await axe(meaningful.container)).toHaveNoViolations()
  })

  it('badge: no violations with hidden context text', async () => {
    const { container } = render(
      <BadgeControl variant="danger" context="unread messages">3</BadgeControl>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('separator: no violations as a vertical rule', async () => {
    const { container } = render(
      <div style={{ display: 'flex' }}>
        <span>Drafts</span>
        <SeparatorControl orientation="vertical" />
        <span>Sent</span>
      </div>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('spinner: no violations with its status label', async () => {
    const { container } = render(<SpinnerControl label="Loading results" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('skeleton: no violations for a labelled block of lines', async () => {
    const { container } = render(<SkeletonControl lines={3} label="Loading messages" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('card: no violations as a named region', async () => {
    const { container } = render(
      <Card heading="Billing" headingLevel={2} footer={<button type="button">Manage</button>}>
        <p>Your plan renews on the first of the month.</p>
      </Card>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('collapsible: no violations when open', async () => {
    const { container } = render(
      <Collapsible summary="Shipping details" defaultOpen>
        <p>Delivered within three working days.</p>
      </Collapsible>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('toggle: no violations pressed and icon-only', async () => {
    const { container } = render(
      <Toggle pressed label="Bold">
        <svg aria-hidden="true" />
      </Toggle>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('toggle group: no violations as a named single-select set', async () => {
    const { container } = render(
      <ToggleGroup
        name="align"
        label="Text alignment"
        defaultValue="left"
        items={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Centre' },
          { value: 'right', label: 'Right' },
        ]}
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('drawer: no violations while open', async () => {
    const { container } = render(
      <Drawer open label="Filters">
        <p>Narrow the results below.</p>
        <button type="button">Apply</button>
      </Drawer>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('alert dialog: no violations while open', async () => {
    const { container } = render(
      <AlertDialog
        open
        label="Delete this project?"
        description="Everything in it is removed permanently. This cannot be undone."
      >
        <button type="button" data-safe-action>Cancel</button>
        <button type="button">Delete</button>
      </AlertDialog>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('toast: no violations in its live region', async () => {
    const { container } = render(
      <ToastRegion>
        <ToastLive
          polite={
            <Toast variant="success" duration={null} onDismiss={() => {}}>
              Message sent
            </Toast>
          }
          assertive={null}
        />
      </ToastRegion>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
