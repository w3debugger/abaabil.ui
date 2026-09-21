# Adding a component, end to end

Two repositories, one hard ordering constraint: the site installs the
library from npm, so nothing can reach the site until it is published.
Doing these out of order leaves the site unbuildable, and pushing in
that state breaks the deployment.

```
abaabil.ui    decide → build → test → document → version → PUBLISH → push
                                                              │
                                                              ▼
abaabil.web   install → re-measure → wire up → prose → verify → push
```

Two scripts check most of this. `npm run build` in each repo runs a
registration check that fails if a component is missing from any of the
places it has to appear. They cannot check prose, judgement, or whether
the thing is any good.

---

## 0. Decide, before writing any code

**Is there a native element for this?** If there is, wrap it.

Most of this library is small because the browser already does the
work: `<dialog>` with a real top layer and focus trap, `<details name>`
for exclusive accordions, the Popover API, native form controls. Eight
of the twenty-three components need no client JavaScript at all for
that reason.

A component that reimplements something the platform ships is the one
kind of addition that does not belong here.

Then decide what the three tiers mean for it:

| tier | contains |
|---|---|
| `abaabil/<name>` | structure only. No CSS, no ARIA. |
| `abaabil/<name>/styled` | adds the stylesheet. Two lines more than the above. |
| `abaabil/<name>/a11y` | adds labels, ARIA wiring, keyboard and focus. |

`'use client'` goes only on tiers that actually use a hook. The build
gate enforces it in both directions: a directive on a tier that needs
none fails, and so does a missing one.

---

## 1. Build it, in `abaabil.ui`

Follow "Adding a component" in `AGENTS.md` for the mechanics. Every
file below was found by listing what an existing component touches, not
from memory.

**Guarded** — `scripts/check-complete.js` fails the build naming what
is missing:

| file | what to add |
|---|---|
| `src/<name>/index.jsx` | structure tier |
| `src/<name>/styled.jsx` | + the stylesheet import |
| `src/<name>/a11y.jsx` | + ARIA, keyboard, focus |
| `src/<name>/<name>.css` | the styles |
| `package.json` | four `exports` entries: three tiers and the CSS |
| `scripts/check-directives.js` | the `'use client'` pin per tier |
| `scripts/measure.js` | a size budget per entry point |
| `test/tiers.test.jsx` | the name in `COMPONENTS` |
| `test/<name>.test.jsx` | its own tests |
| `test/a11y.test.jsx` | a case in the axe sweep |
| `README.md` | component list, Server Components row, `### Name` props |
| `llms.txt` | the name in the list |

**Not guarded** — nothing will tell you:

| file | when |
|---|---|
| `CHANGELOG.md` | always. `check-package.js` only checks it matches `package.json`, not that it describes anything. |
| `src/tokens/semantic.css` | only if the component needs a token no other has. Adding one means adding its contrast pairing to `test/contrast.test.js`. |

**Generated, leave alone**: `SIZES.md` (written by `scripts/measure.js`),
`dist/`.

```bash
npm run build     # registration check, then the size budgets
npm test
```

### Two failure modes the test suite is shaped around

**A selector that matches nothing looks exactly like one never
written.** No error, no warning, just an element wearing different
styles than intended. `test/css-selectors.test.js` requires every class
a component renders to have a rule in its stylesheet, or an entry in an
explicit allowlist with a reason. A doubled prefix
(`.abaabil-abaabil-popover__trigger`) once shipped in a release and
survived a browser audit and a contrast sweep.

**Contrast fails in states nobody renders.** `test/contrast.test.js`
holds a pairing per theme for every combination that occurs in a
component, computed from the token sources. It covers hover, not just
resting: a filled button's label sits on the fill in every state, and
the stock blue once passed at rest and failed at 3.98:1 hovered. If the
new component introduces a pairing none of the existing ones have, add
it.

---

## 2. Document it, in `abaabil.ui`

- `README.md`: the component list at the top, a row per entry point in
  the Server Components table, and a `### Name` props section.
- `llms.txt`: the names list, and a bullet under "Per component notes an
  agent will otherwise get wrong" **only if there is something to get
  wrong**. An entry that says nothing surprising is noise in a file
  whose whole value is being short.
- `CHANGELOG.md`: a new version heading. `scripts/check-package.js`
  fails the publish if it does not match `package.json`.

Bump `package.json` by hand. Minor for new components, patch for fixes.

---

## 3. Publish

```bash
npm run build && npm test
npm publish       # needs the maintainer's 2FA; an agent cannot finish this
```

The registry takes two or three minutes to serve the new version, and
npm's local cache is slower still:

```bash
curl -s https://registry.npmjs.org/abaabil \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['dist-tags'])"
```

Then commit and push `abaabil.ui`.

---

## 4. Point the site at it, in `abaabil.web`

```bash
npm install --prefer-online abaabil@^<new version>
```

`--prefer-online` is not optional. Without it npm serves a cached
listing, decides the version does not exist, and fails.

---

## 5. Re-measure

Nothing on the site quotes a number a human typed. Two data files feed
everything, and both are written by the harness.

Before running it, the harness needs the component in **two** lists:

| file | what |
|---|---|
| `scripts/compare/delivered.mjs` | the name in `COMPONENTS` |
| `scripts/compare/spec.mjs` | a row under **every** library, `null` where that library has no equivalent |

Neither is checked before the fact. A component missing from
`delivered.mjs` simply has no measured figure, and the site's
registration check then fails with "no measured figure in
comparison.json", one step later than the actual mistake.

**Deciding what goes in each `spec.mjs` row** is research, not
guesswork, and the rule is published on `/why` so it can be held to:

- The library must ship a component *for that purpose*. A generic
  layout primitive is not a toolbar: Ant Design's `Space`, Mantine's
  and Chakra's `Group`, shadcn's `ToggleGroup` are not counted.
