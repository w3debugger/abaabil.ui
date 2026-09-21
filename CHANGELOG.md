# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

Documentation only. No code in `dist/` changes, so the published 1.1.0 build
is unaffected; these corrections reach npm with the next release.

### Fixed

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
