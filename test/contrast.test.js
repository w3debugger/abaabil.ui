// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

// The colour audit that produced these numbers was a browser sweep: render
// every component in both themes, composite each element's effective
// background through the transparent layers above it, and measure. That
// sweep found --color-border at 1.47:1, placeholder text at 2.54:1 and a
// popover trigger at 1.08:1 in dark mode, and it is not something the test
// suite can run.
//
// What the suite can do is hold the fixed points the sweep landed on. Every
// pair below is a pairing that actually occurs in the components, with the
// threshold WCAG sets for that kind of thing. A token edit that drops one
// of them back under the line fails here, in milliseconds, instead of
// surviving until the next time someone thinks to open a browser.

const HERE = import.meta.url
const read = (p) => readFileSync(new URL(`../src/tokens/${p}`, HERE), 'utf8')

const css = read('primitive.css') + read('semantic.css')

// Declarations, in source order, so a later block overrides an earlier one
// exactly as the cascade would. Light mode reads only the plain :root
// blocks; dark mode reads those and then the [data-theme="dark"] block on
// top, which is what a page with the attribute set resolves to.
function declarations(source) {
  return [...source.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])
}

const darkBlock = (css.match(/:root\[data-theme="dark"\]\s*\{([\s\S]*?)\n\s*\}/) || [])[1] ?? ''
const mediaBlock = (
  css.match(/@media \(prefers-color-scheme: dark\)[\s\S]*?:root:not\(\[data-theme="light"\]\)\s*\{([\s\S]*?)\n\s*\}/) ||
  []
)[1] ?? ''

// Everything outside both dark blocks: the primitives and the light theme.
const lightSource = css.replace(darkBlock, '').replace(mediaBlock, '')

const LIGHT = Object.fromEntries(declarations(lightSource))
const DARK = { ...LIGHT, ...Object.fromEntries(declarations(darkBlock)) }

function srgb(hex) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
}

