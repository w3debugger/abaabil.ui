// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const read = (p) => readFileSync(new URL(`../src/tokens/${p}`, import.meta.url), 'utf8')

describe('token system', () => {
  it('declares the layer order before any rules', () => {
    expect(read('layers.css')).toMatch(
      /@layer\s+abaabil\.reset,\s*abaabil\.tokens,\s*abaabil\.base,\s*abaabil\.components;/
    )
  })

  it('wraps every token declaration in the tokens layer', () => {
    for (const f of ['primitive.css', 'semantic.css']) {
      expect(read(f).trim().startsWith('@layer abaabil.tokens')).toBe(true)
    }
  })

  it('names semantic tokens by purpose, never by colour value', () => {
    const semantic = read('semantic.css')
    const names = [...semantic.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((m) => m[1])
    const valueNamed = names.filter((n) =>
      /^--(color|bg|border)-(blue|red|green|gray|grey|yellow|orange|purple)/.test(n)
    )
    expect(valueNamed).toEqual([])
  })

  it('supports dark mode by overriding tokens, not by restyling components', () => {
    const semantic = read('semantic.css')
    expect(semantic).toContain('prefers-color-scheme: dark')
    expect(semantic).toContain(':root[data-theme="dark"]')
  })

  it('derives every primary-related token from --color-primary', () => {
    // The bug this guards: --color-primary-hover and --color-focus-ring
    // pointed at blue primitives, so setting --color-primary to red gave
    // a red button with a blue hover and a blue focus ring on every
    // control. Re-theming is meant to be one declaration.
    const semantic = read('semantic.css')
    const value = (name) =>
      (semantic.match(new RegExp(`^\\s*${name}:\\s*([^;]+);`, 'm')) || [])[1]?.trim()

    for (const name of ['--color-primary-hover', '--color-focus-ring']) {
      expect(value(name), `${name} is not declared`).toBeDefined()
      expect(value(name), `${name} must follow --color-primary`).toMatch(/var\(--color-primary\)/)
    }
  })

  it('lets only --color-primary reference a hue primitive', () => {
    // Any other semantic token reaching straight for --abaabil-blue-*
    // is a token that silently ignores a re-theme.
    const semantic = read('semantic.css')
    const offenders = [...semantic.matchAll(/^\s*(--color-[a-z-]+):\s*([^;]+);/gm)]
      .filter(([, name, val]) => /--abaabil-blue/.test(val) && name !== '--color-primary')
      .map(([, name]) => name)
    expect(offenders).toEqual([])
  })

  it('declares no primitive that nothing uses', () => {
    // A dead primitive is worse than no primitive: someone finds it,
    // overrides it, and nothing happens.
    const primitive = read('primitive.css')
    const semantic = read('semantic.css')
    const declared = [...primitive.matchAll(/^\s*(--abaabil-[a-z0-9-]+):/gm)].map((m) => m[1])
    const unused = declared.filter((name) => !semantic.includes(`var(${name})`))
    expect(unused).toEqual([])
  })
})
