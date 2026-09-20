# abaabil

Minimal, themeable, accessible React components. Zero dependencies.

## Install

```
npm install abaabil
```

`react` and `react-dom` are peer dependencies (`^19.0.0`); abaabil has zero runtime dependencies of its own.

## The three tiers

Every component ships as three separate entry points so you only pay for what you use. Each tier is a superset of the one before it: `styled` adds abaabil's CSS on top of `normal`, and `a11y` adds ARIA wiring and keyboard handling on top of `styled`.

| Tier | Adds | button | dialog | combobox |
|---|---|---:|---:|---:|
| normal | unstyled, semantic markup | 190 B | 162 B | not tracked in `SIZES.md` |
| styled | abaabil's CSS classes/tokens | 86 B | 86 B | not tracked in `SIZES.md` |
| a11y | ARIA attributes, keyboard interaction, focus management | 541 B | 567 B | 1064 B |

All sizes above are gzipped, measured with React treated as external (peer, not bundled), taken from the project's `SIZES.md` build output.

Import the tier you need directly:

```js
import Button from 'abaabil/button/a11y'
import Dialog from 'abaabil/dialog/a11y'
import Combobox from 'abaabil/combobox/a11y'
```

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
