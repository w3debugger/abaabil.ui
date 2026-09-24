# abaabil

Minimal, themeable, accessible React components. Zero dependencies.

Forty components: button, dialog, alert-dialog, drawer, popover, menu, context-menu, menubar, navigation-menu, command, tooltip, combobox, input, textarea, otp, field, file, checkbox, radio, switch, select, slider, toggle, accordion, collapsible, tabs, toolbar, breadcrumb, pagination, table, carousel, progress, spinner, skeleton, alert, toast, avatar, badge, card, separator.

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

The `styled` and `a11y` entry points (all eighty across the forty components) import their
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

Setting `--color-primary` is enough. The hover shade and the focus ring are **derived** from it, so a purple theme gets a purple hover and a purple focus ring without naming either:

| Token | Default | Follows `--color-primary`? |
|---|---|---|
| `--color-primary` | `#2563eb` | is it |
| `--color-primary-hover` | `color-mix(in srgb, var(--color-primary) 85%, white)` | yes |
| `--color-focus-ring` | `var(--color-primary)` | yes |
| `--color-primary-fg` | `#ffffff` | **no**, see below |

Override any of them individually if the derived value is not what you want.

`--color-primary-fg` is the text and iconography drawn *on* the primary colour, and it does not derive, because deriving it needs a contrast decision CSS cannot make yet. It is white. If you set `--color-primary` to something light, set `--color-primary-fg` to something dark alongside it, or the text on your buttons will fail contrast.

`--color-danger`, `--color-success` and `--color-warning` are independent on purpose: an error is red whatever your brand colour is.

Semantic tokens (`--color-*`, `--space-*`, `--radius-*`, `--font-*`) are deliberately unprefixed so an app or Tailwind `@theme` block that already defines them re-themes the library with no mapping. If your app defines those names for something else, wrap the library in a scope and redefine them there. Every component stylesheet restates the layer order, so `theme.css` may be imported in any order relative to them.

### The neutrals, and which ones have to stay visible

Four tokens look interchangeable and are not. Each has a contrast floor it
is chosen to clear, and swapping one for another is how a control quietly
stops being visible to the people who need it most.

| Token | Default | Its job | Floor |
|---|---|---|---|
| `--color-border` | `#8b929e` | the edge of a control: an input, a select, a track, the off state of a switch | 3:1 on the surface |
| `--color-border-subtle` | `#d1d5db` | decorative rules: accordion dividers, a toolbar separator | none, it carries nothing |
| `--color-muted` | `#f3f4f6` | a hover wash, an avatar ground | none, hover is a pointer affordance |
| `--color-track` | `#f3f4f6` | the empty part of a progress bar or slider groove | 3:1 against `--color-primary` |

`--color-muted` and `--color-track` share a value in the light theme and
part company in the dark one, which is the reason they are two tokens. A
hover wash wants to sit a hair off the surface; a track has to stay clear
of the fill drawn over it. Held together, the dark theme put a blue fill
on a grey track at 2.84:1.

If you re-theme, the pairs worth re-checking are `--color-border` against
`--color-surface`, and `--color-primary` against both `--color-surface`
and `--color-track`. The library's own test suite asserts these; yours
should too if you change them.

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
| `abaabil/alert-dialog` | no |
| `abaabil/alert-dialog/styled` | no |
| `abaabil/alert-dialog/a11y` | yes |
| `abaabil/card` | no |
| `abaabil/card/styled` | no |
| `abaabil/card/a11y` | yes |
| `abaabil/collapsible` | no |
| `abaabil/collapsible/styled` | no |
| `abaabil/collapsible/a11y` | no |
| `abaabil/drawer` | no |
| `abaabil/drawer/styled` | no |
| `abaabil/drawer/a11y` | yes |
| `abaabil/separator` | no |
| `abaabil/separator/styled` | no |
| `abaabil/separator/a11y` | no |
| `abaabil/skeleton` | no |
| `abaabil/skeleton/styled` | no |
| `abaabil/skeleton/a11y` | no |
| `abaabil/spinner` | no |
| `abaabil/spinner/styled` | no |
| `abaabil/spinner/a11y` | no |
| `abaabil/toast` | no |
| `abaabil/toast/styled` | no |
| `abaabil/toast/a11y` | yes |
| `abaabil/toggle` | no |
| `abaabil/toggle/styled` | no |
| `abaabil/toggle/a11y` | no |
| `abaabil/field` | no |
| `abaabil/field/styled` | no |
| `abaabil/field/a11y` | yes |
| `abaabil/otp` | no |
| `abaabil/otp/styled` | no |
| `abaabil/otp/a11y` | yes |
| `abaabil/command` | yes |
| `abaabil/command/styled` | yes (see note) |
| `abaabil/command/a11y` | yes |
| `abaabil/table` | no |
| `abaabil/table/styled` | no |
| `abaabil/table/a11y` | yes |
| `abaabil/navigation-menu` | no |
| `abaabil/navigation-menu/styled` | no |
| `abaabil/navigation-menu/a11y` | yes |
| `abaabil/context-menu` | no |
| `abaabil/context-menu/styled` | no |
| `abaabil/context-menu/a11y` | yes |
| `abaabil/menubar` | no |
| `abaabil/menubar/styled` | no |
| `abaabil/menubar/a11y` | yes |
| `abaabil/carousel` | no |
| `abaabil/carousel/styled` | no |
| `abaabil/carousel/a11y` | yes |

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

