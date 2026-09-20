# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
