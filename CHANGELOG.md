# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.3.0] - 2026-09-21

### Added

Five components, taking the library from thirteen to eighteen. Two of
them are the things people ask for most and are hard; three are nearly
free because the platform already does the work.

- **`abaabil/menu`** - the W3C APG menu button pattern on top of the
  native Popover API. The browser supplies the top layer, the
  outside-click dismissal and Escape; this supplies `role="menu"`, a
  roving tabindex, Up/Down with wrapping, Home/End, multi-character
  typeahead, Tab to close, and focus moving into the menu on open and
  back to the trigger on close. `aria-expanded` is driven by the panel's
  own `toggle` event rather than a second copy of the open state, since
  the browser can close the panel without telling the component. Its
  docs say when a menu is the wrong widget: a button revealing
  navigation links is a popover, not a menu.
- **`abaabil/tooltip`** - shows on `:hover` and `:focus-within`, which
  are selectors, so the `normal` and `styled` tiers need no JavaScript
  at all. The `a11y` tier adds the two things CSS cannot: the
  `aria-describedby` that makes a screen reader read it, and Escape to
  dismiss, which WCAG 1.4.13 requires. The docs lead with when not to
  use one.
- **`abaabil/progress`** - native `<progress>`. `value` has no default,
  so omitting it gives a genuinely indeterminate bar rather than one
  claiming to be 0% done. `valueText` sets `aria-valuetext`, because a
  bar whose number is not a percentage is otherwise announced as one.
- **`abaabil/slider`** - native `<input type="range">`, so the keyboard
  support and the min/max/step arithmetic are the platform's.
  `formatValue` sets `aria-valuetext` and the optional visible
  `<output>`, which is marked `aria-hidden` so the value is not
  announced twice.
- **`abaabil/breadcrumb`** - a `<nav>` around an ordered list, because
  the order is the information. Server-renderable at every tier. The
  separator is drawn in CSS so it is never read aloud, the `<nav>` is
  named, and the last item renders as text with `aria-current="page"`.

Thirty-six of the fifty-four entry points now carry no client directive.
Six components are server-renderable at every tier including `a11y`, up
from four.

`role="tooltip"` is deliberately **not** in tooltip's `normal` tier,
unlike `role="switch"` in switch's. The difference: a switch's role
changes how a reachable interactive control is announced, so it does
something on its own. A tooltip is only ever reached through the
`aria-describedby` on its trigger, so the role without that association
announces nothing, and it belongs with the wiring that gives it meaning.

Three bugs were found by driving these in a real browser, after 511
jsdom tests had passed. All three are the same shape: jsdom does not run
the thing that was broken.

- Menu focused its first item inside `requestAnimationFrame`, which does
  not fire in a background tab, so focus silently never moved there. The
  `toggle` event already fires with the panel in the top layer and
  focusable, so the focus call is synchronous now.
- Menu read the active index from state, so two keydowns arriving in the
  same tick both moved one step from the same origin: holding ArrowDown
  advanced one item and stopped. The index is a ref now. Covered by a
  test that dispatches two raw events inside one `act`, which is the
  only way to reproduce it, since `fireEvent` flushes between calls.
- Tooltip put its fade on the shown state, so whenever the transition
  did not advance the bubble stayed at opacity 0 while every selector
  said it should be visible: a tooltip that silently never appears. The
  fade is on the hidden state now and showing is instant, which is also
  the better behaviour for a tooltip.

Two more came out of a full accessibility audit of all eighteen
components, run with axe against a real browser. Both were silent: the
component looked right, the tests passed, and the thing it claimed to add
was being discarded.

- **`popover/a11y` was not naming its panel at all.** A bare
  `<div popover>` has no role, and `aria-label` is prohibited on a
  generic element, so the label was dropped: the panel computed to role
  `null` with no accessible name, and axe flags it as
  `aria-prohibited-attr`. The panel is `role="group"` now, overridable
  with `role`. Naming the panel was this tier's entire contribution, so
  until now it added 484 bytes and achieved nothing.
- **`progress/a11y` was not naming its bar.** `<progress>` is a labelable
  element, so `<label for>` is not wrong, but no accessible name is
  computed from it: axe names an `<input>` from identical markup and
  names neither `<progress>` nor `<meter>`. `aria-labelledby` now points
  at the label, making the name explicit instead of leaving it to differ
  between implementations.

The audit itself had to be redone once. The first pass rendered the
dialog open, and a modal dialog makes everything behind it inert, so the
sweep that reported zero violations had not actually examined the other
seventeen components.

### Fixed

- `dist/combobox/index.js` and `dist/combobox/styled.js` had no size
  budget. Combobox was the first component built and only its `a11y`
  tier was ever listed, so two entry points had been unwatched since
  1.0.0. Found by the new registration check, not by noticing.

### Added (tooling)