`abaabil/combobox/styled`, `abaabil/tabs/styled` and `abaabil/command/styled` have no literal `"use client"` directive of their own; they only re-export their `normal` tier, which does carry one, so the client boundary is already established there and the directive isn't duplicated. They still behave as client modules once bundled, which is why they're marked "yes" above.

This split is enforced at build time by `scripts/check-directives.js`, which runs as part of `npm run build` and fails the build in both directions: a required `"use client"` that got stripped, or an accidental one on a component that's supposed to stay server-only. That gate is checked against the built output, not just the source, so this table can't silently drift from what actually ships.

`button/a11y` has no hooks and stays server-renderable even though it wires up click suppression and Space activation: it only attaches `onClick`/`onKeyDown` to the underlying element when they are actually needed (you passed a handler yourself, or the case requires suppressing a click: `disabled` with `keepFocusable`, or a disabled link-button). A plain `<Button>Save</Button>` with no handlers and no `disabled` renders with no function props at all, which is what keeps it serializable from a server module. Since passing your own `onClick` already puts you in a client component, this never puts a function prop where the flight serializer would reject it.

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

On a link-button, Enter is left to the browser, which follows `href` and fires the click natively; Space is turned into that same native click, so `href` and `onClick` both run from either key. A link-button always carries that Space handler, so render link-buttons at the a11y tier from a client component. `keepFocusable` on a disabled link-button keeps it in the tab order. Secondary and ghost buttons take a `--color-muted` fill on hover; each variant exposes `--btn-bg-hover` and `--btn-border-hover`, and a disabled button keeps its resting colours on hover.

### Dialog

`normal`/`styled` (`abaabil/dialog`, `abaabil/dialog/styled`) render a plain `<dialog>` and accept no props beyond standard HTML attributes; you drive `showModal()`/`close()` yourself through a `ref`.

`a11y` (`abaabil/dialog/a11y`):

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | `false` | Calls `showModal()`/`close()` on the underlying `<dialog>` as it changes. |
| `onClose` | `() => void` | — | Called when the dialog closes, whether via `open` becoming `false`, Escape, or a backdrop click. |
| `label` | `string` | — | Accessible name, rendered as the dialog's heading and wired to `aria-labelledby`. The platform supplies no name on its own; omitting this warns in dev. |

Page scroll is locked from CSS while the dialog is modal (`html:has(.abaabil-dialog:modal)` with `scrollbar-gutter: stable`), so the page does not shift sideways and nothing on `body` is changed. Closing animates out through a discrete `display` and `overlay` transition. Unmounting while `open` does not fire the close event, so set `open` to `false` first if focus should return to the element that opened it.

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

`className` and `style` land on the wrapper (`.abaabil-input-group`), which is the flex item in your layout; every other prop lands on the input. The description and error ids derive from the control id: `id="email"` gives `email-description` and `email-error`, the same shape as Field. The error is not a live region: it is read with the control as part of its description, the same policy as Select and Field. The label draws a required mark from the control's own `required` attribute, as Field does.

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

The `<label>` wraps the control and its text, so the whole row, gap included, is the click target; that is how the 18px box (36 by 20 track for Switch) meets the 24px target size of WCAG 2.5.8. The description is a sibling beneath the label, indented under the text, and not part of the label, so it is never read as the name. Its id derives from the control id: `id="terms"` gives `terms-description`. In Windows forced-colors mode the mark is painted in `CanvasText` so the state stays visible.

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

The `<label>` wraps the control and its text, so the whole row, gap included, is the click target; that is how the 18px box (36 by 20 track for Switch) meets the 24px target size of WCAG 2.5.8. The description is a sibling beneath the label, indented under the text, and not part of the label, so it is never read as the name. Its id derives from the control id: `id="terms"` gives `terms-description`. In Windows forced-colors mode the mark is painted in `CanvasText` so the state stays visible.

### Select

`normal` and `styled` (`abaabil/select`, `abaabil/select/styled`) render a real native `<select>`, styled, not a custom listbox:

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `Array<{ value: string, label: string }>` | - | Rendered as `<option>` elements. Only consulted when given; pass `children` instead for `<optgroup>` or hand-written `<option>` markup, since the two never fight over which one renders. |
| `className`, `style` | `string`, `object` | - | Land on the wrapper (`.abaabil-select-group`), which is the flex item in your layout; every other prop lands on the select. |

`a11y` (`abaabil/select/a11y`), in addition to the above:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Accessible name, rendered as a real `<label>`. |
| `hideLabel` | `boolean` | `false` | Visually hides the label (it is always present in the accessibility tree, still a real `<label>` associated via `htmlFor`/`id`). Set to `true` to visually hide it. Matches combobox's `hideLabel` semantics and default. |
| `description` | `string` | - | Rendered and wired into `aria-describedby`. |
| `error` | `string` | - | Rendered, sets `aria-invalid`, and is joined into `aria-describedby` alongside the description. |
| `id` | `string` | - | Overrides the generated select id. |

