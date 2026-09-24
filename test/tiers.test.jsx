// @vitest-environment node
//
// Architecture guard. Nothing here renders a component: every check reads
// source text and asserts a structural property of the three-tier system
// (normal / styled / a11y) that the library's size and RSC claims depend
// on. Pure source inspection, so this runs in the `node` environment
// rather than jsdom, same as test/tokens.test.js.
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

// Vite rewrites `new URL('literal', import.meta.url)` at transform time,
// so the URL base must be captured at module scope, not inlined.
const HERE = import.meta.url
const read = (relPath) => readFileSync(new URL(relPath, HERE), 'utf8')

const COMPONENTS = [
  'button', 'dialog', 'combobox', 'input', 'checkbox', 'radio', 'select', 'accordion',
  'textarea', 'switch', 'popover', 'tabs', 'alert',
  'progress', 'slider', 'breadcrumb', 'tooltip', 'menu',
  'pagination', 'file', 'toolbar', 'avatar', 'badge',
  'alert-dialog', 'card', 'collapsible', 'drawer', 'separator', 'skeleton', 'spinner', 'toast', 'toggle',
  'field', 'otp', 'command', 'table', 'navigation-menu', 'context-menu', 'menubar', 'carousel',
]

// Components whose normal tier carries one static role, because they have
// no native element to carry it for them. This is an allowance for
// identity, not for wiring: the role says what the component *is*, the
// way <dialog> and <details> say it for the components built on them.
// Everything dynamic (aria-selected, aria-describedby, aria-controls) is
// still forbidden below the a11y tier, and the aria-* assertion below
// still runs for these.
const IDENTITY_ROLE = {
  switch: 'switch',
  // role="alertdialog" on a <dialog> is identity in exactly this sense:
  // it says the dialog is the interrupting kind, which is the whole
  // difference between this component and abaabil/dialog. Moving it to
  // the a11y tier would leave a normal tier byte-identical to dialog's
  // and a component whose defining property is optional.
  'alert-dialog': 'alertdialog',
}

const srcPath = (name, tier) => `../src/${name}/${tier}.jsx`

// Every guard below reads source text, so every guard has to ignore
// comments. Leaving them in is not cosmetic: the check-directives
// cross-check reads quoted strings out of an array literal, and a comment
// containing an apostrophe or a quoted filename silently added phantom
// entries to the list it was checking.
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

describe('tier boundary: normal tier has no ARIA', () => {
  it.each(COMPONENTS)('src/%s/index.jsx contains no aria-* attribute', (name) => {
    expect(stripComments(read(srcPath(name, 'index')))).not.toMatch(/\baria-[a-zA-Z]+\s*[:=]/)
  })

  it.each(COMPONENTS.filter((name) => !IDENTITY_ROLE[name]))(
    'src/%s/index.jsx sets no role=',
    (name) => {
      expect(stripComments(read(srcPath(name, 'index')))).not.toMatch(/\brole\s*[:=]/)
    }
  )

  it.each(Object.entries(IDENTITY_ROLE))(
    'src/%s/index.jsx sets exactly one role, "%s", and no other',
    (name, role) => {
      const src = stripComments(read(srcPath(name, 'index')))
      const roles = [...src.matchAll(/\brole\s*=\s*["']([^"']+)["']/g)].map((m) => m[1])
      expect(roles).toEqual([role])
    }
  )
})

describe('tier boundary: styled.jsx is a pure two-line pass-through', () => {
  it.each(COMPONENTS)('src/%s/styled.jsx is exactly two lines after stripping comments', (name) => {
    const src = stripComments(read(srcPath(name, 'styled')))
    const lines = src.split('\n').map((l) => l.trim()).filter(Boolean)
    expect(lines).toHaveLength(2)
    expect(lines[0]).toMatch(new RegExp(`^import\\s+['"]\\./${name}\\.css['"]$`))
    expect(lines[1]).toMatch(new RegExp(`^export\\s*\\{[^}]+\\}\\s*from\\s*['"]\\./index\\.jsx['"];?$`))
  })
})