- `llms.txt`, shipped inside the package. It is the short version of the
  README written for coding agents: the rules that are easy to get wrong
  (no root export, import `theme.css` once, prefer the `a11y` tier) and
  the per-component traps (popover needs an explicit `id`, alert has to
  exist before it has a message, combobox and tabs are uncontrolled). An
  agent with `node_modules` can read it without the network. It reaches
  npm with the next release.
- `AGENTS.md` at the repository root, for agents changing the library
  rather than using it: the enforced architecture rules, the conventions,
  and the seven steps for adding a component.

## [1.2.0] - 2026-09-21

### Added

Five components, taking the library from eight to thirteen. Each ships the
same three tiers.

- **`abaabil/textarea`** - a native `<textarea>` with the same label,
  description, error and `aria-describedby` wiring as `input`. The most
  obvious gap in a library that already had five form controls.
- **`abaabil/switch`** - a native checkbox carrying `role="switch"`. The
  role sits in the `normal` tier, not the `a11y` tier: it is the
  component's identity, the way `<dialog>` and `<details>` are for the
  components built on them, and without it the styled tier would look like
  a switch while announcing itself as a checkbox. No `aria-checked`; the
  native `checked` property already exposes the state.
- **`abaabil/popover`** - the native Popover API. The trigger, the top
  layer, light-dismiss and Escape all come from the browser, so all three
  tiers ship **zero JavaScript** and all three are server-renderable. It
  needs an explicit `id` rather than generating one, because generating
  one would mean `useId`, which would mean a client boundary, which would
  cost the component the only property that makes it interesting. It is
  the one component with a floor of its own: Chrome 114, Firefox 125,
  Safari 17.
- **`abaabil/tabs`** - the W3C APG tabs pattern, with roving tabindex,
  arrow keys, Home/End, both orientations and both activation modes. The
  only new component whose `a11y` tier does substantial work, because tabs
  have no native element behind them. Client at every tier for the same
  reason combobox is.
- **`abaabil/alert`** - a live region. The role follows the variant, since
  the right answer is the same every time and getting it wrong is the
  common failure: `info` and `success` announce politely, `warning` and
  `danger` interrupt. Read the caveat in the README about when a live
  region actually announces; it decides whether this works at all.

Also added: `--color-success` and `--color-warning` semantic tokens, which
alert needs and nothing else previously did.

Twenty-six of the thirty-nine entry points now carry no client directive.
Four components are server-renderable at every tier including `a11y`
(button, accordion, popover, alert), up from two.

### Fixed

Documentation errors from 1.1.0, all of the same kind: figures typed in by
hand that had stopped being true.



- Corrected the headline size comparison in `README.md`. It claimed
  `dialog/a11y` at 674 B against `@radix-ui/react-dialog` at 3,422 B. The
  Radix figure was measured by importing only `Dialog.Root`, which renders
  nothing; a dialog you can actually open needs `Root`, `Trigger`, `Portal`,
  `Overlay`, `Content`, `Title` and `Close`, and costs 13,493 B. Both sides
  are now measured the same way, at 580 B against 13,493 B. The correction
  is less favourable to Radix, not more.
- Regenerated the delivered-size table in `README.md`. It was still printing
  1.0.0's figures in the 1.1.0 release, several of them out by more than
  10% (`checkbox/a11y` read 600 B against an actual 534 B, `radio/a11y`
  542 B against 444 B). The table is now generated from the published
  package rather than copied by hand.
- Noted in `README.md` that a `styled` entry can measure a byte or two below
  its `normal` entry. That is compression noise: `styled` is `normal` plus a
  CSS side-effect import, so the JavaScript is identical.

## [1.1.0] - 2026-09-21

### Added

- `abaabil/accordion`, `abaabil/accordion/styled`, and `abaabil/accordion/a11y` now each default-export their main component (`Accordion` and `Accordion_a11y` respectively), in addition to the existing named exports. This was a bug fix, not a feature: every other component in the library default-exports its main component at every tier, and accordion was the only one that did not. The README's own documented import for the `a11y` tier, `import { Accordion } from 'abaabil/accordion/a11y'`, was `undefined` in the published 1.0.0 package, because that tier only exported `Accordion_a11y` as a named export. The default export fixes that import path. Existing named imports (`{ Accordion }` from `abaabil/accordion` or `abaabil/accordion/styled`, `{ Accordion_a11y }` from `abaabil/accordion/a11y`) continue to work unchanged.
- Added a `"./package.json"` entry to the `exports` map, so `require('abaabil/package.json')` and the dynamic-import equivalent resolve instead of failing with `ERR_PACKAGE_PATH_NOT_EXPORTED`. There is still no root `"."` export; that remains unchanged.

### Fixed

- Corrected every accordion import example in `README.md` to match what the package actually exports.

## [1.0.0] - 2026-09-20

### Added

- Initial release: eight components (button, dialog, combobox, input, checkbox, radio, select, accordion), each shipped as three entry-point tiers (`normal`, `styled`, `a11y`).
- Zero runtime dependencies, `react`/`react-dom` as peer dependencies.
- CSS theming via `abaabil/theme.css` and `abaabil/styles.css`.
