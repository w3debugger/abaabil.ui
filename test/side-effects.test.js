// @vitest-environment node
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

// THE BUG THIS EXISTS FOR
//
// package.json said `"sideEffects": ["*.css"]`, which is the advice you
// find everywhere and which is wrong for this package. It marks every
// .js file in the library as free of side effects, and a bundler is
// then entitled to delete any module whose exports it can satisfy from
// somewhere else.
//
// Every `styled.js` is exactly that module: `import './x.css'` followed
// by a re-export of `index.js`. Rollup drops the whole file, rewrites
// the import to point at index.js, and the stylesheet goes with it. So
// `import Button from 'abaabil/button/styled'` shipped no CSS, in any
// Vite or Rollup build, for every component, since the field was added.
// The tier whose entire purpose is "adds the component's stylesheet"
// did not.
//
// It went unseen because this library's own site imports the a11y tier
// everywhere, and a11y tiers contain real code, so they survive. It
// surfaced only when collapsible shipped an a11y tier that is a pure
// re-export like the styled ones, and the site's build asserted the
// page had no CSS.
//
// The rule, stated once: a module that imports a stylesheet has a side
// effect, and package.json has to say so.

const root = new URL('../', import.meta.url)
const read = (p) => readFileSync(new URL(p, root), 'utf8')
const pkg = JSON.parse(read('package.json'))

const components = readdirSync(new URL('dist/', root), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)

const importsCss = (file) => /import\s*["'][^"']*\.css["']/.test(read(file))

// The patterns in `sideEffects`, as predicates over dist paths.
const matchers = pkg.sideEffects.map((pattern) => {
  const source = pattern
    .replace(/^\.\//, '')
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\u0000/g, '.*')
  // A bare pattern with no slash matches a basename anywhere.
  const re = pattern.includes('/')
    ? new RegExp(`^${source}$`)
    : new RegExp(`(^|/)${source}$`)
  return (path) => re.test(path)
})

const declaredSideEffectful = (path) => matchers.some((m) => m(path))

describe('sideEffects covers every module that imports a stylesheet', () => {
  // dist/ has to exist for this to mean anything. Running the suite
  // without building would otherwise pass by having nothing to check.
  it('has a built dist to check', () => {
    expect(components.length).toBeGreaterThan(0)
  })

  for (const name of components) {
    for (const tier of ['index', 'styled', 'a11y']) {
      const file = `dist/${name}/${tier}.js`
      if (!existsSync(new URL(file, root))) continue

      it(`${file}`, () => {
        if (!importsCss(file)) return
        expect(
          declaredSideEffectful(file),
          `${file} imports a stylesheet but package.json's sideEffects does not ` +
            `cover it, so a bundler may delete the module and the CSS with it. ` +
            `Current: ${JSON.stringify(pkg.sideEffects)}`,
        ).toBe(true)
      })
    }
  }
})
