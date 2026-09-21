# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added

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
