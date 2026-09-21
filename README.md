# abaabil

Minimal, themeable, accessible React components. Zero dependencies.

Twenty-three components: button, dialog, popover, menu, tooltip, combobox, input, textarea, file, checkbox, radio, switch, select, slider, accordion, tabs, toolbar, breadcrumb, pagination, progress, alert, avatar, badge.

```js
import Button from 'abaabil/button/a11y'
import 'abaabil/theme.css'

function Example() {
  return <Button onClick={() => console.log('clicked')}>Save</Button>
}
```

Each component ships three tiers, `normal`, `styled`, `a11y`, so you only pay for what you use. Two facts worth knowing up front:

- A fully accessible `dialog/a11y` is **580 B gzipped**, against `@radix-ui/react-dialog` at **13,493 B**. Both are measured the same way: a dialog you can actually open, imported with every part it needs, bundled with esbuild, `react`/`react-dom` external, minified, then gzipped. Both numbers are JS only; Radix ships no stylesheet of its own, and it also bundles its own positioning and portal logic and predates a usable native `<dialog>`, so it isn't attempting exactly what abaabil does. The difference is mostly what the platform now gives you for free, not a claim of doing more with less.

  Earlier releases of this README compared 674 B against Radix at 3,422 B. That Radix figure was wrong: it was what you get importing only `Dialog.Root`, which renders nothing. The corrected comparison is less favourable to Radix, not more, which is why it is stated here rather than quietly changed.
- `accordion/a11y` needs **no JavaScript at all**. Every tier of accordion, including `a11y`, is server-renderable, because it's built on native `<details>`/`<summary>` rather than a scripted widget.

## Install

```
npm install abaabil
```

`react` and `react-dom` are peer dependencies (`^19.0.0`); abaabil has zero runtime dependencies of its own.

## The three tiers

Every component ships as three separate entry points so you only pay for what you use. For most components, each tier builds on the one before it: `styled` adds abaabil's CSS on top of `normal`, and `a11y` adds ARIA wiring and keyboard handling on top of `styled`.

Combobox is the exception: its `a11y` tier is an independent implementation that imports `combobox.css` directly, rather than building on `styled`, because its ARIA attributes have to sit on specific elements (the input and the listbox) that the `styled`/`normal` markup does not expose as separate parts.

### Delivered size

The gzipped cost of importing each entry point on its own, React treated as external (a peer, not bundled):

| Entry | JS | CSS |
|---|---:|---:|
| `abaabil/button` | 199 B | - |
| `abaabil/button/styled` | 198 B | 551 B |
| `abaabil/button/a11y` | 557 B | 551 B |
| `abaabil/dialog` | 168 B | - |
| `abaabil/dialog/styled` | 169 B | 371 B |
| `abaabil/dialog/a11y` | 580 B | 371 B |
| `abaabil/combobox` | 455 B | - |
| `abaabil/combobox/styled` | 455 B | 615 B |
| `abaabil/combobox/a11y` | 1,097 B | 615 B |
| `abaabil/input` | 166 B | - |
| `abaabil/input/styled` | 166 B | 497 B |
| `abaabil/input/a11y` | 501 B | 497 B |
| `abaabil/checkbox` | 168 B | - |
| `abaabil/checkbox/styled` | 168 B | 651 B |
| `abaabil/checkbox/a11y` | 534 B | 651 B |
| `abaabil/radio` | 165 B | - |
| `abaabil/radio/styled` | 166 B | 542 B |
| `abaabil/radio/a11y` | 444 B | 542 B |
| `abaabil/select` | 209 B | - |
| `abaabil/select/styled` | 210 B | 771 B |
| `abaabil/select/a11y` | 530 B | 771 B |
| `abaabil/accordion` | 320 B | - |
| `abaabil/accordion/styled` | 320 B | 528 B |
| `abaabil/accordion/a11y` | 364 B | 528 B |
| `abaabil/textarea` | 166 B | - |
| `abaabil/textarea/styled` | 166 B | 476 B |
| `abaabil/textarea/a11y` | 506 B | 476 B |
| `abaabil/switch` | 177 B | - |
| `abaabil/switch/styled` | 177 B | 585 B |
| `abaabil/switch/a11y` | 423 B | 585 B |
| `abaabil/popover` | 387 B | - |
| `abaabil/popover/styled` | 388 B | 436 B |
| `abaabil/popover/a11y` | 484 B | 436 B |
| `abaabil/tabs` | 349 B | - |
| `abaabil/tabs/styled` | 349 B | 529 B |
| `abaabil/tabs/a11y` | 786 B | 529 B |
| `abaabil/alert` | 190 B | - |
| `abaabil/alert/styled` | 190 B | 345 B |
| `abaabil/alert/a11y` | 341 B | 345 B |

