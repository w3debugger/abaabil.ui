// @vitest-environment node
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

// Every class a component renders is either styled or listed below as a
// deliberate hook.
//
// The bug this exists for: popover.css and menu.css declared
// `.abaabil-abaabil-popover__trigger`, a doubled prefix, so the rule
// matched nothing and the trigger rendered as a raw browser button on a
// themed page. It shipped in 1.4.1 and survived a release, a browser
// audit and a contrast sweep, because a selector that matches nothing
// looks exactly like one that was never written: no error, no warning,
// just an element wearing different styles than intended. It was
// noticed by eye, on a different component, by the project's owner.
// That is the wrong detector.

const HERE = import.meta.url
const src = new URL('../src/', HERE)

// Utilities live in one place and are used from many components.
const SHARED = ['tokens/base.css']

// Classes rendered on purpose with no rules of their own: structural
// wrappers that need no styling, and modifier hooks a consumer can
// target. Listing one here is a statement that it is meant to be
// unstyled, which is the point: the list has to be edited deliberately,
// so a selector that stops matching cannot hide in it.
const INTENTIONALLY_UNSTYLED = {
  // The <nav> around the list. Semantic, not visual.
  breadcrumb: ['abaabil-breadcrumb'],
  // The <nav> and <li>; the step modifiers exist for consumers to hang
  // an icon or a different label on.
  pagination: [
    'abaabil-pagination',
    'abaabil-pagination__item',
    'abaabil-pagination__step--prev',
    'abaabil-pagination__step--next',
  ],
}

const sharedCss = SHARED.filter((f) => existsSync(new URL(f, src)))
  .map((f) => readFileSync(new URL(f, src), 'utf8'))
  .join('\n')

const components = readdirSync(src, { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name !== 'tokens')
  .map((e) => e.name)
  .filter((name) => existsSync(new URL(`${name}/${name}.css`, src)))

describe('css selectors match the classes components render', () => {
  for (const name of components) {
    it(`${name}: every rendered class has a rule`, () => {
      const css = readFileSync(new URL(`${name}/${name}.css`, src), 'utf8') + sharedCss
      const styled = new Set(
        [...css.matchAll(/\.(abaabil-[a-zA-Z0-9_-]+)/g)].map((m) => m[1]),
      )

      const rendered = new Set()
      for (const file of readdirSync(new URL(`${name}/`, src))) {
        if (!file.endsWith('.jsx')) continue
        const jsx = readFileSync(new URL(`${name}/${file}`, src), 'utf8')
        for (const m of jsx.matchAll(/['"`]((?:abaabil-[a-zA-Z0-9_-]+\s*)+)['"`\s$]/g)) {
          for (const cls of m[1].trim().split(/\s+/)) {
            // `abaabil-x__step--${dir}` leaves a truncated stem at the
            // interpolation; the concrete names are in the list above.
            if (cls.endsWith('--')) continue
            rendered.add(cls)
          }
        }
      }

      const allowed = new Set(INTENTIONALLY_UNSTYLED[name] ?? [])
      const unstyled = [...rendered].filter((c) => !styled.has(c) && !allowed.has(c))

      expect(
        unstyled,
        `${name} renders these with no rule in ${name}.css. Either style them, ` +
          'or add them to INTENTIONALLY_UNSTYLED in this file with a reason.',
      ).toEqual([])
    })
  }

  it('does not allow a class that is actually styled', () => {
    // Keeps the allowlist honest: if a hook later gets real styles, the
    // entry for it is stale and should go, or it stops meaning anything.
    for (const [name, classes] of Object.entries(INTENTIONALLY_UNSTYLED)) {
      const css = readFileSync(new URL(`${name}/${name}.css`, src), 'utf8') + sharedCss
      const styled = new Set(
        [...css.matchAll(/\.(abaabil-[a-zA-Z0-9_-]+)/g)].map((m) => m[1]),
      )
      for (const cls of classes) {
        expect(
          styled.has(cls),
          `${cls} is listed as intentionally unstyled but ${name}.css styles it`,
        ).toBe(false)
      }
    }
  })
})
