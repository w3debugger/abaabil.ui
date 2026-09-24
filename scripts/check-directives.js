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
  'dist/textarea/a11y.js',
  'dist/switch/a11y.js',
  // Tabs have no native element behind them, so every tier needs state to
  // show one panel at a time. Same reason combobox/index.js is here.
  'dist/tabs/index.js',
  'dist/tabs/a11y.js',
  'dist/progress/a11y.js',
  'dist/slider/a11y.js',
  'dist/tooltip/a11y.js',
  'dist/menu/a11y.js',
  'dist/file/a11y.js',
  'dist/toolbar/a11y.js',
  // 1.5.0. card/a11y needs useId to tie its heading to the region it
  // names; the other three drive a native element's own open/close.
  'dist/alert-dialog/a11y.js',
  'dist/card/a11y.js',
  'dist/drawer/a11y.js',
  'dist/toast/a11y.js',
  // 1.6.0. command/index holds the filter query in state, so it is a
  // client tier like tabs/index; its styled tier is deliberately absent,
  // same as combobox/styled. Every other new component is client only
  // at a11y.
  'dist/field/a11y.js',
  'dist/otp/a11y.js',
  'dist/command/index.js',
  'dist/command/a11y.js',
  'dist/table/a11y.js',
  'dist/navigation-menu/a11y.js',
  'dist/context-menu/a11y.js',
  'dist/menubar/a11y.js',
  'dist/carousel/a11y.js',
]

// Components without hooks MUST NOT carry it: an accidental directive
// silently destroys the RSC story that justifies the tier split.
// accordion/a11y is pinned here deliberately: it is the only component
// whose a11y tier is server-renderable, so this is what stops someone
// casually adding a hook and silently destroying that property.
const MUST_NOT_BE_CLIENT = [
  // 1.6.0.
  'dist/field/index.js',
  'dist/field/styled.js',
  'dist/otp/index.js',
  'dist/otp/styled.js',
  'dist/table/index.js',
  'dist/table/styled.js',
  'dist/navigation-menu/index.js',
  'dist/navigation-menu/styled.js',
  'dist/context-menu/index.js',
  'dist/context-menu/styled.js',
  'dist/menubar/index.js',
  'dist/menubar/styled.js',
  'dist/carousel/index.js',
  'dist/carousel/styled.js',
  // 1.5.0. Five of the nine added here are hook-free in all three
  // tiers: separator, skeleton, spinner, collapsible and toggle are
  // an <hr>, two divs, a <details> and a set of radios. Pinning them
  // is what stops a hook creeping in and silently taking them out of
  // the server tree.
  'dist/alert-dialog/index.js',
  'dist/alert-dialog/styled.js',
  'dist/card/index.js',
  'dist/card/styled.js',
  'dist/collapsible/a11y.js',
  'dist/collapsible/index.js',
  'dist/collapsible/styled.js',
  'dist/drawer/index.js',
  'dist/drawer/styled.js',
  'dist/separator/a11y.js',
  'dist/separator/index.js',
  'dist/separator/styled.js',
  'dist/skeleton/a11y.js',
  'dist/skeleton/index.js',
  'dist/skeleton/styled.js',
  'dist/spinner/a11y.js',
  'dist/spinner/index.js',
  'dist/spinner/styled.js',
  'dist/toast/index.js',
  'dist/toast/styled.js',
  'dist/toggle/a11y.js',
  'dist/toggle/index.js',
  'dist/toggle/styled.js',
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
  'dist/textarea/index.js',
  'dist/textarea/styled.js',
  'dist/switch/index.js',
  'dist/switch/styled.js',
  // Every popover tier, a11y included. The Popover API does the work in
  // the browser, so there is nothing here to need a hook. This is the
  // line that fails if someone later reaches for useId to generate the
  // panel id and quietly turns the library's one zero-JavaScript
  // interactive component into a client component.
  'dist/popover/index.js',
  'dist/popover/styled.js',
  'dist/popover/a11y.js',
  'dist/alert/index.js',
  'dist/alert/styled.js',
  'dist/alert/a11y.js',
  'dist/progress/index.js',
  'dist/progress/styled.js',
  'dist/slider/index.js',
  'dist/slider/styled.js',
  // Breadcrumb is markup. All three tiers, a11y included.
  'dist/breadcrumb/index.js',
  'dist/breadcrumb/styled.js',
  'dist/breadcrumb/a11y.js',
  // Tooltip shows and hides in CSS, so only the tier that adds
  // aria-describedby and Escape needs a client boundary.
  'dist/tooltip/index.js',
  'dist/tooltip/styled.js',
  // Menu's lower tiers are the Popover API and two real elements.
  'dist/menu/index.js',
  'dist/menu/styled.js',
  // Pagination, avatar and badge are markup. All three tiers each.
  'dist/pagination/index.js',
  'dist/pagination/styled.js',
  'dist/pagination/a11y.js',
  'dist/avatar/index.js',
  'dist/avatar/styled.js',
  'dist/avatar/a11y.js',
  'dist/badge/index.js',
  'dist/badge/styled.js',
  'dist/badge/a11y.js',
  'dist/file/index.js',
  'dist/file/styled.js',
  'dist/toolbar/index.js',
  'dist/toolbar/styled.js',
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