Measured against `abaabil@1.2.0`. Each entry point is bundled on its own with its full module graph (so `button/styled`'s cost already includes the `button` markup it imports) using esbuild, `react`/`react-dom` external, minified, then gzipped. The `styled` and `a11y` tiers also pull in their component's stylesheet as a side-effect import; the CSS column is that stylesheet's own gzipped size, separate from the JS number. `normal` tier entries have no CSS column because they import none.

A `styled` entry sometimes measures a byte or two *below* its `normal` entry. That is compression noise, not a real difference: `styled` is `normal` plus a CSS side-effect import, so its JavaScript is the same code, and a byte of difference either way is gzip responding to a different module path. The CSS column is where the `styled` tier's actual cost is.

This is different from the per-file numbers in `SIZES.md`, which are produced with `preserveModules` and so under-count any tier that imports another module: `styled.js` there shows only the bytes of its own file, not the `index.js` it re-exports.

These figures are generated, not typed. The script lives in the docs site repo at `scripts/compare/delivered.mjs`, alongside the harness that measures abaabil against nine other libraries with one shared method. Earlier releases of this table were copied by hand and went stale: the 1.1.0 package shipped with 1.0.0's numbers still printed here, some of them out by more than 10%.

Import the tier you need directly:

```js
import Button from 'abaabil/button/a11y'
import Dialog from 'abaabil/dialog/a11y'
import Combobox from 'abaabil/combobox/a11y'
import Input from 'abaabil/input/a11y'
import Checkbox from 'abaabil/checkbox/a11y'
import Radio from 'abaabil/radio/a11y'
import Select from 'abaabil/select/a11y'
import Accordion from 'abaabil/accordion/a11y'
```

### Bundler required for `styled` and `a11y` tiers

The `styled` and `a11y` entry points (all forty-six across the twenty-three components) import their
component's CSS as a JS side effect (`import 'abaabil/button/button.css'` style, resolved
relative to the package). That works in any bundler that understands CSS imports, which
covers Next.js, Vite, and webpack. It does **not** work if you run the built file directly in
plain Node with no bundler in front of it (for example `node --input-type=module -e "import(...)"`):
Node has no loader for `.css` and throws `ERR_UNKNOWN_FILE_EXTENSION`.

If you need a bundler-free environment, use the `normal` tier and import the component's
stylesheet yourself, which is why each component's CSS is exported separately:

```js
import Button from 'abaabil/button'
import 'abaabil/button.css'
```

The `normal` tier (`abaabil/button`, `abaabil/dialog`, `abaabil/combobox`, `abaabil/input`,
`abaabil/checkbox`, `abaabil/radio`, `abaabil/select`, `abaabil/accordion`) never imports CSS and
loads cleanly with no bundler.

### Why a `normal`-tier component can still look styled

The `normal` tier ships no CSS, but shipping no CSS is not the same as rendering unstyled. All
three tiers of a component render the same class name (for example `abaabil-button`), and
`button.css` styles that class globally, not per tier. So if anything in your app imports the
`styled` or `a11y` tier of a component, every `normal`-tier instance of that same component on
the page picks up those styles too, purely because the stylesheet got loaded somewhere:

```js
import Button from 'abaabil/button'          // no CSS import
import ButtonA11y from 'abaabil/button/a11y' // imports button.css

// Both render class="abaabil-button". Once button.css is loaded anywhere
// on the page, both are styled, because the rule targets the class, not
// the import site.
```

If you chose `normal` in order to style the component yourself, this works in your favor: the
library's own rules live in `@layer abaabil.components`, and ordinary unlayered CSS always beats
a layered rule, so your styles win with no `!important` needed.

To get a genuinely unstyled component, import only its `normal` tier and make sure nothing else
in your app imports that component's stylesheet (directly or through its `styled`/`a11y` tier).

## Theming

abaabil ships design tokens in `abaabil/theme.css`. Override the CSS custom properties in your own stylesheet to retheme every component:

```css
@import 'abaabil/theme.css';
@import 'abaabil/styles.css';

:root {
  --color-primary: #7c3aed;
  --radius-md: 0.75rem;
}
```

abaabil's own component rules live inside `@layer abaabil.components`. CSS layers give unlayered rules the higher priority by default, so any selector you write in your normal (unlayered) application CSS beats the library's layered styles automatically, with no `!important` needed:

```css
/* this wins over abaabil's layered .btn rules, with no !important */
.btn {
  border-radius: 999px;
}
```

## Server Components

Only the entry points that need interactivity are marked `"use client"`. The rest render inside a React Server Component tree as plain server components, shipping zero client JS:

| Entry point | `"use client"` |
|---|---|
| `abaabil/button` | no |
| `abaabil/button/styled` | no |
| `abaabil/button/a11y` | no |
| `abaabil/dialog` | no |
| `abaabil/dialog/styled` | no |
| `abaabil/dialog/a11y` | yes |
| `abaabil/combobox` | yes |
| `abaabil/combobox/styled` | yes (see note) |
| `abaabil/combobox/a11y` | yes |
| `abaabil/input` | no |
| `abaabil/input/styled` | no |
| `abaabil/input/a11y` | yes |
| `abaabil/checkbox` | no |
| `abaabil/checkbox/styled` | no |
| `abaabil/checkbox/a11y` | yes |
| `abaabil/radio` | no |
| `abaabil/radio/styled` | no |
| `abaabil/radio/a11y` | yes |
| `abaabil/select` | no |
| `abaabil/select/styled` | no |
| `abaabil/select/a11y` | yes |
| `abaabil/accordion` | no |
| `abaabil/accordion/styled` | no |
| `abaabil/accordion/a11y` | no |
| `abaabil/textarea` | no |
| `abaabil/textarea/styled` | no |
| `abaabil/textarea/a11y` | yes |
| `abaabil/switch` | no |
| `abaabil/switch/styled` | no |
| `abaabil/switch/a11y` | yes |
| `abaabil/popover` | no |
| `abaabil/popover/styled` | no |
| `abaabil/popover/a11y` | no |
| `abaabil/tabs` | yes |
| `abaabil/tabs/styled` | yes (see note) |
| `abaabil/tabs/a11y` | yes |
| `abaabil/alert` | no |
| `abaabil/alert/styled` | no |
| `abaabil/alert/a11y` | no |
| `abaabil/progress` | no |
| `abaabil/progress/styled` | no |
| `abaabil/progress/a11y` | yes |
| `abaabil/slider` | no |
| `abaabil/slider/styled` | no |
| `abaabil/slider/a11y` | yes |
| `abaabil/breadcrumb` | no |
| `abaabil/breadcrumb/styled` | no |
| `abaabil/breadcrumb/a11y` | no |
| `abaabil/tooltip` | no |
| `abaabil/tooltip/styled` | no |
| `abaabil/tooltip/a11y` | yes |
| `abaabil/menu` | no |
| `abaabil/menu/styled` | no |
| `abaabil/menu/a11y` | yes |
| `abaabil/pagination` | no |
| `abaabil/pagination/styled` | no |
| `abaabil/pagination/a11y` | no |
| `abaabil/file` | no |
| `abaabil/file/styled` | no |
| `abaabil/file/a11y` | yes |
| `abaabil/toolbar` | no |
| `abaabil/toolbar/styled` | no |
| `abaabil/toolbar/a11y` | yes |
| `abaabil/avatar` | no |
| `abaabil/avatar/styled` | no |
| `abaabil/avatar/a11y` | no |
| `abaabil/badge` | no |
| `abaabil/badge/styled` | no |
| `abaabil/badge/a11y` | no |

