# Working in this repository

For coding agents. `llms.txt` is the other file: that one is for agents
*using* the library, this one is for agents *changing* it.

## Before you start

```bash
npm install
npm run build     # build-css, rollup, check-directives, measure
npm test          # 383 tests
```

`npm run build` is also a gate. It fails if a `"use client"` directive
went missing or appeared where it should not, and if any entry point
exceeds its size budget. Do not raise a budget to make a build pass
without saying why in the commit message.

## The architecture, in one paragraph

Every component is a directory under `src/` with three tiers and one
stylesheet: `index.jsx` (structure, no CSS, no ARIA), `styled.jsx` (adds
the stylesheet, nothing else), `a11y.jsx` (adds labels, ARIA and
keyboard). Each tier is a separate entry point in the `exports` map, so a
consumer pays only for the tier they import. Nothing is exported from the
package root, on purpose.

## Rules that are enforced, not just preferred

`test/tiers.test.jsx` will fail you for breaking any of these:

- **The normal tier has no `aria-*` and no `role`.** The one exception is
  `switch`, whose `role="switch"` is its identity rather than wiring, and
  that exception is named in `IDENTITY_ROLE` and separately asserted. Add
  to that list only with a reason of the same kind.
- **`styled.jsx` is exactly two lines**: import the CSS, re-export the
  normal tier. If you need more, it belongs in `index.jsx`.
- **`a11y.jsx` imports its own stylesheet directly**, even though
  `styled.jsx` already does. This is not redundant: Rollup collapses
  pass-through re-export chains and has silently dropped that import
  before, shipping two tiers unstyled. `scripts/check-package.js` walks
  the built graph to prove the CSS is still reachable.
- **No `forwardRef`.** React 19 passes `ref` as a plain prop.
- **`"use client"` appears only where hooks do.** The expected value for
  every one of the 39 entry points is written down twice, in
  `test/tiers.test.jsx` and `scripts/check-directives.js`, and a test
  asserts the two agree.

## Conventions

- Plain JavaScript and JSDoc. No TypeScript.
- No semicolons, single quotes, two-space indent.
- CSS uses logical properties (`padding-inline`, `inset-inline-start`)
  so right-to-left works with no per-language override. `test/` has no
  RTL test; the docs site has a page for it.
- All component CSS goes in the `abaabil.components` cascade layer.
- Reach for the platform before writing JavaScript. `<dialog>`,
  `<details>`, the Popover API and native form controls already do most
  of this work, and a component that wraps one is the house style.

## Adding a component

1. `src/<name>/{index,styled,a11y}.jsx` and `src/<name>/<name>.css`.
2. Three entry points plus `./<name>.css` in `package.json` `exports`.
   The build and the CSS-reachability guard both derive their component
   list from this map, so nothing else needs a list edited.
3. Add its files to both arrays in `scripts/check-directives.js`.
4. Add size budgets in `scripts/measure.js`.
5. Add the name to `COMPONENTS` in `test/tiers.test.jsx`, and write
   `test/<name>.test.jsx` covering both tiers plus an axe pass.
6. Add a case to the axe sweep in `test/a11y.test.jsx`.
7. Update `README.md` (component list, the RSC table, a props section),
   `llms.txt`, and `CHANGELOG.md`.

## Releasing

`npm version` is not wired up; edit `package.json` by hand and add the
matching `CHANGELOG.md` heading. `scripts/check-package.js` fails the
publish if the two disagree, which is the whole point of that check.

Publishing requires the maintainer's 2FA, so an agent cannot complete
`npm publish` on its own. Prepare the release and hand it over.

## Where the numbers come from

Every size figure in `README.md` and on the docs site is generated, never
typed. The scripts live in the **docs site** repo at `scripts/compare/`:
`delivered.mjs` measures this package, `measure.mjs` measures it against
nine other libraries. Hand-copied figures went stale twice and shipped
false claims both times.
