# abaabil

Minimal, themeable, accessible React components. Zero dependencies.

Eight components: button, dialog, combobox, input, checkbox, radio, select, accordion.

```js
import Button from 'abaabil/button/a11y'
import 'abaabil/theme.css'

function Example() {
  return <Button onClick={() => console.log('clicked')}>Save</Button>
}
```

Each component ships three tiers, `normal`, `styled`, `a11y`, so you only pay for what you use. Two facts worth knowing up front:

- A fully accessible `dialog/a11y` is **674 B gzipped**, against `@radix-ui/react-dialog` at **3,422 B**, both measured the same way: the component imported alone, bundled with esbuild, `react`/`react-dom` external, minified, then gzipped. Both numbers are JS only; Radix ships no stylesheet of its own, and it also bundles its own positioning and portal logic and predates a usable native `<dialog>`, so it isn't attempting exactly what abaabil does. The difference is mostly what the platform now gives you for free, not a claim of doing more with less.
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
| `abaabil/button` | 189 B | - |
| `abaabil/button/styled` | 200 B | 555 B |
| `abaabil/button/a11y` | 559 B | 555 B |
| `abaabil/dialog` | 161 B | - |
| `abaabil/dialog/styled` | 171 B | 373 B |
| `abaabil/dialog/a11y` | 572 B | 373 B |
| `abaabil/combobox` | 454 B | - |
| `abaabil/combobox/styled` | 456 B | 626 B |
| `abaabil/combobox/a11y` | 1090 B | 626 B |
| `abaabil/input` | 160 B | - |
| `abaabil/input/styled` | 171 B | 500 B |
| `abaabil/input/a11y` | 485 B | 500 B |
| `abaabil/checkbox` | 161 B | - |
| `abaabil/checkbox/styled` | 171 B | 636 B |
| `abaabil/checkbox/a11y` | 600 B | 636 B |
| `abaabil/radio` | 157 B | - |
| `abaabil/radio/styled` | 168 B | 545 B |
| `abaabil/radio/a11y` | 542 B | 545 B |
| `abaabil/select` | 202 B | - |
| `abaabil/select/styled` | 212 B | 769 B |
| `abaabil/select/a11y` | 488 B | 769 B |
| `abaabil/accordion` | 323 B | - |
| `abaabil/accordion/styled` | 334 B | 533 B |
| `abaabil/accordion/a11y` | 383 B | 533 B |

Each entry point is bundled on its own with its full module graph (so, for example, `button/styled`'s cost already includes the `button` markup it imports) using Rollup (the same plugins as the real build: `@rollup/plugin-node-resolve` and `esbuild` in minify mode), `react`/`react-dom`/`*.css` external, then gzipped. The `styled` and `a11y` tiers also pull in their component's stylesheet as a side-effect import; the CSS column is that stylesheet's own gzipped size, separate from the JS number. `normal` tier entries have no CSS column because they import none.

This is different from the per-file numbers in `SIZES.md`, which are produced with `preserveModules` and so under-count any tier that imports another module, such as `styled.js`, which shows only the bytes of its own file, not the `index.js` it re-exports. Re-run this yourself with the same setup (each entry bundled alone, React external, gzip the output) to reproduce these numbers.

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

The `styled` and `a11y` entry points (all sixteen across the eight components) import their
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

Button (all tiers), accordion (all tiers), and every `normal`/`styled` tier of dialog, input, checkbox, radio and select carry no client directive and can be rendered from a Server Component with zero client JS. Accordion is the only component whose `a11y` tier is also server-renderable: it has no hooks and needs no JavaScript at all, so all three of its tiers stay server components. Dialog's `a11y` tier, every combobox tier, and the `a11y` tier of input, checkbox, radio and select are client components.

`abaabil/combobox/styled` has no literal `"use client"` directive of its own; it only re-exports `abaabil/combobox`, which does carry one, so the client boundary is already established there and the directive isn't duplicated. It still behaves as a client module once bundled, which is why it's marked "yes" above.

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

## Combobox: uncontrolled in 1.0.0

The combobox is uncontrolled in this release: it does not accept a `value` prop. Observe the selected value through the `onChange` callback instead of driving it from external state.

## Browser support

The floor is Chrome 99, Firefox 98, Safari 15.4, set by `@layer` (needed from Chrome 99 and Safari 15.4) and by Firefox's `<dialog>`/`showModal()` support (Firefox 98). `:focus-visible` and `<details>`/`<summary>` need less everywhere and don't raise the floor. A few features are used only as progressive enhancement and degrade safely instead of raising it:

| Feature | Needs | Degrades to |
|---|---|---|
| `<details name>` | Chrome 120, Firefox 130, Safari 17.2 | multiple panels open at once |
| `@starting-style` | Chrome 117, Firefox 129, Safari 17.5 | no entry animation |
| CSS anchor positioning | Chrome 125, Firefox 147, Safari 26 | absolute positioning, behind `@supports` |

## Accessibility

- The combobox implements the [WAI-ARIA Authoring Practices Guide 1.2 combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
- Dialog modality (focus containment, inert background, Escape to close) is handled natively by the browser's `showModal()` on `<dialog>`, not by a JavaScript focus trap.
- Checkbox's `indeterminate` is mirrored to `aria-checked="mixed"`, because `indeterminate` itself is a DOM property with no attribute equivalent, so it's invisible to assistive tech unless something does this explicitly.
- `RadioGroup` supplies the shared `name` every descendant `Radio` needs to behave as one native group; without it, arrow-key navigation and single-selection silently stop working.
- Accordion's `a11y` tier needs no JavaScript at all: every tier, including `a11y`, is server-renderable, and exclusive open/close comes from the native `name` attribute on `<details>`.
- `a11y` tiers are the recommended default for production use; `normal` and `styled` tiers exist for cases where you want to compose your own accessibility behavior.

## License

MIT