Fifty-one of the sixty-nine entry points carry no client directive and render from a Server Component with zero client JS.

Nine components are server-renderable at **every** tier, `a11y` included, because they need no JavaScript at all:

- **button**, which attaches handlers only when you actually pass one (see the note at the end of this section).
- **accordion**, where exclusive open/close comes from the native `name` attribute on `<details>`.
- **popover**, where the trigger, the top layer, light-dismiss and Escape all come from the native Popover API.
- **alert**, which is a live region and a border.
- **breadcrumb** and **pagination**, which are a `<nav>` and an ordered list.
- **avatar** and **badge**, which are markup and CSS.
- **progress** and **slider** at `normal` and `styled`; their `a11y` tiers need `useId`.

**tooltip** is the interesting case: it shows and hides on `:hover` and `:focus-within`, which are selectors, so its `normal` and `styled` tiers need no JavaScript to work at all. Only the tier that adds `aria-describedby` and Escape is a client component.

Two components are client modules at every tier, because neither has a native element to build on and both need state to show one thing at a time: **combobox** and **tabs**.

The rest (dialog, input, textarea, checkbox, radio, switch, select) are server-renderable at `normal` and `styled`, and client at `a11y`, where `useId` mints the ids that wire labels and descriptions together.

`abaabil/combobox/styled` and `abaabil/tabs/styled` have no literal `"use client"` directive of their own; they only re-export their `normal` tier, which does carry one, so the client boundary is already established there and the directive isn't duplicated. They still behave as client modules once bundled, which is why they're marked "yes" above.

This split is enforced at build time by `scripts/check-directives.js`, which runs as part of `npm run build` and fails the build in both directions: a required `"use client"` that got stripped, or an accidental one on a component that's supposed to stay server-only. That gate is checked against the built output, not just the source, so this table can't silently drift from what actually ships.

`button/a11y` has no hooks and stays server-renderable even though it wires up click suppression and Space/Enter activation: it only attaches `onClick`/`onKeyDown` to the underlying element when they are actually needed (you passed a handler yourself, or the case requires suppressing a click: `disabled` with `keepFocusable`, or a disabled link-button). A plain `<Button>Save</Button>` with no handlers and no `disabled` renders with no function props at all, which is what keeps it serializable from a server module. Since passing your own `onClick` already puts you in a client component, this never puts a function prop where the flight serializer would reject it.

## Props

Prop tables below cover the props each tier adds on top of standard HTML attributes (`className`, `id`, `aria-*`, event handlers, etc., which all pass through). "Default" is the value used when the prop is omitted.

### Button

`normal` and `styled` (`abaabil/button`, `abaabil/button/styled`):

| Prop | Type | Default | Description |
|---|---|---|---|
| `as` | `string \| Component` | `'button'` | Element or component to render. |
| `type` | `string` | `'button'` (only when `as` renders a `<button>`) | Native button type. |
| `className` | `string` | — | Merged with the base class. |

`a11y` (`abaabil/button/a11y`), in addition to the above:

| Prop | Type | Default | Description |
|---|---|---|---|
| `disabled` | `boolean` | `false` | Disables the button. On a non-`button` `as`, sets `aria-disabled` and removes it from the tab order instead (elements like `<a>` have no native disabled state). |
| `keepFocusable` | `boolean` | `false` | Use `aria-disabled` instead of the native `disabled` attribute, so the button stays focusable and screen reader users can still find it. Clicks are still suppressed. |
| `leftIcon` | `ReactNode` | — | Rendered before the children, marked `aria-hidden`. Warns in dev if the button has no accessible name. |
| `rightIcon` | `ReactNode` | — | Rendered after the children, marked `aria-hidden`. Same accessible-name warning as `leftIcon`. |

### Dialog

`normal`/`styled` (`abaabil/dialog`, `abaabil/dialog/styled`) render a plain `<dialog>` and accept no props beyond standard HTML attributes; you drive `showModal()`/`close()` yourself through a `ref`.

`a11y` (`abaabil/dialog/a11y`):

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | `false` | Calls `showModal()`/`close()` on the underlying `<dialog>` as it changes. |
| `onClose` | `() => void` | — | Called when the dialog closes, whether via `open` becoming `false`, Escape, or a backdrop click. |
| `label` | `string` | — | Accessible name, rendered as the dialog's heading and wired to `aria-labelledby`. The platform supplies no name on its own; omitting this warns in dev. |

### Combobox

Uncontrolled at every tier: there is no `value` prop, the input manages its own text, and you observe the selection through `onChange`.