CSS customizable select (`appearance: base-select`) was deliberately not used to build this. It is not Baseline: support is Chrome 135 only, with no Firefox support at all, far above this library's Chrome 116 / Firefox 125 / Safari 17 floor.

The description and error ids derive from the control id, the same shape as Field, and the label draws a required mark from the control's own `required` attribute.

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
| `name` | `string` | - | Shared native group name, unique on the page. Required for exclusive open/close; without it more than one panel can be open at a time. |
| `className` | `string` | - | Merged onto the wrapping element. |

`a11y` (`abaabil/accordion/a11y`): `Disclosure` is re-exported unchanged, since `<summary>` already carries the correct implicit role and expanded/collapsed state and there's nothing this tier can add to a single disclosure. `Accordion_a11y`, in addition to `Accordion`'s props above:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Accessible name for the group as a whole. When given, applies `role="group"` and `aria-label` to the wrapper. Left unset by default: an unnamed group announces to screen readers as "group" with no name, which is worse than not grouping at all, and each panel's own summary text already names it. |

**Deliberate limitation:** `Accordion_a11y` offers no `headingLevel` prop, and this is intentional, not an oversight. `<summary>` has an implicit ARIA role of `button` in some browsers, and a heading nested inside a button is not reliably exposed to assistive technology (VoiceOver, for one, does not expose a heading nested inside `<summary>` as a heading). The reverse, wrapping `<summary>` in a heading element, isn't an option either: `<summary>` must be the literal first child of `<details>` for the browser to recognize it as the disclosure trigger. Consumers who need reliable heading navigation across sections need the button-in-heading accordion pattern instead (an explicit heading wrapping a button, with `aria-expanded` and `aria-controls`), a different, ARIA-driven widget that this component does not attempt to be.

Exclusive open/close (opening one panel closes its siblings) comes entirely from the native `name` attribute on `<details>`, so pass a `name` that is unique on the page. `Accordion_a11y` warns in development when there are two or more items and no `name`.

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

`className` and `style` land on the wrapper (`.abaabil-textarea-group`), which is the flex item in your layout; every other prop lands on the textarea. The description and error ids derive from the control id: `id="email"` gives `email-description` and `email-error`, the same shape as Field. The error is not a live region: it is read with the control as part of its description, the same policy as Select and Field. The label draws a required mark from the control's own `required` attribute, as Field does.

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

The `<label>` wraps the control and its text, so the whole row, gap included, is the click target; that is how the 18px box (36 by 20 track for Switch) meets the 24px target size of WCAG 2.5.8. The description is a sibling beneath the label, indented under the text, and not part of the label, so it is never read as the name. Its id derives from the control id: `id="terms"` gives `terms-description`. In Windows forced-colors mode the mark is painted in `CanvasText` so the state stays visible.

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

`orientation="vertical"` lays the list beside the panel. The list wraps when the tabs do not fit the width. ArrowLeft and ArrowRight follow the visual direction in a right-to-left document.

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

Under `prefers-reduced-motion`, an indeterminate bar shows static stripes instead of a partial fill, so it cannot be read as a percentage.

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

The slider's pointer target is 44px tall (WCAG 2.5.8); the visible track and thumb are unchanged. `showValue` snaps the displayed value to `step` the same way the browser snaps the thumb.

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

The bubble is positioned inside the wrapper, not in the top layer, so an ancestor with `overflow` other than `visible` (a table cell, a card, a scrolling toolbar) clips it, and `placement="top"` on a trigger at the top of the viewport is cut off; use `placement="bottom"` in a page header. Hover shows after 300ms so sweeping across a toolbar does not flash every tooltip; focus shows instantly.

### Menu

The W3C APG menu button pattern, on top of the native Popover API. The browser supplies the top layer, the outside-click dismissal and Escape; this component supplies the menu semantics and keyboard.

Like popover, `id` is required rather than generated.

**When not to use it.** `role="menu"` means a list of *actions*, in the application-menu sense. A button revealing a few navigation links is not a menu, and marking it up as one makes a screen reader announce a widget the user then cannot operate as one. Use `abaabil/popover` with links in it.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | - | Panel id; also wires the trigger. Required. |
| `trigger` | `ReactNode` | - | Button content. |
| `items` | `Array<{ key?, label, href?, onSelect?, disabled? }>` | - | An item with `href` renders an `<a>`, otherwise a `<button>`. |
| `triggerProps` | `object` | - | Spread onto the trigger button. A `className` in it is merged with `abaabil-menu__trigger`, not swapped for it. |

`a11y` adds:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Names the menu itself. Without it the panel is `aria-labelledby` the trigger, so the menu is named by whatever the trigger says. Without it the menu is named by its trigger. |

plus `aria-haspopup`, a live `aria-expanded` kept in step with the panel's own `toggle` event, `role="menu"`/`role="menuitem"`, a roving tabindex, Up/Down with wrapping, Home/End, multi-character typeahead, Tab to close, and focus moving to the first item on open and back to the trigger on close.

