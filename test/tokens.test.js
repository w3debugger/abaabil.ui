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
})