`normal` (`abaabil/combobox`, `abaabil/combobox/styled`):

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `Array<{ value: string, label: string }>` | `[]` | The full option list; filtered client-side against the typed text. |
| `placeholder` | `string` | — | Passed to the input. |
| `onChange` | `(value: string) => void` | — | Called with the selected option's `value` when an option is chosen. |
| `className` | `string` | — | Merged with the wrapper's base class. |

`a11y` (`abaabil/combobox/a11y`), in addition to the above:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Accessible name for the input, wired to `aria-labelledby`. Required for the combobox to have a usable accessible name; omitting it warns in dev. |
| `hideLabel` | `boolean` | `false` | Visually hides the label (it is always present in the accessibility tree). Set to `true` to visually hide it. |
| `onChange` | `(value: string \| null) => void` | — | Called with the selected option's `value`, or `null` when the query is cleared via Escape. |

### Input

`normal` and `styled` (`abaabil/input`, `abaabil/input/styled`):

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `string` | `'text'` | Native input type. |
| `className` | `string` | - | Merged with the base class. |

`a11y` (`abaabil/input/a11y`), in addition to the above:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Rendered as a real `<label>`, associated with the input via `htmlFor`/`id`. |
| `hideLabel` | `boolean` | `false` | Visually hides the label (it is always present in the accessibility tree, still a real `<label>` associated via `htmlFor`/`id`). Set to `true` to visually hide it. Matches combobox's `hideLabel` semantics and default. |
| `description` | `string` | - | Rendered as help text and wired into `aria-describedby`. |
| `error` | `string` | - | Rendered as an error message, sets `aria-invalid`, and is wired into `aria-describedby` alongside the description. |
| `required` | `boolean` | `false` | Passed to the underlying input. |
| `id` | `string` | - | Overrides the generated input id. |

This is the tier that carries `input`'s reason for existing: a real associated `<label>` (not just `aria-label`), `description` and `error` both joined into a single `aria-describedby`, and `aria-invalid` set when `error` is present. If you pass your own `aria-describedby`, it's merged with the generated description/error ids, not discarded. Without a `label` (and no `aria-label`/`aria-labelledby`), the input has no accessible name and this tier warns in dev.

### Checkbox

`normal` and `styled` (`abaabil/checkbox`, `abaabil/checkbox/styled`):

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | - | Merged with the base class. |

`a11y` (`abaabil/checkbox/a11y`), in addition to the above:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Accessible name, rendered as a real `<label>`. The platform supplies none on its own; omitting it warns in dev. |
| `description` | `string` | - | Rendered text, wired into `aria-describedby`. |
| `indeterminate` | `boolean` | `false` | Puts the checkbox in a mixed state. `indeterminate` is a DOM property, not an HTML attribute, so it cannot be set through JSX at all; this tier applies it to the underlying input via a ref and an effect, and mirrors it to `aria-checked="mixed"` so it's also exposed correctly to assistive tech. |
| `id` | `string` | - | Overrides the generated input id. |

A consumer-supplied `ref` composes with the ref this tier uses internally for `indeterminate`, so passing your own doesn't silently break it.

`CheckboxGroup` (`abaabil/checkbox/a11y` only; there is no `normal`/`styled` version) renders a `<fieldset>`/`<legend>` pair, the accessible way to group checkboxes under a shared label:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Group label, rendered as the `<legend>`. |
| `className` | `string` | - | Merged with the group wrapper's base class. |

### Radio

`normal` and `styled` (`abaabil/radio`, `abaabil/radio/styled`):

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | - | Merged with the base class. |

`a11y` (`abaabil/radio/a11y`), in addition to the above:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Accessible name, rendered as a real `<label>`. Omitting it warns in dev. |
| `description` | `string` | - | Rendered text, wired into `aria-describedby`. |
| `name` | `string` | inherited from `RadioGroup` | Overrides the shared name a `RadioGroup` ancestor supplies through context. |
| `id` | `string` | - | Overrides the generated input id. |

`RadioGroup` shares one `name` with every descendant `Radio` through context, which is what makes them one native group rather than several independent radios. This matters because nothing visible tells you when it's broken: radios that don't share a `name` render fine, but arrow-key navigation and single-selection both key off that shared attribute, so an ungrouped set silently allows multiple radios to appear selected at once.

`RadioGroup` (`abaabil/radio/a11y` only) renders a `<fieldset>`/`<legend>` pair and supplies that shared `name`, generating one via `useId` if you don't pass one:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Group label, rendered as the `<legend>`. |
| `name` | `string` | generated via `useId` | Shared name for every radio in the group. |
| `className` | `string` | - | Merged with the group wrapper's base class. |

### Select

`normal` and `styled` (`abaabil/select`, `abaabil/select/styled`) render a real native `<select>`, styled, not a custom listbox:

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `Array<{ value: string, label: string }>` | - | Rendered as `<option>` elements. Only consulted when given; pass `children` instead for `<optgroup>` or hand-written `<option>` markup, since the two never fight over which one renders. |
| `className` | `string` | - | Merged with the base class. |

`a11y` (`abaabil/select/a11y`), in addition to the above:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Accessible name, rendered as a real `<label>`. |
| `hideLabel` | `boolean` | `false` | Visually hides the label (it is always present in the accessibility tree, still a real `<label>` associated via `htmlFor`/`id`). Set to `true` to visually hide it. Matches combobox's `hideLabel` semantics and default. |
| `description` | `string` | - | Rendered and wired into `aria-describedby`. |
| `error` | `string` | - | Rendered, sets `aria-invalid`, and is joined into `aria-describedby` alongside the description. |
| `id` | `string` | - | Overrides the generated select id. |

