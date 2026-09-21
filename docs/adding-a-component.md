# Adding a component, end to end

This spans two repositories and has an order that matters. The site
installs the library from npm, so it cannot reference a new component
until that component is published. Doing these out of order leaves the
site unbuildable, and pushing in that state breaks the deployment.

Two scripts check most of this for you. `npm run build` in each repo runs
a registration check that fails if a component is missing from any of the
places it has to be listed. They cannot check prose, judgement, or
whether the thing is any good.

---

## 1. Build it, in `abaabil.ui`

Follow "Adding a component" in `AGENTS.md` for the mechanics. In short:
three tiers plus a stylesheet under `src/<name>/`, four entries in the
`exports` map, pins in `scripts/check-directives.js`, budgets in
`scripts/measure.js`, the name in `test/tiers.test.jsx`, a
`test/<name>.test.jsx`, and a case in the axe sweep.

```bash
npm run build     # the registration check names anything you missed
npm test
```

Decide before writing any code: **is there a native element for this?**
If there is, wrap it. Most of this library is small because the browser
already does the work, and a component that reimplements something the
platform ships is the one kind of addition that does not belong here.

## 2. Document it, in `abaabil.ui`

- `README.md`: the component list at the top, a row per entry point in
  the Server Components table, and a `### Name` props section.
- `llms.txt`: add it to the names list, and add a bullet under "Per
  component notes an agent will otherwise get wrong" **if there is
  something to get wrong**. An entry that says nothing surprising is
  noise in a file whose whole value is being short.
- `CHANGELOG.md`: a new version heading. `scripts/check-package.js`
  fails the publish if it does not match `package.json`.

Bump `package.json` by hand. Minor version for new components.

## 3. Publish

```bash
npm run build && npm test
npm publish       # needs the maintainer's 2FA; an agent cannot finish this
```

The registry takes a couple of minutes to serve the new version, and
npm's local cache is slower still. Wait for it:

```bash
curl -s https://registry.npmjs.org/abaabil | python3 -c "import sys,json;print(json.load(sys.stdin)['dist-tags'])"
```

Then commit and push `abaabil.ui`.

## 4. Point the site at it, in `abaabil.web`

```bash
npm install --prefer-online abaabil@^<new version>
```

`--prefer-online` is not optional. Without it npm serves a cached package
listing, decides the version does not exist, and fails.

## 5. Re-measure

Nothing on the site quotes a number that a human typed. Two data files
feed everything:

```bash
cd scripts/compare
npm install
npm run all
cp results.json ../../src/data/comparison.json
cp delivered.json ../../src/data/delivered.json
```

`delivered.mjs` needs the new component in its `COMPONENTS` list, and
`spec.mjs` needs a row for it under **every** library, with `null` where
that library has no equivalent. That row is what puts the component in
the comparison table on `/why`.

## 6. Wire it into the site

- `src/pages/components/<Name>.jsx`, modelled on an existing page:
  specimen header, a live example at the `a11y` tier, the three imports,
  whatever is worth explaining, then a props table.
- A `<Route>` in `src/App.jsx`.
- A link in `src/rail.jsx`, positioned by what the component is for
  rather than alphabetically.
- An entry in `ROUTES` in `scripts/prerender.js`, with a description
  **under 160 characters**. Quote byte figures with `gz()`, never typed.
- A `SERVER_SAFE` entry in `src/lib/weights.js`. This is the one fact
  here that is not measured, so it has to be declared.

`npm run build` will name anything you missed.

## 7. The prose that goes stale

None of this is checkable, and all of it has been wrong at least once:

- **Component counts.** "Eight components" appears in the homepage lede,
  a homepage heading, `index.html`'s default description, the JSON-LD in
  `scripts/prerender.js`, and the kitchen sink's comment. Grep for the
  number word, not the digit.
- **`/why`.** New components need rows in the comparison table, which
  comes from `spec.mjs`, and the amortisation paragraph quotes ratios
  that shift when the component count changes. Recompute them; do not
  assume they moved by a rounding.
- **The kitchen sink.** If the new component belongs in a form, put it
  there and update the count in its comment. If it does not, say which
  components are excluded and why rather than quietly leaving the claim
  wrong.
- **`llms.txt` on the site** is generated, so it follows. The one in the
  package is not; see step 2.

## 8. Verify, then push

Build, serve `dist/`, and look at it. Every time:

- the new route returns real body text, not an empty `<div id="root">`
- no console output at all, which is what a clean hydration looks like
- the component actually works after hydration, not just that it rendered
- no horizontal page overflow at 400px

Then commit and push. Vercel deploys from `main`.

---

## The order, condensed

```
abaabil.ui:   build -> test -> document -> version -> publish -> push
abaabil.web:  install -> re-measure -> pages/routes/rail -> prose -> verify -> push
```

The one hard constraint is that publish comes before the site's install.
Everything else can be reordered, but this order means each step's check
can actually run.
