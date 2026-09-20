// Publish-readiness verification for package.json + dist/.
// Plain script (not a test file): run manually with `node scripts/check-package.js`.
// Exits non-zero on any failed check.

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

const checks = []
const check = (name, pass, detail) => checks.push({ name, pass, detail })

check(
  'dependencies is empty (zero runtime deps)',
  Object.keys(pkg.dependencies ?? {}).length === 0,
  `dependencies: ${JSON.stringify(pkg.dependencies ?? {})}`
)

check(
  'react is declared in peerDependencies',
  Boolean(pkg.peerDependencies && pkg.peerDependencies.react),
  `peerDependencies.react: ${pkg.peerDependencies?.react ?? 'MISSING'}`
)

check(
  'no root "." entry in exports',
  !Object.prototype.hasOwnProperty.call(pkg.exports ?? {}, '.'),
  `exports["."]: ${pkg.exports?.['.'] ?? 'absent (correct)'}`
)

check(
  'sideEffects includes *.css',
  Array.isArray(pkg.sideEffects) && pkg.sideEffects.includes('*.css'),
  `sideEffects: ${JSON.stringify(pkg.sideEffects)}`
)

check('version is exactly 1.0.0', pkg.version === '1.0.0', `version: ${pkg.version}`)

const exportEntries = Object.entries(pkg.exports ?? {})
const missing = exportEntries.filter(([, target]) => !existsSync(join(root, target)))
check(
  `all ${exportEntries.length} exports targets resolve to files in dist/`,
  missing.length === 0,
  missing.length === 0
    ? exportEntries.map(([name, target]) => `${name} -> ${target}`).join('\n    ')
    : `missing: ${missing.map(([name, target]) => `${name} -> ${target}`).join(', ')}`
)

// Guard: each a11y tier's built import graph must actually reach its
// component's CSS file. This catches a bundler pass-through optimisation
// (e.g. Rollup collapsing `a11y.jsx -> styled.jsx -> index.jsx` and dropping
// styled.jsx's `import './x.css'` side effect along the way) that leaves
// source correct but the shipped artifact silently unstyled.
function collectCssImports(entryAbsPath) {
  const visitedJs = new Set()
  const cssFound = new Set()
  const specifierRe = /\b(?:from|import)\s*['"]([^'"]+)['"]/g

  function walk(absPath) {
    if (visitedJs.has(absPath) || !existsSync(absPath)) return
    visitedJs.add(absPath)
    const src = readFileSync(absPath, 'utf8')
    let m
    specifierRe.lastIndex = 0
    while ((m = specifierRe.exec(src))) {
      const spec = m[1]
      if (!spec.startsWith('.')) continue // external (react, react/jsx-runtime, ...)
      const resolved = join(dirname(absPath), spec)
      if (spec.endsWith('.css')) cssFound.add(resolved)
      else walk(resolved)
    }
  }

  walk(entryAbsPath)
  return cssFound
}

for (const name of ['button', 'dialog', 'combobox']) {
  const a11yTarget = pkg.exports[`./${name}/a11y`]
  const cssTarget = pkg.exports[`./${name}.css`]
  if (!a11yTarget || !cssTarget) continue

  const entryAbs = join(root, a11yTarget)
  const cssAbs = join(root, cssTarget)
  const reachedCss = collectCssImports(entryAbs)
  const ok = reachedCss.has(cssAbs)

  check(
    `${name}/a11y's built import graph reaches ${cssTarget}`,
    ok,
    ok
      ? `css reachable from ${a11yTarget}: ${[...reachedCss].map((f) => f.replace(root, '')).join(', ')}`
      : `the ${name}/a11y tier would ship UNSTYLED: no import chain from ${a11yTarget} reaches ${cssTarget}`
  )
}

let failed = false
console.log('package.json publish-readiness checks\n')
for (const { name, pass, detail } of checks) {
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${name}`)
  console.log(`    ${detail}`)
  if (!pass) failed = true
}

console.log(`\n${checks.length - checks.filter((c) => !c.pass).length}/${checks.length} checks passed`)

if (failed) {
  console.error('\ncheck-package FAILED')
  process.exit(1)
} else {
  console.log('\ncheck-package OK')
}