CSS customizable select (`appearance: base-select`) was deliberately not used to build this. It is not Baseline: support is Chrome 135 only, with no Firefox support at all, far above this library's Chrome 116 / Firefox 125 / Safari 17 floor.

### Accordion

Accordion is the only component whose every tier, including `a11y`, is server-renderable: no `"use client"`, no hooks, no JavaScript. Exclusive open/close (opening one panel closes its siblings) comes entirely from the native `name` attribute on `<details>`.

`Disclosure` (`abaabil/accordion`, `abaabil/accordion/styled`), a single native `<details>`/`<summary>` pair:

| Prop | Type | Default | Description |
|---|---|---|---|
| `summary` | `ReactNode` | - | Content for the `<summary>` element. |
| `className` | `string` | - | Merged with the base class. |
| `summaryClassName` | `string` | - | Merged with the summary's base class. |

`Accordion` (`abaabil/accordion`, `abaabil/accordion/styled`), a list of `Disclosure`s that share a `name`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<{ key?, summary, children? }>` | - | One entry per disclosure. |
| `name` | `string` | `'abaabil-accordion'` | Shared native group name. Pass `name={undefined}` explicitly to opt out of exclusive behavior. |
| `className` | `string` | - | Merged onto the wrapping element. |

`a11y` (`abaabil/accordion/a11y`): `Disclosure` is re-exported unchanged, since `<summary>` already carries the correct implicit role and expanded/collapsed state and there's nothing this tier can add to a single disclosure. `Accordion_a11y`, in addition to `Accordion`'s props above:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Accessible name for the group as a whole. When given, applies `role="group"` and `aria-label` to the wrapper. Left unset by default: an unnamed group announces to screen readers as "group" with no name, which is worse than not grouping at all, and each panel's own summary text already names it. |

**Deliberate limitation:** `Accordion_a11y` offers no `headingLevel` prop, and this is intentional, not an oversight. `<summary>` has an implicit ARIA role of `button` in some browsers, and a heading nested inside a button is not reliably exposed to assistive technology (VoiceOver, for one, does not expose a heading nested inside `<summary>` as a heading). The reverse, wrapping `<summary>` in a heading element, isn't an option either: `<summary>` must be the literal first child of `<details>` for the browser to recognize it as the disclosure trigger. Consumers who need reliable heading navigation across sections need the button-in-heading accordion pattern instead (an explicit heading wrapping a button, with `aria-expanded` and `aria-controls`), a different, ARIA-driven widget that this component does not attempt to be.

### Textarea

`normal` / `styled` (`abaabil/textarea`, `abaabil/textarea/styled`):

| Prop | Type | Default | Description |
|---|---|---|---|
| `rows` | `number` | `3` | Visible line count. The browser default of 2 is too short to read back what you typed. |
| `className` | `string` | - | Merged with the base class. |

`a11y` (`abaabil/textarea/a11y`), the same wiring as Input on a `<textarea>`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Rendered as a real `<label>`, associated via `htmlFor`/`id`. |
| `hideLabel` | `boolean` | `false` | Hide the label visually. It stays in the accessibility tree. |
| `description` | `string` | - | Help text, wired into `aria-describedby`. |
| `error` | `string` | - | Error message. Sets `aria-invalid` and joins `aria-describedby`. |
| `required` | `boolean` | `false` | |
| `id` | `string` | - | Overrides the generated id. |

### Switch

`normal` / `styled` (`abaabil/switch`, `abaabil/switch/styled`) render `<input type="checkbox" role="switch">`.

The role is in the `normal` tier, not held back for `a11y`, because it is this component's identity rather than wiring, the same way `<dialog>` and `<details>` are for the components built on them. There is no native switch element, so the role is the only thing that makes a switch a switch; without it the component would be `abaabil/checkbox` with different CSS, and the styled tier would look like a switch while announcing itself as a checkbox.

There is no `aria-checked`. The native `checked` property already exposes the state, and a second copy of a piece of state is a second copy that can disagree with the first.

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | - | Merged with the base class. |

`a11y` (`abaabil/switch/a11y`):

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Accessible name. The platform does not supply one. |
| `description` | `string` | - | Rendered text, wired via `aria-describedby`. |
| `id` | `string` | - | Overrides the generated id. |

Deliberately not included: visible "On"/"Off" text beside the control. A switch already announces its state from `checked`, so rendering the same state as adjacent text means a screen reader says it twice. Render your own and mark it `aria-hidden` if you want it visible.

### Popover

Built on the native Popover API. The trigger, the top layer, light-dismiss and Escape all come from the browser, so **all three tiers ship zero JavaScript** and all three are server-renderable.

`id` is required rather than generated. Generating one would mean `useId`, which would mean a client boundary, which would cost this component the only property that makes it interesting.

`Popover` (all tiers), trigger and panel together, rendered as a fragment so nothing is added to your layout:

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | - | Panel id; also wires the trigger. Required. |
| `trigger` | `ReactNode` | - | Button content. |
| `triggerProps` | `object` | - | Spread onto the button. |
| `mode` | `'auto' \| 'manual'` | `'auto'` | `auto` light-dismisses and closes on Escape; `manual` does neither. |

`PopoverTrigger` and `PopoverPanel` are also exported from every tier, for placing the two apart.

`a11y` (`abaabil/popover/a11y`) adds a name for the panel, which is the one thing the platform does not supply:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Accessible name for the panel, as `aria-label`. |
| `labelledBy` | `string` | - | Id of an element naming the panel. Use instead of `label` when the panel renders a visible heading, so the name is not said twice. |

Deliberately not included: `aria-expanded` on the trigger. With no JavaScript it could only ever be a static value, and a static `aria-expanded` is worse than none, because it states a fact that stops being true the moment the popover opens. Browsers expose the `popovertarget` relationship natively.

### Tabs

The W3C APG tabs pattern. Tabs have no native element behind them, so unlike most of this library every tier is a client module: showing one panel at a time needs state.

`normal` / `styled` (`abaabil/tabs`, `abaabil/tabs/styled`) give you the structure and the selection, with no ARIA and no keyboard handling:

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<{ key?, label, children? }>` | - | One entry per tab. |
| `defaultIndex` | `number` | `0` | Tab selected on first render. |
| `onChange` | `(index: number) => void` | - | Called with the newly selected index. |
| `className` | `string` | - | Merged with the base class. |