- A generic input that accepts `type="file"` is not a file component.
  That excludes Material UI and React Bootstrap as well as shadcn.

Apply it to this library too. Four libraries were once credited with a
toolbar none of them ships.

```bash
cd scripts/compare
# Bump the abaabil pin in THIS directory's package.json first. It keeps
# its own copy of the library, separate from the one the site builds
# against, and a plain `npm install` here reinstalls whatever that pin
# says. It sat at 1.1.0 for three releases, so the install silently
# downgraded the library and the harness measured the wrong one.
npm install --prefer-online
npm run all
cp results.json ../../src/data/comparison.json
cp delivered.json ../../src/data/delivered.json
```

`measure.mjs` exits non-zero **without writing** if any build fails, so
a partial measurement cannot reach the site. `check-complete.js` then
refuses a build where the recorded version differs from the installed
one.

---

## 6. Wire it into the site

**Guarded** — the site's `check-complete.js` names what is missing:

| file | what |
|---|---|
| `src/pages/components/<Name>.jsx` | specimen header, live example at the `a11y` tier, the three imports, a props table |
| `src/pages.js` | an entry in `PAGES`, as a **dynamic** import |
| `src/rail.jsx` | a link, positioned by purpose, not alphabetically |
| `scripts/prerender.js` | an entry in `ROUTES`, description **under 160 characters**, byte figures via `gz()` |
| `src/lib/weights.js` | a `SERVER_SAFE` entry — the one fact here that is not measured |

**Not guarded** — nothing will tell you, and the component silently
goes missing from a table or a sentence:

| file | what | what breaks |
|---|---|---|
| `src/lib/component-order.js` | the name, in purpose order | the component is absent from the `/why` table and every `/compare` page |
| `src/pages/Why.jsx` | the hand-written array in the CSS-weights table | absent from that table only |
| `src/pages/Overview.jsx` | the lede, which names every component | the sentence quietly lists one fewer |
| `src/pages/kitchen-sink-form.jsx` | only if it belongs in a form | the page's claim about what it composes goes stale |

That is **four** hand-maintained lists of all twenty-three components,
plus the two in `scripts/compare`. They must agree and nothing enforces
it. If you are adding a component and have time for one improvement
beyond it, make these derive from `component-order.js`.

### Then decide whether the page needs a runtime

Thirty of thirty-nine pages ship no JavaScript. A page gets the React
runtime only if something on it must change after load in a way CSS and
the platform cannot manage. The list is `NEEDS_RUNTIME` in
`scripts/prerender.js`, established by experiment, not opinion:

```bash
HYDRATE=none npm run build   # strip the runtime everywhere
# then drive the new page and see whether its demo still works
```

Work unaided: accordion (`<details>`), popover (Popover API), switch,
select, slider, radio, input, file — native elements doing their own
job. Need the runtime: dialog, combobox, tabs, menu, toolbar, checkbox,
tooltip.

Add the route to `NEEDS_RUNTIME` only if the demo genuinely breaks
without it. A demo that is not running the real component is not
demoing the library.

**Do not make the page import static.** That is what produced a single
bundle carrying every page, so `/components/dialog` downloaded `/why`'s
comparison tables to render a dialog.

### Regenerate the share card

The component count is on it, so a new component makes it wrong:

```bash
node scripts/og-image.js      # needs rsvg-convert: brew install librsvg
```

The build fails if you forget, naming the field that drifted.

---

## 7. The prose, and what is derived

Most of what used to go stale is now computed and cannot:

- component and rival counts, from `src/lib/counts.js`
- versions, ratios and percentages, from the two data files
- the share card and its alt text, from `scripts/og-image.js`
- meta descriptions, with a build-time 160-character limit

What still needs a human:

- **`/why`'s argument.** New components change the amortisation
  paragraph's ratios. They are computed now, but the sentence around
  them is not: check it still says something true.
- **The kitchen sink.** If the component belongs in a form, put it
  there. If it does not, the page says which components are excluded
  and why; keep that honest.
- **`/compare`'s "when to choose them instead"** per rival, if the new
  component changes the coverage story.

If you find yourself typing a number, stop and derive it. Today's
session found stale typed facts in the share card, `llms.txt`, the
footer, the setup page and the comparison harness's own pin.

---

## 8. Verify, then push

Build, serve `dist/`, and look at it. Every time:

- the new route returns real body text, not an empty `<div id="root">`
- no console output at all, which is what a clean hydration looks like
- the component actually works after hydration, not just that it
  rendered
- no horizontal page overflow at 400px
- **it is actually styled.** The build asserts every component on a page
  has its stylesheet inlined, because splitting the bundle once left
  every component on thirty pages unstyled and it shipped.

Serve with a server that maps `/why` to `/why/index.html`. `vite
preview` falls back to the homepage for extension-less paths, which
silently tests the wrong page.

Then commit and push. Vercel deploys from `main`.

---

## The order, condensed

```
abaabil.ui:   decide → build → test → document → version → publish → push
abaabil.web:  install → re-measure → wire up → runtime? → prose → verify → push
```

The one hard constraint is that publish comes before the site's
install. Everything else can be reordered, but this order means each
step's check can actually run.

---

## What the checks cannot do

They verify **registration**: is it wired into every place it has to
be. They cannot verify **judgement**: whether it wraps the platform
rather than reimplementing it, whether the a11y tier is right, whether
the demo is honest, whether the numbers mean what the prose claims.

Both of the worst bugs found on the day this file was rewritten — a
selector that matched nothing, and CSS missing from thirty pages —
passed every check that existed at the time and were caught by eye.
Each now has a guard. The next one will not.

Use the component. Look at the page.
