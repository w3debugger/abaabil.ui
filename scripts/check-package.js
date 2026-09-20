// Publish-readiness verification for package.json + dist/.
// Plain script (not a test file): run manually with `node scripts/check-package.js`.
// Exits non-zero on any failed check.

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

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