`a11y` (`abaabil/tabs/a11y`) adds the roles, the pairing, the roving tabindex and the arrow keys, plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Accessible name for the tablist. |
| `labelledBy` | `string` | - | Id of an element naming the tablist. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Chooses the arrow pair and sets `aria-orientation`. |
| `activation` | `'automatic' \| 'manual'` | `'automatic'` | `automatic` selects as focus moves, which is the APG's recommendation when rendering a panel is cheap. `manual` moves focus without selecting; Enter or Space commits. |

Uncontrolled, like the combobox: observe the selection through `onChange`.

### Alert

`normal` / `styled` (`abaabil/alert`, `abaabil/alert/styled`):

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | Applied as `data-variant`. |
| `className` | `string` | - | Merged with the base class. |

`a11y` (`abaabil/alert/a11y`) adds the live-region semantics, which are the whole difference between a coloured box and a message anyone using a screen reader finds out about. The role follows the variant, because the right answer is the same every time and getting it wrong is the common failure: `info` and `success` get `role="status"` (polite), `warning` and `danger` get `role="alert"` (interrupting).

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | Also selects the role. |
| `live` | `'polite' \| 'assertive' \| 'off'` | from `variant` | Overrides the politeness the variant implies. `off` drops the role entirely. |
| `title` | `string` | - | Rendered above the message as `<strong>`, not a heading: an alert is usually not a section of the document, and a stray heading damages the outline for anyone navigating by headings. |

**Read this before using it.** A live region is announced when its *contents change*, and assistive tech has to be watching the region before that happens. An alert that arrives in the DOM already carrying its message may not be announced at all, and behaviour differs between screen readers. If the message appears in response to something the user did, render the component with empty children from the start and fill it in, rather than mounting the whole alert at the moment you have something to say. Rendered empty it paints nothing.

### Progress

Native `<progress>`. Omit `value` for an indeterminate bar; it has no default, because defaulting it to 0 would turn every unknown-duration operation into one claiming to be 0% done.

`normal` / `styled`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | - | Omit for indeterminate. |
| `max` | `number` | `100` | |
| `className` | `string` | - | Merged with the base class. |

`a11y` adds the label wiring and the one thing people get wrong about a progress bar, which is what it announces:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Rendered as a real `<label>`. |
| `hideLabel` | `boolean` | `false` | Hide it visually; it stays in the accessibility tree. |
| `description` | `string` | - | Help text, wired into `aria-describedby`. |
| `valueText` | `string` | - | Announced instead of the percentage. A bare `<progress value="3" max="8">` says "38 percent"; pass `"3 of 8 files"` when the number means something else. |

### Slider

Native `<input type="range">`. The keyboard support, the min/max/step arithmetic and the announced role all come from the platform, which is why this is under 200 bytes at the lower tiers.

`normal` / `styled`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `min` / `max` / `step` | `number` | `0` / `100` / `1` | |
| `className` | `string` | - | Merged with the base class. |

`a11y`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Rendered as a real `<label>`. |
| `hideLabel` | `boolean` | `false` | |
| `description` | `string` | - | Wired into `aria-describedby`. |
| `showValue` | `boolean` | `false` | Renders the value in an `<output>`, marked `aria-hidden` because the input already announces it. |
| `formatValue` | `(value: number) => string` | - | Sets `aria-valuetext` and the visible output. A price slider announces "50" without it. |

Uncontrolled by default; pass `defaultValue` and read `onChange`. An uncontrolled slider starts at the midpoint, matching the native thumb.

### Breadcrumb

A `<nav>` around an ordered list, because the order is the information. All three tiers are server-renderable.