describe('tier boundary: a11y.jsx imports its own stylesheet directly', () => {
  // Not cosmetic: Rollup collapses pass-through re-export chains, so an
  // a11y tier that only imports the stylesheet transitively (via
  // styled.jsx) can ship unstyled. Two tiers shipped that way once.
  it.each(COMPONENTS)('src/%s/a11y.jsx has a direct `import \'./%s.css\'`', (name) => {
    const src = read(srcPath(name, 'a11y'))
    expect(src).toMatch(new RegExp(`^import\\s+['"]\\./${name}\\.css['"]`, 'm'))
  })
})

describe('tier boundary: no forwardRef anywhere', () => {
  // React 19 passes `ref` as a plain prop; forwardRef would be a regression.
  const allFiles = COMPONENTS.flatMap((name) => [
    srcPath(name, 'index'),
    srcPath(name, 'styled'),
    srcPath(name, 'a11y'),
  ])

  it.each(allFiles)('%s does not use forwardRef', (path) => {
    expect(read(path)).not.toMatch(/forwardRef/)
  })
})

describe("tier boundary: 'use client' appears only where hooks are used", () => {
  // Ground truth, read directly from each source file. `styled.jsx` is
  // included for every component, including combobox: its styled
  // tier only re-exports index.jsx (which already carries the directive),
  // so it needs none of its own.
  const EXPECTED = {
    'button/index': false, 'button/styled': false, 'button/a11y': false,
    'dialog/index': false, 'dialog/styled': false, 'dialog/a11y': true,
    'combobox/index': true, 'combobox/styled': false, 'combobox/a11y': true,
    'input/index': false, 'input/styled': false, 'input/a11y': true,
    'checkbox/index': false, 'checkbox/styled': false, 'checkbox/a11y': true,
    'radio/index': false, 'radio/styled': false, 'radio/a11y': true,
    'select/index': false, 'select/styled': false, 'select/a11y': true,
    'accordion/index': false, 'accordion/styled': false, 'accordion/a11y': false,
    'textarea/index': false, 'textarea/styled': false, 'textarea/a11y': true,
    'switch/index': false, 'switch/styled': false, 'switch/a11y': true,
    // All three popover tiers are server-renderable. The Popover API does
    // the work in the browser, so nothing here needs a hook. This row is
    // what fails if someone reaches for useId to generate the panel id.
    'popover/index': false, 'popover/styled': false, 'popover/a11y': false,
    // Tabs have no native element, so even the normal tier needs state to
    // show one panel at a time. Same reason combobox/index is true.
    'tabs/index': true, 'tabs/styled': false, 'tabs/a11y': true,
    'alert/index': false, 'alert/styled': false, 'alert/a11y': false,
    'progress/index': false, 'progress/styled': false, 'progress/a11y': true,
    'slider/index': false, 'slider/styled': false, 'slider/a11y': true,
    // Breadcrumb is markup. Nothing in it needs a hook at any tier.
    'breadcrumb/index': false, 'breadcrumb/styled': false, 'breadcrumb/a11y': false,
    // Tooltip shows and hides in CSS (:hover and :focus-within), so only
    // the tier adding aria-describedby and Escape needs a client tree.
    'tooltip/index': false, 'tooltip/styled': false, 'tooltip/a11y': true,
    // Menu's lower tiers are the Popover API and two real elements; the
    // a11y tier adds the APG menu semantics and keyboard.
    'menu/index': false, 'menu/styled': false, 'menu/a11y': true,
    // Pagination, avatar and badge are markup at every tier.
    'pagination/index': false, 'pagination/styled': false, 'pagination/a11y': false,
    'avatar/index': false, 'avatar/styled': false, 'avatar/a11y': false,
    'badge/index': false, 'badge/styled': false, 'badge/a11y': false,
    'file/index': false, 'file/styled': false, 'file/a11y': true,
    // Toolbar's a11y tier manages a roving tabindex over its
    // descendants, which needs a ref and an effect.
    'toolbar/index': false, 'toolbar/styled': false, 'toolbar/a11y': true,
    // 1.5.0. Five of the nine are hook-free at every tier: an <hr>, two
    // divs, a <details> and a set of radios do not need one.
    'separator/index': false, 'separator/styled': false, 'separator/a11y': false,
    'spinner/index': false, 'spinner/styled': false, 'spinner/a11y': false,
    'skeleton/index': false, 'skeleton/styled': false, 'skeleton/a11y': false,
    'collapsible/index': false, 'collapsible/styled': false, 'collapsible/a11y': false,
    'toggle/index': false, 'toggle/styled': false, 'toggle/a11y': false,
    // Card's a11y tier needs useId to point aria-labelledby at the
    // heading it renders. This row is what fails if someone reaches for
    // a hook in the other two.
    'card/index': false, 'card/styled': false, 'card/a11y': true,
    // Drawer and alert-dialog drive a native <dialog>'s showModal and
    // close from an effect, the same shape as dialog.
    'drawer/index': false, 'drawer/styled': false, 'drawer/a11y': true,
    'alert-dialog/index': false, 'alert-dialog/styled': false, 'alert-dialog/a11y': true,
    // Toast's a11y tier owns the dismiss timer and its pause states.
    'toast/index': false, 'toast/styled': false, 'toast/a11y': true,
    // 1.6.0.
    // Field's a11y tier needs useId so `id` can be optional; the other two take one.
    'field/index': false, 'field/styled': false, 'field/a11y': true,
    // Otp is one native input; only the a11y tier mints label ids.
    'otp/index': false, 'otp/styled': false, 'otp/a11y': true,
    // Command filters a list as you type, so even the normal tier holds the query in state, the same reason as tabs and combobox. Its styled tier only re-exports index and so carries no directive of its own.
    'command/index': true, 'command/styled': false, 'command/a11y': true,
    // Table's a11y tier owns uncontrolled sort state and the caption id.
    'table/index': false, 'table/styled': false, 'table/a11y': true,
    // Navigation-menu's lower tiers are the Popover API on real elements; a11y tracks aria-expanded from the panels' toggle events.
    'navigation-menu/index': false, 'navigation-menu/styled': false, 'navigation-menu/a11y': true,
    // Context-menu's normal tier is an event handler on a div (no hook); a11y ports menu's roving tabindex.
    'context-menu/index': false, 'context-menu/styled': false, 'context-menu/a11y': true,
    // Menubar is a div at the normal tier; a11y runs a roving tabindex over the menu triggers, as toolbar does.
    'menubar/index': false, 'menubar/styled': false, 'menubar/a11y': true,
    // Carousel's buttons call scrollBy from a click handler; a11y adds the live 'Slide n of N' region and edge state, which need an effect.
    'carousel/index': false, 'carousel/styled': false, 'carousel/a11y': true,
  }

  const hasUseClient = (src) => /^\s*['"]use client['"]/m.test(src)

  it.each(Object.entries(EXPECTED))('src/%s.jsx: use client === %s', (key, expected) => {
    const [name, tier] = key.split('/')
    const src = read(srcPath(name, tier))
    expect(hasUseClient(src)).toBe(expected)
  })

  it("agrees with scripts/check-directives.js's declared lists", () => {
    const scriptSrc = stripComments(read('../scripts/check-directives.js'))

    const extractArray = (varName) => {
      const match = scriptSrc.match(new RegExp(`${varName}\\s*=\\s*\\[([\\s\\S]*?)\\]`))
      expect(match, `${varName} not found in check-directives.js`).not.toBeNull()
      return [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1])
    }

    // dist/<name>/<tier>.js -> "<name>/<tier>" to match EXPECTED's keys.
    const toKey = (distPath) => distPath.replace(/^dist\//, '').replace(/\.js$/, '')

    const mustBeClient = extractArray('MUST_BE_CLIENT').map(toKey)
    const mustNotBeClient = extractArray('MUST_NOT_BE_CLIENT').map(toKey)

    for (const key of mustBeClient) {
      expect(EXPECTED[key], `${key}: script says MUST_BE_CLIENT, source disagrees`).toBe(true)
    }
    for (const key of mustNotBeClient) {
      expect(EXPECTED[key], `${key}: script says MUST_NOT_BE_CLIENT, source disagrees`).toBe(false)
    }

    // combobox/styled is the one file the script deliberately does not
    // check (see its comment). Confirm it is absent from both lists, so
    // this test still notices if someone starts checking it without
    // updating the comment/reasoning.
    expect(mustBeClient).not.toContain('combobox/styled')
    expect(mustNotBeClient).not.toContain('combobox/styled')
    // command/styled is the same shape: it re-exports a client index.
    expect(mustBeClient).not.toContain('command/styled')
    expect(mustNotBeClient).not.toContain('command/styled')
  })
})
