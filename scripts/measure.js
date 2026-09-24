import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const root = fileURLToPath(new URL('..', import.meta.url))

// bytes, gzipped
const BUDGETS = {
  // 1.6.0
  'dist/field/index.js': 700,
  'dist/field/styled.js': 150,
  'dist/field/a11y.js': 1050,
  'dist/otp/index.js': 350,
  'dist/otp/styled.js': 150,
  'dist/otp/a11y.js': 850,
  'dist/command/index.js': 900,
  'dist/command/styled.js': 150,
  'dist/command/a11y.js': 1850,
  'dist/table/index.js': 500,
  'dist/table/styled.js': 150,
  'dist/table/a11y.js': 1100,
  'dist/navigation-menu/index.js': 600,
  'dist/navigation-menu/styled.js': 200,
  'dist/navigation-menu/a11y.js': 1250,
  'dist/context-menu/index.js': 650,
  'dist/context-menu/styled.js': 200,
  'dist/context-menu/a11y.js': 1400,
  'dist/menubar/index.js': 200,
  'dist/menubar/styled.js': 200,
  'dist/menubar/a11y.js': 950,
  'dist/carousel/index.js': 700,
  'dist/carousel/styled.js': 150,
  'dist/carousel/a11y.js': 1200,
  // 1.5.0
  'dist/alert-dialog/index.js': 250,
  'dist/alert-dialog/styled.js': 150,
  'dist/alert-dialog/a11y.js': 1000,
  'dist/card/index.js': 300,
  'dist/card/styled.js': 150,
  'dist/card/a11y.js': 650,
  'dist/collapsible/index.js': 350,
  'dist/collapsible/styled.js': 150,
  'dist/collapsible/a11y.js': 150,
  'dist/drawer/index.js': 250,
  'dist/drawer/styled.js': 150,
  'dist/drawer/a11y.js': 850,
  'dist/separator/index.js': 250,
  'dist/separator/styled.js': 150,
  'dist/separator/a11y.js': 300,
  'dist/skeleton/index.js': 400,
  'dist/skeleton/styled.js': 150,
  'dist/skeleton/a11y.js': 300,
  'dist/spinner/index.js': 250,
  'dist/spinner/styled.js': 150,
  'dist/spinner/a11y.js': 350,
  'dist/toast/index.js': 350,
  'dist/toast/styled.js': 150,
  'dist/toast/a11y.js': 1150,
  'dist/toggle/index.js': 550,
  'dist/toggle/styled.js': 150,
  'dist/toggle/a11y.js': 650,
  'dist/button/index.js': 300,
  'dist/button/styled.js': 350,
  'dist/button/a11y.js': 700,
  'dist/dialog/index.js': 300,
  'dist/dialog/styled.js': 350,
  'dist/dialog/a11y.js': 1500,
  // Added when scripts/check-complete.js noticed these two had never had
  // a budget at all: combobox was the first component built and only its
  // a11y tier was ever listed.
  'dist/combobox/index.js': 700,
  'dist/combobox/styled.js': 150,
  'dist/combobox/a11y.js': 4000,
  'dist/input/index.js': 250,
  'dist/input/styled.js': 150,
  'dist/input/a11y.js': 700,
  'dist/checkbox/index.js': 250,
  'dist/checkbox/styled.js': 150,
  'dist/checkbox/a11y.js': 850,
  'dist/radio/index.js': 200,
  'dist/radio/styled.js': 150,
  'dist/radio/a11y.js': 800,
  'dist/select/index.js': 300,
  'dist/select/styled.js': 150,
  'dist/select/a11y.js': 700,
  'dist/accordion/index.js': 450,
  'dist/accordion/styled.js': 150,
  // 1.6.2: the a11y tier gained a dev warning for two or more items with
  // no `name`, now that `name` has no default. 250 to 400.
  'dist/accordion/a11y.js': 400,
  'dist/textarea/index.js': 250,
  'dist/textarea/styled.js': 150,
  'dist/textarea/a11y.js': 700,
  'dist/switch/index.js': 250,
  'dist/switch/styled.js': 150,
  'dist/switch/a11y.js': 600,
  'dist/popover/index.js': 500,
  'dist/popover/styled.js': 200,
  'dist/popover/a11y.js': 600,
  'dist/tabs/index.js': 700,
  'dist/tabs/styled.js': 150,
  'dist/tabs/a11y.js': 1400,
  'dist/alert/index.js': 250,
  'dist/alert/styled.js': 150,
  'dist/alert/a11y.js': 400,
  'dist/progress/index.js': 250,
  'dist/progress/styled.js': 150,
  'dist/progress/a11y.js': 700,
  'dist/slider/index.js': 250,
  'dist/slider/styled.js': 150,
  'dist/slider/a11y.js': 900,
  'dist/breadcrumb/index.js': 400,
  'dist/breadcrumb/styled.js': 150,
  'dist/breadcrumb/a11y.js': 550,
  'dist/tooltip/index.js': 300,
  'dist/tooltip/styled.js': 150,
  'dist/tooltip/a11y.js': 700,
  'dist/menu/index.js': 550,
  'dist/menu/styled.js': 200,
  'dist/menu/a11y.js': 1600,
  'dist/pagination/index.js': 700,
  'dist/pagination/styled.js': 200,
  'dist/pagination/a11y.js': 900,
  'dist/file/index.js': 250,
  'dist/file/styled.js': 150,
  'dist/file/a11y.js': 800,
  'dist/toolbar/index.js': 300,
  'dist/toolbar/styled.js': 150,
  'dist/toolbar/a11y.js': 1100,
  'dist/avatar/index.js': 450,
  'dist/avatar/styled.js': 200,
  'dist/avatar/a11y.js': 650,
  'dist/badge/index.js': 250,
  'dist/badge/styled.js': 150,
  'dist/badge/a11y.js': 350,
}
// 40 a11y entries in 1.6.0 (was 32): the eight new tiers add about
// 7900 B, so 22000 went to 28000 to keep the same headroom.
const COMBINED = { 'all a11y entries': { max: 28000, match: /a11y\.js$/ } }
// Nine stylesheets in 1.5.0 took this from 5231 B to about 6830 B
// gzipped, roughly 178 B each. The previous 7000 would have failed the
// next component added, which is a budget doing its job a release late.
// Eight more stylesheets in 1.6.0 took it from about 6830 B to about
// 8500 B, so 8000 became 10000 for the same reason.
const CSS_BUDGET = 10000

