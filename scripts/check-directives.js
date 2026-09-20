import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname

// Components with hooks or internal state MUST carry the directive.
// Note: combobox/styled.js is deliberately absent. It only re-exports
// index.js, which carries the directive, so the client boundary is already
// established there. The directive belongs where the hooks are.
const MUST_BE_CLIENT = [
  'dist/dialog/a11y.js',
  'dist/combobox/index.js',
]

// Components without hooks MUST NOT carry it: an accidental directive
// silently destroys the RSC story that justifies the tier split.
const MUST_NOT_BE_CLIENT = [
  'dist/button/index.js',
  'dist/button/styled.js',
  'dist/button/a11y.js',
  'dist/dialog/index.js',
  'dist/dialog/styled.js',
]

const has = (f) => /^\s*['"]use client['"]/.test(readFileSync(join(root, f), 'utf8'))
const errors = []

for (const f of MUST_BE_CLIENT) {
  if (!existsSync(join(root, f))) { errors.push(`missing build output: ${f}`); continue }
  if (!has(f)) errors.push(`MISSING "use client": ${f} (bundler stripped it)`)
}
for (const f of MUST_NOT_BE_CLIENT) {
  if (!existsSync(join(root, f))) { errors.push(`missing build output: ${f}`); continue }
  if (has(f)) errors.push(`UNEXPECTED "use client": ${f} (breaks server rendering)`)
}

if (errors.length) {
  console.error('\ndirective check FAILED:\n' + errors.map((e) => `  - ${e}`).join('\n') + '\n')
  process.exit(1)
}
console.log(`directive check passed (${MUST_BE_CLIENT.length + MUST_NOT_BE_CLIENT.length} files)`)
