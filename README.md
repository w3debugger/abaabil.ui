# abaabil

Minimal, themeable, accessible React components. Zero dependencies.

## Install

```
npm install abaabil
```

`react` and `react-dom` are peer dependencies (`^19.0.0`); abaabil has zero runtime dependencies of its own.

## The three tiers

Every component ships as three separate entry points so you only pay for what you use. For button and dialog, each tier builds on the one before it: `styled` adds abaabil's CSS on top of `normal`, and `a11y` adds ARIA wiring and keyboard handling on top of `styled`. Combobox is the exception: its `a11y` tier is an independent implementation that imports `combobox.css` directly, rather than building on `styled`, because its ARIA attributes have to sit on specific elements (the input and the listbox) that the `styled`/`normal` markup does not expose as separate parts.

### Delivered size

The table below is the actual cost of importing each entry point on its own: that entry point bundled with its full module graph (so, for example, `button/styled`'s cost already includes the `button` markup it imports), React treated as external (a peer, not bundled), gzipped. This is different from the per-file numbers in `SIZES.md`, which are produced with `preserveModules` and so under-count any tier that imports another module, such as `styled.js`, which shows only the bytes of its own file, not the `index.js` it re-exports.

The `styled` and `a11y` tiers also pull in their component's stylesheet as a side-effect import; the CSS column is that stylesheet's own gzipped size, separate from the JS number.

| Entry | JS | CSS |
|---|---:|---:|
| `abaabil/button` | 190 B | — |
| `abaabil/button/styled` | 201 B | 532 B |
| `abaabil/button/a11y` | 649 B | 532 B |
| `abaabil/dialog` | 162 B | — |
| `abaabil/dialog/styled` | 173 B | 371 B |
| `abaabil/dialog/a11y` | 664 B | 371 B |
| `abaabil/combobox` | 450 B | — |
| `abaabil/combobox/styled` | 459 B | 588 B |
| `abaabil/combobox/a11y` | 1186 B | 588 B |

Measured by bundling each entry point on its own with Rollup (the same plugins as the real build: `@rollup/plugin-node-resolve` and `esbuild` in minify mode), `react`/`react-dom`/`*.css` external, then gzipping the output. `normal` tier entries have no CSS column because they import none.

Import the tier you need directly:

```js
import Button from 'abaabil/button/a11y'
import Dialog from 'abaabil/dialog/a11y'
import Combobox from 'abaabil/combobox/a11y'
```

### Bundler required for `styled` and `a11y` tiers

The `styled` and `a11y` entry points (all six across the three components) import their
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

The `normal` tier (`abaabil/button`, `abaabil/dialog`, `abaabil/combobox`) never imports CSS and
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
| `abaabil/combobox/styled` | yes |
| `abaabil/combobox/a11y` | yes |

Button (all tiers) and dialog's `normal`/`styled` tiers carry no client directive and can be rendered from a Server Component with zero client JS. Dialog's `a11y` tier and every combobox tier are client components.

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
| `hideLabel` | `boolean` | `true` | Visually hides the label (it is always present in the accessibility tree). Set to `false` to render it as a normal visible block above the input. |
| `onChange` | `(value: string \| null) => void` | — | Called with the selected option's `value`, or `null` when the query is cleared via Escape. |

## Combobox: uncontrolled in 1.0.0

The combobox is uncontrolled in this release: it does not accept a `value` prop. Observe the selected value through the `onChange` callback instead of driving it from external state.

## Browser support

- Chrome / Edge 116+
- Firefox 125+
- Safari 17+
- iOS Safari 18.3+

The floor is set by the [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API), which the dialog and combobox components rely on. Note that iOS Safari lags behind desktop Safari here: the desktop floor is Safari 17+, but iOS Safari needs 18.3+.

CSS anchor positioning is used only as progressive enhancement, gated behind `@supports`. It is not Baseline (currently at 84.1% support), so components fall back to standard positioning where it's unavailable.

## Accessibility

- The combobox implements the [WAI-ARIA Authoring Practices Guide 1.2 combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
- Dialog modality (focus containment, inert background, Escape to close) is handled natively by the browser's `showModal()` on `<dialog>`, not by a JavaScript focus trap.
- `a11y` tiers are the recommended default for production use; `normal` and `styled` tiers exist for cases where you want to compose your own accessibility behavior.

## License

MIT
