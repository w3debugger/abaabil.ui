// Registration completeness. Adding a component means touching eight
// places in this repository, and missing one fails quietly: the component
// works, the tests pass, and it is simply absent from a budget, a gate or
// the docs until someone notices months later.
//
// The source of truth is the directories under src/. Everything else has
// to agree with them.
//
// Run by `npm run build`. Plain script, exits non-zero on any gap.

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const read = (p) => readFileSync(join(root, p), 'utf8')
const pkg = JSON.parse(read('package.json'))

const components = readdirSync(join(root, 'src'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== 'tokens')
  .map((d) => d.name)
  .sort()

const directives = read('scripts/check-directives.js')
const measure = read('scripts/measure.js')
const tiers = read('test/tiers.test.jsx')
const axe = read('test/a11y.test.jsx')
const readme = read('README.md')
const llms = read('llms.txt')

// A styled tier that only re-exports a `normal` tier which already
// carries "use client" needs no directive of its own, so the directive
// gate deliberately does not pin it. See the comment on MUST_BE_CLIENT in
// scripts/check-directives.js. Listing them here rather than skipping all
// styled tiers keeps the check honest for the other eleven.
const STYLED_NEEDS_NO_DIRECTIVE = new Set(['combobox', 'tabs', 'command'])

const gaps = []
const need = (ok, component, what) => { if (!ok) gaps.push(`${component}: ${what}`) }

for (const c of components) {
  // 1. Three tiers and a stylesheet on disk.
  for (const tier of ['index', 'styled', 'a11y']) {
    need(existsSync(join(root, 'src', c, `${tier}.jsx`)), c, `missing src/${c}/${tier}.jsx`)
  }
  need(existsSync(join(root, 'src', c, `${c}.css`)), c, `missing src/${c}/${c}.css`)

  // 2. Four entry points in the exports map.
  for (const key of [`./${c}`, `./${c}/styled`, `./${c}/a11y`, `./${c}.css`]) {
    need(Object.hasOwn(pkg.exports, key), c, `exports map has no "${key}"`)
  }

  // 3. Every tier pinned in the directive gate, in one list or the other.
  for (const tier of ['index', 'styled', 'a11y']) {
    if (tier === 'styled' && STYLED_NEEDS_NO_DIRECTIVE.has(c)) {
      // Asserted the other way instead: it must stay out of both lists,
      // so that starting to check it is a deliberate act.
      need(
        !directives.includes(`'dist/${c}/styled.js'`),
        c,
        `dist/${c}/styled.js is pinned in check-directives.js but listed as a deliberate exception here; drop one`
      )
      continue
    }
    need(
      directives.includes(`'dist/${c}/${tier}.js'`),
      c,
      `scripts/check-directives.js does not pin dist/${c}/${tier}.js`
    )
  }

  // 4. A size budget per tier.
  for (const tier of ['index', 'styled', 'a11y']) {
    need(
      measure.includes(`'dist/${c}/${tier}.js'`),
      c,
      `scripts/measure.js has no budget for dist/${c}/${tier}.js`
    )
  }

  // 5. In the architecture guard's component list.
  need(new RegExp(`'${c}'`).test(tiers), c, `not in COMPONENTS in test/tiers.test.jsx`)

  // 6. Its own test file.
  need(existsSync(join(root, 'test', `${c}.test.jsx`)), c, `missing test/${c}.test.jsx`)

  // 7. In the cross-component axe sweep.
  need(new RegExp(`src/${c}/a11y`).test(axe), c, `not imported by test/a11y.test.jsx`)

  // 8. Documented, in both the human and the machine file.
  need(readme.includes(`\`abaabil/${c}/a11y\``), c, `README.md never mentions abaabil/${c}/a11y`)
  need(llms.includes(c), c, `llms.txt never mentions ${c}`)
}

// The reverse direction: an exports entry with no source directory behind
// it, which is how a deleted component leaves a broken entry point.
for (const key of Object.keys(pkg.exports)) {
  const m = /^\.\/([a-z-]+)(\/(styled|a11y))?$/.exec(key)
  if (m && !components.includes(m[1])) gaps.push(`exports map has "${key}" but src/${m[1]}/ does not exist`)
}

console.log(`registration check: ${components.length} components x 8 places`)
if (gaps.length) {
  console.error('\nregistration check FAILED:\n' + gaps.map((g) => `  - ${g}`).join('\n') + '\n')
  process.exit(1)
}
console.log('registration check passed')
