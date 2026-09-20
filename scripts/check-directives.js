import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

// Components with hooks or internal state MUST carry the directive.
// Note: combobox/styled.js is deliberately absent. It only re-exports
// index.js, which carries the directive, so the client boundary is already
// established there. The directive belongs where the hooks are.
const MUST_BE_CLIENT = [
  'dist/dialog/a11y.js',
  'dist/combobox/index.js',
  'dist/combobox/a11y.js',
  'dist/input/a11y.js',
  'dist/checkbox/a11y.js',
  'dist/radio/a11y.js',
  'dist/select/a11y.js',
]

// Components without hooks MUST NOT carry it: an accidental directive
// silently destroys the RSC story that justifies the tier split.
// accordion/a11y is pinned here deliberately: it is the only component
// whose a11y tier is server-renderable, so this is what stops someone
// casually adding a hook and silently destroying that property.
const MUST_NOT_BE_CLIENT = [
  'dist/button/index.js',
  'dist/button/styled.js',
  'dist/button/a11y.js',
  'dist/dialog/index.js',
  'dist/dialog/styled.js',
  'dist/input/index.js',
  'dist/input/styled.js',
  'dist/checkbox/index.js',
  'dist/checkbox/styled.js',
  'dist/radio/index.js',
  'dist/radio/styled.js',
  'dist/select/index.js',
  'dist/select/styled.js',
  'dist/accordion/index.js',
  'dist/accordion/styled.js',
  'dist/accordion/a11y.js',
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