function luminance(hex) {
  const [r, g, b] = srgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

function mix(a, b, pct) {
  const [x, y] = [srgb(a), srgb(b)]
  const c = x.map((v, i) => v * pct + y[i] * (1 - pct))
  return '#' + c.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
}

// Follows var() chains and evaluates the one colour function the tokens
// use, so a token that gains another level of indirection keeps resolving
// rather than quietly dropping out of the assertions.
function resolve(name, theme, seen = new Set()) {
  if (seen.has(name)) throw new Error(`${name} resolves in a cycle`)
  seen.add(name)
  const value = theme[name]
  if (!value) throw new Error(`${name} is not declared`)
  if (value.startsWith('#')) return value
  if (value === 'white') return '#ffffff'

  const mixMatch = value.match(/^color-mix\(in srgb,\s*var\((--[a-z0-9-]+)\)\s*(\d+)%,\s*(\w+)\)$/)
  if (mixMatch) {
    const [, from, pct, to] = mixMatch
    return mix(resolve(from, theme, new Set(seen)), to === 'white' ? '#ffffff' : '#000000', Number(pct) / 100)
  }

  const varMatch = value.match(/^var\((--[a-z0-9-]+)\)$/)
  if (varMatch) return resolve(varMatch[1], theme, seen)

  throw new Error(`cannot resolve ${name}: ${value}`)
}

// fg, bg, minimum, and why that minimum.
const PAIRS = [
  // 1.4.3, text: the body copy, and every status colour that appears as
  // text (alert messages, an input's error line, a badge label).
  ['--color-text', '--color-surface', 4.5, 'body text'],
  ['--color-text-muted', '--color-surface', 4.5, 'help text under a field'],
  ['--color-danger', '--color-surface', 4.5, 'error message text'],
  ['--color-success', '--color-surface', 4.5, 'success alert text'],
  ['--color-warning', '--color-surface', 4.5, 'warning alert text'],
  ['--color-primary-fg', '--color-primary', 4.5, 'label on a primary button'],
  // The state the resting pair above does not cover, and the one that was
  // actually broken. A filled button's label sits on the fill in every
  // state, so hovering does not suspend 1.4.3. The hover shade used to mix
  // toward white, carrying the white label with it, and the stock blue
  // hovered to 3.98:1 while the resting pair sat at a comfortable 5.17 and
  // reported everything fine.
  ['--color-primary-fg', '--color-primary-hover', 4.5, 'label on a hovered primary button'],
  // Placeholder text is text. It fails silently, because the people who
  // can read it never find out that others cannot.
  ['--color-placeholder', '--color-surface', 4.5, 'placeholder text'],
  // Text on the muted fill: a hovered menu item, a popover trigger, the
  // current page in a paginator.
  ['--color-text', '--color-muted', 4.5, 'text on a hovered surface'],
  // 1.4.11, non-text: a control's border is the only thing marking where
  // the control is, since it sits on the same colour as the page.
  ['--color-border', '--color-surface', 3, 'the edge of an input'],
  // Progress and slider read their value off where the fill stops
  // against the rest of the track, so that boundary carries the state.
  // This is the pair --color-track exists for: sharing --color-muted put
  // it at 2.84:1 in dark mode.
  // Also the spinner's arc against the rest of its ring, added in
  // 1.5.0. That component first drew its ring in --color-border and
  // the arc in the accent, which is 1.65:1 in light and 1.13:1 in
  // dark: a spinner that spins and looks like a static circle. The
  // fix was to reach for the token that already means "the empty
  // part of a track", which this pairing was already guarding.
  ['--color-primary', '--color-track', 3, 'the filled part of a track against the empty part'],
  // A track is --color-track on --color-surface, near enough invisible in
  // both themes by design, so its border is the only thing showing how
  // far it runs, and a fill you cannot see the extent of is a proportion
  // you cannot read.
  ['--color-border', '--color-surface', 3, 'the edge of a track against the page'],
  // The switch's on/off cue is the thumb's position, so the thumb has to
  // be locatable on the off fill as well as the on fill. The two fills do
  // not need 3:1 between themselves: position is a non-colour cue, which
  // is what 1.4.1 asks for.
  ['--color-surface', '--color-border', 3, 'the switch thumb on its off fill'],
  ['--color-surface', '--color-primary', 3, 'the switch thumb on its on fill'],
  // The combobox marks its active option, the one Enter will choose, with
  // the primary fill. It used the same wash as :hover, 1.07:1, which left
  // a sighted keyboard user unable to see where they were.
  ['--color-primary-fg', '--color-primary', 4.5, 'the active combobox option'],
  // What is NOT asserted: --color-border against --color-muted or
  // --color-track. A border around a fill separates its control from the
  // page behind it, not from its own interior.
  // A focus ring nobody can see is a keyboard user with no cursor.
  ['--color-focus-ring', '--color-surface', 3, 'the focus ring'],
  ['--color-primary', '--color-surface', 3, 'a primary button against the page'],

]

describe('token contrast', () => {
  for (const [name, theme] of [['light', LIGHT], ['dark', DARK]]) {
    describe(name, () => {
      for (const [fg, bg, min, why] of PAIRS) {
        it(`${why} clears ${min}:1 (${fg} on ${bg})`, () => {
          const r = ratio(resolve(fg, theme), resolve(bg, theme))
          expect(Number(r.toFixed(2))).toBeGreaterThanOrEqual(min)
        })
      }
    })
  }

  it('applies the same dark values in the media query and the attribute block', () => {
    // These two lists cannot be shared in CSS, so they are written twice
    // and drift apart the first time someone edits one of them. Both now
    // assign from one set of --abaabil-dark-* primitives; this checks the
    // assignments themselves still match, name for name and value for
    // value.
    const norm = (block) =>
      declarations(block)
        .map(([k, v]) => `${k}:${v}`)
        .sort()
    expect(mediaBlock).not.toBe('')
    expect(norm(mediaBlock)).toEqual(norm(darkBlock))
  })

  it('makes the hover state a visible change from the resting one', () => {
    // The label check above is satisfied by a hover shade arbitrarily far
    // from the resting colour, so on its own it would happily accept a
    // button that turns black. A hover has to read as the same button in
    // a different state: far enough to notice, near enough to recognise.
    for (const [name, theme] of [['light', LIGHT], ['dark', DARK]]) {
      const r = ratio(resolve('--color-primary', theme), resolve('--color-primary-hover', theme))
      expect(r, `${name}: hover is indistinguishable from resting`).toBeGreaterThan(1.1)
      expect(r, `${name}: hover looks like a different button, not a state`).toBeLessThan(2)
    }
  })

  it('keeps the decorative border distinct from the control border', () => {
    // --color-border-subtle exists so that dividers can stay quiet without
    // dragging control edges below 3:1 with them. If the two ever resolve
    // to the same value, the distinction has collapsed and the next person
    // to soften a divider will soften every input on the page.
    for (const theme of [LIGHT, DARK]) {
      expect(resolve('--color-border', theme)).not.toBe(resolve('--color-border-subtle', theme))
    }
  })
})