An item with `href` renders an `<a>`, otherwise a `<button>`. A disabled `href` item keeps its element but loses the `href`; `a11y` marks it `aria-disabled`, the other tiers `data-disabled`.

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
| `label` | `string` | `'Pagination'` | Names the `<nav>`. See the note below if a page has two paginators. |
| `pageLabel` | `(n) => string` | `` `Page ${n}` `` | Names each number. A link whose whole content is "7" is announced as "7", which in a list of links means nothing. Replace to translate. |
| `previousLabel` | `string` | `'Previous page'` | |
| `nextLabel` | `string` | `'Next page'` | |

plus `aria-current="page"` on the current page. At either end, Previous and Next are not links at all, so nothing dead stays in the tab order.

A page with a paginator above the list and another below it has two
navigation landmarks with the same name, which screen reader users hear
as "navigation, navigation" with nothing to tell them apart. Give the
second one its own `label`. The component cannot do this for you: from
inside a single paginator there is no way to know another exists.

```jsx
<Pagination label="Results, top" page={p} pageCount={n} href={href} />
<Pagination label="Results, bottom" page={p} pageCount={n} href={href} />
```

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

`className` and `style` land on the wrapper (`.abaabil-file-group`), which is the flex item in your layout; every other prop lands on the input. The description and error ids derive from the control id: `id="email"` gives `email-description` and `email-error`, the same shape as Field. The error is not a live region: it is read with the control as part of its description, the same policy as Select and Field. The label draws a required mark from the control's own `required` attribute, as Field does.

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

Clicking or focusing a control makes it the stop, so the next Tab into the toolbar returns to the last used control; a control that disables itself is caught by a `MutationObserver` on `disabled`. A consumer `onKeyDown` or `onFocus` runs before the toolbar's own. Arrow keys follow the visual direction in a right-to-left document.

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

### Separator

A rule between two things. An `<hr>`, which already carries
`role="separator"`. Server-renderable at every tier.

| Prop | Type | Default | Description |
|---|---|---|---|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Applied as `data-orientation`. |
| `className` | `string` | - | |

`a11y` fixes the one thing the element gets wrong and adds one thing it
cannot know:

| Prop | Type | Default | Description |
|---|---|---|---|
| `decorative` | `boolean` | `false` | Hides it from assistive technology, for a rule that is only a visual device. |

A vertical `<hr>` still reports an implicit `aria-orientation` of
horizontal however it is rotated in CSS, so the `a11y` tier sets it
explicitly. That, and being able to hide a purely decorative rule, is
the whole reason this is a component rather than an element.

A vertical separator stretches to its flex row; outside a flex row it is an inline 1em rule.

### Spinner

An indeterminate busy indicator. Server-renderable at every tier.

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Applied as `data-size`. Scales with `font-size`. |
| `className` | `string` | - | |

| `a11y` prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `'Loading'` | Announced through `role="status"` when the spinner appears. |
| `decorative` | `boolean` | `false` | Hides it, for a spinner beside text that already says what is happening. |

Under `prefers-reduced-motion` the ring stops and pulses instead. It
still has to indicate that work is happening, so it does not simply
freeze.

### Skeleton

A placeholder for content that has not arrived. Server-renderable at
every tier.

| Prop | Type | Default | Description |
|---|---|---|---|
| `shape` | `'text' \| 'rect' \| 'circle'` | `'text'` | Applied as `data-shape`. |
| `lines` | `number` | `1` | Draws several text bars, the last one short. |
| `width` | `string` | - | Any CSS length, as `--skeleton-width`. |
| `height` | `string` | - | Any CSS length, as `--skeleton-height`. |
| `className` | `string` | - | |

| `a11y` prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Announced once through `role="status"`. Put it on one skeleton per loading region, not on each. |

The `a11y` tier always hides the bars from assistive technology, with no
way to opt out: they are a picture of a layout and read aloud they are
noise. Set `aria-busy` on your own container, not on the skeleton.

`height` applies to every bar when `lines` is greater than one.

### Card

A surface with optional header and footer bands.

| Prop | Type | Default | Description |
|---|---|---|---|
| `header` | `ReactNode` | - | Rendered in its own band above the body. |
| `footer` | `ReactNode` | - | Rendered in its own band below it. |
| `className` | `string` | - | |

| `a11y` prop | Type | Default | Description |
|---|---|---|---|
| `heading` | `ReactNode` | - | Rendered as a real heading and used as the card's accessible name. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | - | Required alongside `heading`. |

Passing `heading` makes the card a named `region` and puts it in the
page's heading outline. Passing nothing leaves a plain `<div>`, because
a page of twelve cards announced as twelve named regions is twelve extra
stops on the way to the content.

There is no default `headingLevel`. The right level depends on where the
card sits in the document, which the component cannot know, and a page of
`<h3>`s under no `<h2>` is a broken outline that looks fine. `a11y` uses
`useId`, so it carries `'use client'` while the other two tiers do not.

### Collapsible

One section that opens and shuts. A native `<details>`/`<summary>` pair.
Server-renderable at every tier, and ships no JavaScript at any of them.

| Prop | Type | Default | Description |
|---|---|---|---|
| `summary` | `ReactNode` | - | The always-visible trigger. |
| `defaultOpen` | `boolean` | - | Maps to the native `open` attribute, which the browser then owns. |
| `className` | `string` | - | |
| `summaryClassName` | `string` | - | |

