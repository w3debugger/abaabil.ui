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

const COMPONENTS = ['button', 'dialog', 'combobox', 'input', 'checkbox', 'radio', 'select', 'accordion']

const srcPath = (name, tier) => `../src/${name}/${tier}.jsx`

describe('tier boundary: normal tier has no ARIA', () => {
  it.each(COMPONENTS)('src/%s/index.jsx contains no aria-* attribute and no role=', (name) => {
    const src = read(srcPath(name, 'index'))
    expect(src).not.toMatch(/\baria-[a-zA-Z]+\s*[:=]/)
    expect(src).not.toMatch(/\brole\s*[:=]/)
  })
})

describe('tier boundary: styled.jsx is a pure two-line pass-through', () => {
  const stripComments = (src) =>
    src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')

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
  // included for all eight components, including combobox: its styled
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
  }

  const hasUseClient = (src) => /^\s*['"]use client['"]/m.test(src)

  it.each(Object.entries(EXPECTED))('src/%s.jsx: use client === %s', (key, expected) => {
    const [name, tier] = key.split('/')
    const src = read(srcPath(name, tier))
    expect(hasUseClient(src)).toBe(expected)
  })

  it("agrees with scripts/check-directives.js's declared lists", () => {
    const scriptSrc = read('../scripts/check-directives.js')

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
  })
})