const gz = (f) => gzipSync(readFileSync(join(root, f))).length
const rows = []
const errors = []

for (const [file, max] of Object.entries(BUDGETS)) {
  if (!existsSync(join(root, file))) continue // not built yet
  const size = gz(file)
  rows.push({ file, size, max })
  if (size > max) errors.push(`${file}: ${size} B gz exceeds budget ${max} B`)
}

for (const [label, { max, match }] of Object.entries(COMBINED)) {
  const files = rows.filter((r) => match.test(r.file))
  if (!files.length) continue
  const total = files.reduce((n, r) => n + r.size, 0)
  rows.push({ file: label, size: total, max })
  if (total > max) errors.push(`${label}: ${total} B gz exceeds budget ${max} B`)
}

if (existsSync(join(root, 'dist/styles.css'))) {
  const size = gz('dist/styles.css')
  rows.push({ file: 'dist/styles.css', size, max: CSS_BUDGET })
  if (size > CSS_BUDGET) errors.push(`dist/styles.css: ${size} B gz exceeds ${CSS_BUDGET} B`)
}

const md = [
  '# Bundle sizes',
  '',
  'Generated by `npm run build`. Gzipped, React external. Do not edit by hand.',
  '',
  '| Entry | Gzipped | Budget | |',
  '|---|---:|---:|---|',
  ...rows.map((r) => `| \`${r.file}\` | ${r.size} B | ${r.max} B | ${r.size <= r.max ? 'ok' : 'OVER'} |`),
  '',
].join('\n')

writeFileSync(join(root, 'SIZES.md'), md)
console.log(md)

if (errors.length) {
  console.error('\nsize budget FAILED:\n' + errors.map((e) => `  - ${e}`).join('\n') + '\n')
  process.exit(1)
}