The separator is drawn in CSS, never rendered as text, so a screen reader is not reading punctuation between the steps.

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<{ key?, label, href? }>` | - | Root first. An item with no `href` renders as text. |
| `className` | `string` | - | |

`a11y` adds the two things a hand-rolled breadcrumb almost always misses:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `'Breadcrumb'` | Names the `<nav>`. A page usually has several navigation landmarks, and unnamed ones are announced as "navigation, navigation, navigation". |
| `linkCurrent` | `boolean` | `false` | By default the last item renders as text even if given an `href`, because a link to the page you are on is a link that does nothing. Either way it gets `aria-current="page"`. |

### Tooltip

**Read this before using one.** A tooltip is the control most often used for the wrong job.

- **Never put essential information in one.** There is no hover on touch, so it is simply unreachable there.
- **Never put interactive content in one.** Moving towards a link inside a tooltip dismisses the tooltip. If you need that, you want a popover.
- **The trigger must be focusable.** A tooltip on a plain `<span>` does not exist for keyboard users. The `a11y` tier warns when its child cannot receive props.

Showing and hiding is done in CSS, by `:hover` and `:focus-within`. Those are the two events that should reveal a tooltip and both are expressible as selectors, so the `normal` and `styled` tiers need no JavaScript.

| Prop | Type | Default | Description |
|---|---|---|---|
| `content` | `ReactNode` | - | The tooltip text. |
| `placement` | `'top' \| 'bottom'` | `'top'` | |
| `children` | `ReactElement` | - | The trigger. |

`a11y` adds the two things CSS cannot: `aria-describedby` from the trigger to the bubble, which is what makes a screen reader read it at all, and Escape to dismiss, which WCAG 1.4.13 requires for content revealed on hover. It clones the child to attach them, so the trigger stays your element rather than a wrapper of ours.

### Menu

The W3C APG menu button pattern, on top of the native Popover API. The browser supplies the top layer, the outside-click dismissal and Escape; this component supplies the menu semantics and keyboard.

Like popover, `id` is required rather than generated.

**When not to use it.** `role="menu"` means a list of *actions*, in the application-menu sense. A button revealing a few navigation links is not a menu, and marking it up as one makes a screen reader announce a widget the user then cannot operate as one. Use `abaabil/popover` with links in it.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | - | Panel id; also wires the trigger. Required. |
| `trigger` | `ReactNode` | - | Button content. |
| `items` | `Array<{ key?, label, href?, onSelect?, disabled? }>` | - | An item with `href` renders an `<a>`, otherwise a `<button>`. |
| `triggerProps` | `object` | - | Spread onto the trigger. |

`a11y` adds:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Names the menu itself. Without it the menu is named by its trigger. |

plus `aria-haspopup`, a live `aria-expanded` kept in step with the panel's own `toggle` event, `role="menu"`/`role="menuitem"`, a roving tabindex, Up/Down with wrapping, Home/End, multi-character typeahead, Tab to close, and focus moving to the first item on open and back to the trigger on close.

### Pagination

A `<nav>` around an ordered list of real links, so each page is a URL you can open in a new tab, bookmark and share. A paginator built from buttons takes all of that away for nothing. Server-renderable at every tier.

| Prop | Type | Default | Description |
|---|---|---|---|
| `page` | `number` | - | Current page, 1-based. |
| `pageCount` | `number` | - | Total pages. |
| `href` | `(page) => string` | - | Builds each page's URL. |
| `siblings` | `number` | `1` | Pages shown either side of the current one before the list collapses. |
| `className` | `string` | - | |

The gap is drawn in CSS, never rendered as text, so an ellipsis is never read out between numbers. It also only ever appears when it stands in for **two or more** pages: a gap replacing a single number takes the same room and says less.

`a11y` adds the four things a hand-rolled paginator usually misses:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `'Pagination'` | Names the `<nav>`. |
| `pageLabel` | `(n) => string` | `` `Page ${n}` `` | Names each number. A link whose whole content is "7" is announced as "7", which in a list of links means nothing. Replace to translate. |
| `previousLabel` | `string` | `'Previous page'` | |
| `nextLabel` | `string` | `'Next page'` | |

plus `aria-current="page"` on the current page. At either end, Previous and Next are not links at all, so nothing dead stays in the tab order.

### File

A native `<input type="file">`, not a `<button>` with a hidden input behind it. That pattern has to reimplement the label association, the keyboard activation and the announcement of the chosen file, and usually manages one of the three. The real control does all three, and it is stylable: `::file-selector-button` is a real pseudo-element.

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | - | Merged with the base class. |

`a11y` adds the same label, description and error wiring as `input`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Rendered as a real `<label>`. |
| `hideLabel` | `boolean` | `false` | |
| `description` | `string` | - | Wired into `aria-describedby`. |
| `error` | `string` | - | Sets `aria-invalid` and joins `aria-describedby`. |
| `required` | `boolean` | `false` | |

It also warns when you pass `accept` without a `description`. `accept` filters the file dialog silently: it is never announced, and it does not apply to a file dropped onto the control. Say what you take in words.

### Toolbar

The W3C APG toolbar pattern. The point of it is the tab sequence: a row of eight buttons is eight stops on the way to the rest of the page, and as a toolbar it is one, with the arrow keys moving between the controls inside. A toolbar that does not do that is a `<div>` with a role on it.

| Prop | Type | Default | Description |
|---|---|---|---|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Chooses the arrow pair. |
| `className` | `string` | - | |

`a11y` adds `role="toolbar"`, `aria-orientation`, a roving tabindex, arrow keys following the orientation, and Home/End:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Accessible name. An unnamed toolbar is announced as "toolbar" and nothing else. |
| `labelledBy` | `string` | - | Id of an element naming it. |

It takes arbitrary children rather than an `items` array, because a toolbar's contents are heterogeneous by definition, and manages `tabindex` on its focusable descendants directly: cloning would only reach the top level. A control that needs the arrows itself, such as a `<select>` or a text field, keeps them.

### Avatar

An image when there is one, initials when there is not. There is no fallback-on-load-error, which would need state and make every tier a client component for a case the server usually already knows about: pass no `src` and you get initials.

| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string` | - | Omit for initials. |
| `name` | `string` | - | Used for the initials. |
| `alt` | `string` | `''` | Empty by default, which is right more often than not. |
| `className` | `string` | - | |

`a11y` asks the question the component cannot answer for you:

| Prop | Type | Default | Description |
|---|---|---|---|
| `decorative` | `boolean` | `true` | Whether the avatar repeats something already on screen. |

Beside a visible name an avatar is **decorative**: it says nothing the text does not, and naming it means hearing the person twice. Alone, in a stack of collaborators or a comment with no byline, it is the only thing identifying someone and needs a name, so pass `decorative={false}`.

The initials are never the accessible name. "FA" read aloud is not a person: when meaningful, the letters are hidden and the name is carried by a `role="img"` that can hold one.

### Badge