This is `abaabil/accordion`'s `Disclosure` without the group. Use the
accordion when several panels should close each other; use this when one
section stands alone.

The `a11y` tier re-exports it unchanged. `<summary>` already has the
right role, the expanded state, the keyboard behaviour and a place in the
tab order, and an author-supplied `aria-expanded` competes with the
browser's own rather than reinforcing it.

### Toggle

A button that stays pressed, and a group of them.

| `Toggle` prop | Type | Default | Description |
|---|---|---|---|
| `pressed` | `boolean` | `false` | Controlled. Applied as `data-pressed`. |
| `className` | `string` | - | |

| `ToggleGroup` prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<{ value, label, disabled? }>` | - | |
| `name` | `string` | - | Required. It is what makes a set of radios one group to the browser. |
| `multiple` | `boolean` | `false` | Checkboxes instead of radios. |
| `defaultValue` | `string \| string[]` | - | |
| `className` | `string` | - | |

| `a11y` prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | On `Toggle`, an accessible name for an icon-only button. On `ToggleGroup`, a `<legend>` naming the set. |

The group is built from radio and checkbox inputs, not from buttons with
`aria-pressed`. Arrow-key movement, wrapping at the ends, one tab stop
for the whole set, skipping disabled members and form submission all
arrive from the browser; roving tabindex is most of what a toggle group
costs elsewhere. The inputs are clipped rather than hidden, because a
hidden input is not focusable and every one of those behaviours would go
with it.

### Drawer

A modal panel pinned to one edge. A native `<dialog>`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `side` | `'start' \| 'end' \| 'top' \| 'bottom'` | `'end'` | Logical: `end` is the right edge in English and the left in Arabic. |
| `className` | `string` | - | |

| `a11y` prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | `false` | Drives `showModal()` and `close()`. |
| `label` | `string` | - | Accessible name. The platform supplies none. |
| `onClose` | `() => void` | - | Fires on Escape, backdrop click and `close()`. |

A drawer is a modal dialog with different geometry, so it is one. Focus
containment, the inert background, Escape and the top layer are all
`showModal()`. The entry animation is `@starting-style` and the exit a discrete `display` and `overlay` transition, both in CSS, so nothing here holds an "is opening" flag. Page scroll is locked from CSS while the drawer is modal, with `scrollbar-gutter: stable` so the page does not shift. The slide direction mirrors under a `dir="rtl"` attribute on `<html>` or an ancestor; a document made RTL by the CSS `direction` property alone is placed on the correct edge but slides in from the wrong one.

### AlertDialog

A dialog that interrupts and demands a decision.

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | - | Carries `role="alertdialog"` at every tier. |

| `a11y` prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | `false` | |
| `label` | `string` | - | The question, rendered as a heading. |
| `description` | `string` | - | What happens if they say yes. Announced immediately because of the role. |
| `onClose` | `() => void` | - | Fires on Escape and `close()`. |

Three things separate it from `abaabil/dialog`, and they are why it is a
separate component rather than a variant. It requires a description,
because the role announces one on open. It does not light-dismiss, so
"delete everything?" cannot be dismissed by clicking beside it. And it
moves focus to the element marked `data-safe-action`, because the
platform focuses the first focusable child and a confirmation that opens
with Delete focused is one Enter from deleting.

Like dialog and drawer, page scroll is locked from CSS while it is modal, and closing animates out.

### Toast

A transient message, and the live region it lives in.

| `Toast` prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'neutral' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | Applied as `data-variant`. |
| `className` | `string` | - | |

| `ToastRegion` prop | Type | Default | Description |
|---|---|---|---|
| `align` | `'start' \| 'end'` | `'end'` | |
| `position` | `'top' \| 'bottom'` | `'bottom'` | |

| `a11y` prop | Type | Default | Description |
|---|---|---|---|
| `duration` | `number \| null` | `6000` | Milliseconds before `onDismiss`, or `null` to stay. |
| `onDismiss` | `() => void` | - | Remove the toast from your list here. Omitting it renders no close button. |
| `closeLabel` | `string` | `'Dismiss'` | |
| `action` | `ReactNode` | - | A button or link. Warns in development if combined with a duration. |
| `label` (on `ToastRegion`) | `string` | `'Notifications'` | Names the landmark. |

There is no `toast('Saved')` function. An imperative API needs a
module-level store, a subscription and a root you must remember to mount,
which is a state manager shipped inside a component library. You keep the
list; this renders and announces it. If the imperative call is what you
want, sonner and react-hot-toast do it well in about twenty kilobytes.

Mount one `ToastRegion` near the root and leave it there, empty or not.
A live region inserted together with its first message announces nothing
in most screen readers, because there was no region to change. That is
the single most common way this pattern breaks and it cannot be fixed
from inside `Toast`.

Render your toasts as children of `ToastLive` inside `ToastRegion` and politeness is derived from the variant, not left to the caller: `danger` goes in the assertive live region, everything else in the polite one. The `polite` and `assertive` props remain for sorting by hand. Each toast is `aria-atomic`, so it is read whole and adding one does not re-announce the others. The timer pauses on hover, on focus within, and while the tab is hidden, and resumes only when none of those hold. The close button returns focus to where it came from. The region is `position: fixed`, not in the top layer, so a toast fired while a modal dialog or drawer is open sits under the backdrop until the dialog closes.

| `ToastLive` `children` | `ReactNode` | - | Toasts, sorted into the polite and assertive regions by `variant`. |

### Field

The label, description and error wrapper for any form control, including your own. `Fieldset` is the same for a group, `Label` is the bare label.

| `Field` prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | - | Required below `a11y`, as on popover. The control's id; `label` points at it and the description and error ids are `${id}-description` and `${id}-error`. |
| `label` | `ReactNode` | - | Rendered as a real `<label htmlFor={id}>`. |
| `hideLabel` | `boolean` | `false` | Visually hides the label. It stays a real `<label>` in the accessibility tree. |
| `description` | `ReactNode` | - | Help text. |
| `error` | `ReactNode` | - | Error text, rendered under the control. |
| `required` | `boolean` | `false` | Set as the native `required` attribute on the control. The label's mark is drawn from that attribute, so it is never shown over a control that is not required. |
| `children` | `ReactNode \| function` | - | An element, cloned with `id` (and `required`), or a function called with `{ id, describedBy, invalid, required }` that returns the control wired by hand. |
| `className` | `string` | - | Merged with the base class. |

| `Fieldset` prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | - | Required below `a11y`. Description and error ids derive from it. |
| `label` | `ReactNode` | - | Rendered as the `<legend>`. |
| `description`, `error` | `ReactNode` | - | As on `Field`. |
| `className` | `string` | - | |

`Label` takes any `<label>` prop and adds the class.

| `a11y` prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | generated | Optional here; `useId` fills it in. |

At `a11y` the control (a cloned element, or the single spreadable props object a function child receives) gets `aria-describedby` joined from the description and error ids, merged with any `aria-describedby` already on the element rather than replacing it, `aria-invalid` while `error` is set, and `required`. `Fieldset` gets `aria-describedby` on the `<fieldset>`. Both warn in dev without a `label` (a control carrying its own `aria-label`/`aria-labelledby` counts). The error is not a live region: it is announced with the control as part of its description, and announcing a failed submit is the form's job.

`abaabil/field` and `abaabil/field/styled` carry no client directive and render from a Server Component tree. `abaabil/field/a11y` is `"use client"` because of `useId`; pass your own `id` at the lower tiers to stay server-only.

### Otp

A one-time code field: one real `<input>` drawn as a row of boxes.

| Prop | Type | Default | Description |
|---|---|---|---|
| `length` | `number` | `6` | Number of characters. Sets `maxLength` and the `--otp-length` custom property the stylesheet sizes the strip from. |
| `alphanumeric` | `boolean` | `false` | Accept `[A-Za-z0-9]` instead of `[0-9]`, and show the text keyboard instead of the numeric one. |
| `className` | `string` | - | Merged with the base class. |

| `a11y` prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Rendered as a real `<label>`, associated with the input via `htmlFor`/`id`. |
| `hideLabel` | `boolean` | `false` | Visually hides the label; it stays a real `<label>` in the accessibility tree. |
| `description` | `string` | - | Help text wired into `aria-describedby`. |
| `error` | `string` | - | Error message, sets `aria-invalid`, wired into `aria-describedby` alongside the description. |
| `required` | `boolean` | `false` | Passed to the underlying input. |
| `id` | `string` | - | Overrides the generated input id. |
| `onComplete` | `(value: string) => void` | - | Called with the value the moment the entry reaches `length`, from typing, paste or SMS autofill. |

It is a single text field with `autoComplete="one-time-code"`, `inputMode`, `pattern` and `maxLength`, so SMS and password-manager autofill, paste, backspace, selection and mobile keyboards all come from the browser; the six-box look is monospace type, `letter-spacing` and a repeating background. Override `--otp-box-size` (default `--control-height-md`) or `--otp-gap` (default `--space-2`) on `.abaabil-otp` to resize the boxes. `abaabil/otp` and `abaabil/otp/styled` are server-renderable; `abaabil/otp/a11y` is a client component (`useId`), the same split as input.

`className` and `style` land on the wrapper (`.abaabil-otp-group`), which is the flex item in your layout; every other prop lands on the input. The description and error ids derive from the control id: `id="email"` gives `email-description` and `email-error`, the same shape as Field. The error is not a live region: it is read with the control as part of its description, the same policy as Select and Field. The label draws a required mark from the control's own `required` attribute, as Field does.

Below a 22rem viewport the boxes drop to 2rem so six cells fit a 320px screen; set `--otp-box-size` yourself for any other breakpoint.

### Command

A command palette: a native `<dialog>` holding a search input and the actions that match it.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | - | Required. Names the dialog, like popover and menu. |
| `items` | `Array<{ label, value?, group?, keywords?, onSelect?, href?, disabled? }>` | - | `keywords` is a string or array of extra terms the filter matches. `href` renders a real link at `normal`/`styled`. |
| `open` | `boolean` | `false` | Controlled. Rendered as the native `open` attribute at `normal`/`styled` (non-modal). |
| `onClose` | `() => void` | - | Called after an item is chosen. |
| `placeholder` | `string` | - | |
| `emptyText` | `string` | `'No results'` | Shown in place of the list when nothing matches. |
| `className` | `string` | - | |

| `a11y` prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Accessible name for the palette and its input. Omitting it warns in dev. |
| `open` | `boolean` | `false` | Drives `showModal()` and `close()`. |
| `onClose` | `() => void` | - | Fires on Escape, backdrop click, `close()` and after a choice. |
| `shortcut` | `string` | - | A key, for example `'k'`, case-insensitive. Meta or Ctrl plus that key on the document calls `onOpen`. |
| `onOpen` | `() => void` | - | Called when `shortcut` is pressed. |

Two APG patterns and nothing invented: a modal dialog (`showModal()` gives focus containment, the inert background, Escape, focus to the input on open and back to the opener on close) holding an editable combobox with list autocomplete, the same keyboard model as `combobox`. Focus stays on the input; the active option is `aria-activedescendant`. Up and Down wrap and skip disabled items, in the order the groups are drawn, Home and End jump, Enter chooses, and a polite live region reads the result count because a screen reader user cannot see the list shrink. Filtering is a substring match over `label` plus `keywords`, exported as `filterItems` from the normal tier. Every tier is a client component: the query is state.

`href` is followed by assigning `location.href`, a full navigation, at every tier (Enter on the first match at `normal`/`styled`, Enter on the active option at `a11y`). Under a client-side router use `onSelect` and navigate there instead.

### Table

A real `<table>` for a list of records: caption, `<th scope="col">` per column, one row per item. Takes data, not JSX, so the a11y tier can sort the same array before it reaches the same element.

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `Array<{ key, header, align?, width?, cell?, headerProps? }>` | - | `align` is `'start' \| 'end' \| 'center'`, applied as `data-align`. `cell(row)` renders a custom cell. `headerProps` spreads onto that `<th>`. |
| `rows` | `object[]` | - | Keyed by column key, plus an optional `id`. |
| `caption` | `ReactNode` | - | Names the table. Rendered as a visible heading above it. |
| `rowKey` | `string \| (row, index) => Key` | `'id'` | Falls back to the index. |
| `scrollProps` | `object` | - | Merged onto the scroll wrapper, under the a11y tier's role, tab stop and label. |
| `captionProps` | `object` | - | Merged onto the `<caption>`, under its id. |
| `className` | `string` | - | On the `<table>`. Rest props go there too. |

| `a11y` prop | Type | Default | Description |
|---|---|---|---|
| `columns[i].sortable` | `boolean` | `false` | Header becomes a `<button>` and the `<th>` carries `aria-sort`. |
| `columns[i].compare` | `(a, b) => number` | - | Replaces the default comparator (`localeCompare` when either side is a string, subtraction otherwise). Never called with `null` or `undefined`; empty cells sort last in both directions. |
| `onSort` | `({ key, direction }) => void` | - | Fires on every change. `direction` is `'none' \| 'ascending' \| 'descending'`; `key` is `null` when `none`. |
| `stickyHeader` | `boolean` | `false` | Adds `abaabil-table--sticky`. Give the wrapper a `max-block-size` for it to matter. The header sticks inside the wrapper, never to the page, because the wrapper is a scroll container; a header that follows the page needs the wrapper's overflow removed. |

The wrapper is `overflow-x: auto`, and at the a11y tier it is also `tabIndex=0`, `role="region"` and `aria-labelledby` the caption, the WAI pattern for a scrollable table: without it the columns off the right edge are unreachable from a keyboard. Warns in development when there is no `caption` and no `aria-label`. Sorting is uncontrolled and cycles none, ascending, descending; the arrow is drawn in CSS from `aria-sort`, so the state has one source and is never read out twice. `a11y` uses `useId` and `useState`, so it carries `'use client'` while the other two tiers render from a Server Component with zero client JS.

The wrapper is a tab stop only while columns overflow: a `ResizeObserver` sets `tabIndex` to -1 when the table fits, so narrow tables add no empty stop.

### NavigationMenu

Site navigation: a `<nav>` around a list of links, where an entry with children is a `<button popovertarget>` and a popover panel of more links. The browser supplies opening, closing on an outside click, Escape, the top layer and one panel open at a time; CSS anchor positioning puts the panel under its trigger. Nothing measures the DOM.

This is navigation, not a menu. No tier sets `role="menu"` or `role="menuitem"`; the panels hold links, and the APG calls that a disclosure navigation. Use `abaabil/menu` for a list of actions.

Like popover, `id` is required rather than generated: each panel is `${id}-${index}`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | - | Required. Panel ids derive from it. |
| `items` | `Array<{ key?, label, href?, current?, items?: Array<{ key?, label, href, description? }> }>` | - | An entry with `items` renders a trigger and a panel; otherwise a link. `current` is applied as `data-current`. |
| `className` | `string` | - | |

| `a11y` prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Names the `<nav>`. Warns in development without one, since a page with several navigation landmarks announces each as "navigation". |
| `openOnHover` | `boolean` | `false` | Also opens a panel after the pointer rests on its trigger for 150ms, mouse and pen only. Click still works. |

`a11y` also adds `aria-current="page"` on the current link, a live `aria-expanded` on each trigger read from the panels' own `toggle` events, ArrowDown on a trigger to open its panel and focus the first link, and ArrowDown and ArrowUp inside a panel to move between its links, and ArrowUp on the first link or Escape anywhere in the panel to close it and return focus to the trigger. Tab walks links and triggers in order; there is no roving tabindex and no `aria-haspopup`, both of which belong to menus.

`abaabil/navigation-menu` and `abaabil/navigation-menu/styled` render in a Server Component tree with no client JavaScript; `abaabil/navigation-menu/a11y` is a client component.

### ContextMenu

A region that owns a menu of actions, opened by right-click, by a long-press on Android, or from the keyboard with Shift+F10 and the ContextMenu key. Built on the native Popover API, so the top layer, outside-click dismissal and Escape come from the browser. The panel is placed at the pointer by two inline properties and clamped to the viewport once after opening: no portal, no scroll or resize listener.

`id` is required rather than generated, like popover and menu. Items share menu's shape, so one array can feed both.

iOS Safari fires no `contextmenu` on long-press, and this component adds no timer to fake one; on iOS the region is a plain region, so give the actions another route.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | - | Panel id. Required. |
| `items` | `Array<{ key?, label, href?, onSelect?, disabled? }>` | - | An item with `href` renders an `<a>`, otherwise a `<button>`. |
| `children` | `ReactNode` | - | The region the menu belongs to. |
| `className` | `string` | - | Merged onto the wrapping element. |

| `a11y` prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Names the menu. Warns in development when missing. |

`a11y` also adds `role="menu"`/`role="menuitem"`, a roving tabindex, Up/Down with wrapping, Home/End, multi-character typeahead, Tab to close, Escape to close and return focus to where it was, and focus moving to the first item on open. Shift+F10 and the ContextMenu key open the panel at the region's top-left corner; the wrapper gets `tabIndex={0}` so a region with nothing focusable in it is reachable, and `tabIndex={-1}` turns that off. No `aria-haspopup` on the region: that attribute describes a control, and a region is not one.

`abaabil/context-menu` and `abaabil/context-menu/styled` carry no client directive but attach `onContextMenu`, so they render only below a client boundary; `abaabil/context-menu/a11y` is a client component.

A disabled `href` item keeps its element but loses the `href`; `a11y` marks it `aria-disabled`, the other tiers `data-disabled`.

### Menubar

The W3C APG menubar pattern: File, Edit, View across the top, Left and Right moving between them. It is a container for the consumer's own `Menu` elements, the way Toolbar is a container for arbitrary controls, so nothing about opening, closing, light dismiss or the items inside is implemented twice.

```jsx
<Menubar label="Application">
  <Menu id="file" trigger="File" items={fileItems} />
  <Menu id="edit" trigger="Edit" items={editItems} />
</Menubar>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | - | |

`a11y` adds `role="menubar"`, `aria-orientation="horizontal"`, `role="menuitem"` on each menu's trigger, a roving tabindex so the whole bar is one tab stop, ArrowLeft/ArrowRight with wrapping, Home/End, and ArrowDown to open the focused menu. While a menu is open, ArrowLeft/ArrowRight close it and open the neighbour, so a keyboard user sweeps across the bar the way a mouse user drags across it:

| `a11y` prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Accessible name. An unnamed menubar is announced as "menu bar" and nothing else. |

Use the `a11y` tier of `Menu` inside the `a11y` tier of `Menubar`: the bar finds each trigger by its `abaabil-menu__trigger` class and reads the menu's own `aria-expanded` to know which one is open. Escape, Up/Down and typeahead inside a panel stay the menu's; the bar only claims a key the menu has not already handled.

`abaabil/menubar` and `abaabil/menubar/styled` render in a Server Component tree with no client JavaScript; `abaabil/menubar/a11y` is a client component.

### Carousel

A scroll-snap list with a previous and a next button. The track is an overflow container, so touch and trackpad drag, momentum, snapping, right-to-left and arrow-key scrolling all come from the browser; each button calls `scrollBy` on it. No autoplay.

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `ReactNode[]` | - | One slide each. Or pass `children`, one slide per child. |
| `loop` | `boolean` | `false` | Next at the last slide returns to the first, Previous at the first goes to the last. |
| `prevLabel` | `string` | `'Previous'` | Visually hidden; the arrow is drawn in CSS. |
| `nextLabel` | `string` | `'Next'` | |
| `className` | `string` | - | |

Set `--carousel-per-view: 3` on the carousel to show three slides at once. Reduced motion is honoured twice: the stylesheet drops `scroll-behavior: smooth`, and the buttons pass `behavior: 'auto'` when `prefers-reduced-motion` is set, because a `scrollBy` argument overrides the stylesheet.

| `a11y` prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | - | Names the region. Warns in development without one. |

The wrapper becomes a `region` with `aria-roledescription="carousel"`, each slide a `group` named "n of N", the track enters the tab order as a named `group` so arrow keys page it, both buttons carry `aria-controls` for the track and `aria-disabled` at the ends when not looping, and a polite live region says "Slide n of N" once a scroll settles (native `scrollend`, or 150ms after the last `scroll` event where that does not exist).

`abaabil/carousel` and `abaabil/carousel/styled` render in a Server Component tree with no client JavaScript; `abaabil/carousel/a11y` is a client component.