A small piece of status text. Server-renderable at every tier.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | Applied as `data-variant`. |
| `className` | `string` | - | |

`a11y` adds the one thing that makes a badge worth a component:

| Prop | Type | Default | Description |
|---|---|---|---|
| `context` | `string` | - | The rest of the sentence, announced but not drawn. |

A badge is shorthand that only means something beside what it is attached to. "3" next to an inbox icon, read out on its own in a list of everything on the page, is noise: the user hears "three" with no way to know three of what. `context` supplies the rest as visually hidden text, so the badge still draws "3" and announces "3 unread messages".

It is hidden text rather than `aria-label`, deliberately. A badge is a `<span>`, a span has no role, and `aria-label` is prohibited on a generic element: set it there and it is discarded, leaving the badge as unlabelled as before while looking fixed. That exact mistake shipped in this library's own popover, and is why this component does it the other way.

A badge is not a live region. A count that changes while the page is open does not announce itself, and this does not make it do so; wrap it in `abaabil/alert` if the change is worth interrupting for, which for an unread count it usually is not.

## Combobox: uncontrolled in 1.x

The combobox is uncontrolled in this release: it does not accept a `value` prop. Observe the selected value through the `onChange` callback instead of driving it from external state.

## Browser support

The floor is Chrome 99, Firefox 98, Safari 15.4, set by `@layer` (needed from Chrome 99 and Safari 15.4) and by Firefox's `<dialog>`/`showModal()` support (Firefox 98). `:focus-visible` and `<details>`/`<summary>` need less everywhere and don't raise the floor. A few features are used only as progressive enhancement and degrade safely instead of raising it:

| Feature | Needs | Degrades to |
|---|---|---|
| `<details name>` | Chrome 120, Firefox 130, Safari 17.2 | multiple panels open at once |
| `@starting-style` | Chrome 117, Firefox 129, Safari 17.5 | no entry animation |
| CSS anchor positioning | Chrome 125, Firefox 147, Safari 26 | absolute positioning, behind `@supports` |

`abaabil/popover` is the one component with a floor of its own: the Popover API needs **Chrome 114, Firefox 125, Safari 17**. That is below this library's build target, so it raises nothing in practice, but it is a hard requirement rather than an enhancement. Below it, an unknown `popover` attribute is inert and the panel renders as an ordinary always-visible block under its trigger. Content stays reachable, which is why it is left that way rather than hidden, but it will not open and close. Import it only if that floor is acceptable; the other twelve components are unaffected.

Where the panel appears is a separate question from whether it works. Attaching it to its trigger needs CSS anchor positioning, which is not yet Baseline, so it is applied behind `@supports`. Without it the popover falls back to the UA default, centred in the viewport. Placing it next to the trigger any other way would mean measuring the DOM in JavaScript, which would cost this component the zero-JavaScript property that is the reason to use it.

## Accessibility

- The combobox implements the [WAI-ARIA Authoring Practices Guide 1.2 combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
- Dialog modality (focus containment, inert background, Escape to close) is handled natively by the browser's `showModal()` on `<dialog>`, not by a JavaScript focus trap.
- Checkbox's `indeterminate` is mirrored to `aria-checked="mixed"`, because `indeterminate` itself is a DOM property with no attribute equivalent, so it's invisible to assistive tech unless something does this explicitly.
- `RadioGroup` supplies the shared `name` every descendant `Radio` needs to behave as one native group; without it, arrow-key navigation and single-selection silently stop working.
- Accordion's `a11y` tier needs no JavaScript at all: every tier, including `a11y`, is server-renderable, and exclusive open/close comes from the native `name` attribute on `<details>`.
- Popover leans entirely on the native Popover API for the top layer, light-dismiss, Escape and the trigger-to-panel relationship. Its `a11y` tier adds only an accessible name for the panel, which is the one thing the platform does not supply.
- Tabs implement the [WAI-ARIA Authoring Practices Guide tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), including a roving tabindex so Tab steps past the tablist rather than through every tab in it.
- Switch carries `role="switch"` from its `normal` tier, so it never looks like a switch while announcing itself as a checkbox.
- Alert derives `role="status"` or `role="alert"` from its variant, so a confirmation does not interrupt and an error does. Read the note in its props section about when live regions actually announce.
- Menu implements the [WAI-ARIA Authoring Practices Guide menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/), and its docs say when a menu is the wrong widget.
- Tooltip shows on both hover and focus, dismisses on Escape as WCAG 1.4.13 requires, and its bubble is never a pointer target so it cannot be hovered instead of its trigger.
- Progress accepts `valueText`, because a bar whose number is not a percentage is otherwise announced as one.
- Slider is a native range input, so its keyboard support is the platform's rather than a reimplementation; `formatValue` sets `aria-valuetext` for values that are not self-explanatory.
- Breadcrumb names its `<nav>` and marks the current page with `aria-current`, and draws its separators in CSS so they are never read aloud.
- Toolbar implements the [WAI-ARIA Authoring Practices Guide toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/), collapsing a row of controls to one tab stop with arrow-key movement inside.
- Pagination names its `<nav>`, gives every number a real name rather than a bare digit, marks the current page with `aria-current`, and draws its gap in CSS so it is never read aloud.
- File warns when `accept` is set with nothing explaining it in words, because `accept` is never announced and does not apply to a dropped file.
- Avatar treats decorative and meaningful as different cases, and never uses the initials as the accessible name.
- Badge carries its context as visually hidden text rather than `aria-label`, which a `<span>` discards.
- `a11y` tiers are the recommended default for production use; `normal` and `styled` tiers exist for cases where you want to compose your own accessibility behavior.

## License

MIT
