# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.6.1] - 2026-09-25

### Fixed

- **Carousel's buttons covered the slide.** They were positioned over
  the track, so the first and last 44px of every slide sat under a
  button. The carousel now reserves a gutter on each inline side and the
  buttons live there, beside the track.

## [1.6.0] - 2026-09-25

### Added

Eight components, each wrapping what the platform already ships rather
than reimplementing it. Field, otp, table, navigation-menu, context-menu,
menubar and carousel are server-renderable at `normal` and `styled`;
command is a client component at every tier, like tabs and combobox.

- **Added `field`** with `Field`, `Fieldset` and `Label`: the label, description and error wrapper that input, textarea, select and combobox carry inside their a11y tiers, available for any control including a consumer's own; the child is cloned with the ids or called as a function, and the required mark is drawn from the control's own attribute.
- **Added `otp`**, a one-time code field built from a single `<input>` with `autoComplete="one-time-code"`, `inputMode` and `pattern`, drawn as boxes in CSS, so paste, backspace and SMS autofill come from the browser instead of the focus-juggling that per-digit inputs need.
- **Added `command`**, a command palette built as an APG combobox inside a native `<dialog>`: substring filtering over label and keywords, grouped options, arrow keys that wrap and skip disabled items, a live result count, and an optional Meta/Ctrl shortcut, with `showModal()` supplying the modal behaviour.
- Added `table`: a styled, accessible `<table>` with caption, scoped column headers, custom cells, a keyboard-reachable scroll region, and uncontrolled sortable columns with `aria-sort` at the a11y tier.
- **Added `navigation-menu`**: site navigation as a `<nav>` of links whose dropdown entries are Popover API panels anchored by CSS; the a11y tier adds the nav name, `aria-current`, a live `aria-expanded` and the disclosure keyboard model, with no `role="menu"` at any tier.
- **Added `context-menu`**: a right-click, long-press and Shift+F10 menu over a region, built on the Popover API and positioned at the pointer with two inline properties; the a11y tier ports menu's APG keyboard handling and returns focus on close.
- **Added `menubar`**, the APG menubar pattern as a container for the consumer's own `Menu` elements: `role="menubar"`, one tab stop, Left/Right with wrapping, Home/End, ArrowDown to open, and sideways movement that closes the open menu and opens its neighbour, with no second implementation of the menu.
- **Added `carousel`**, a CSS scroll-snap track with previous and next buttons that call `scrollBy`, loop, reduced-motion handling, and an `a11y` tier with the APG carousel region, slide groups, `aria-controls`, edge `aria-disabled` and a "Slide n of N" live region.

## [1.5.1] - 2026-09-22

### Fixed

- **Every `styled` entry point shipped without its stylesheet.** The
  tier whose entire purpose is "adds the component's CSS" did not add
  it, in any Rollup or Vite build, for every component, since
  `sideEffects` was introduced.

  `package.json` declared `"sideEffects": ["*.css"]`, which is the
  advice you find everywhere and is wrong for this package. It marks
  every `.js` file in the library as free of side effects, and a
  bundler is then entitled to delete any module whose exports it can
  satisfy from elsewhere. Every `styled.js` is exactly that module: an
  `import './x.css'` followed by a re-export of `index.js`. Rollup
  dropped the file, rewrote the import to point straight at
  `index.js`, and the stylesheet went with it.

  Reproduced with a minimal Vite library build: `import Badge from
  'abaabil/badge/styled'` emitted no CSS asset at all, and emitted one
  as soon as the field was widened.

  It went unseen for five releases because this library's own
  documentation site imports the `a11y` tier everywhere, and those
  contain real code, so the bundler keeps them. It surfaced only when
  1.5.0 added `collapsible`, whose `a11y` tier is a pure re-export like
  the styled ones, and the site's own build asserted that the
  collapsible page rendered a component with none of its CSS.

  `sideEffects` is now `["*.css", "./dist/*/styled.js",
  "./dist/*/a11y.js"]`, which is the honest statement: a module that
  imports a stylesheet has a side effect.

  This is the third time an unstyled component has shipped here, after
  the doubled `.abaabil-abaabil-popover__trigger` prefix in 1.4.1 and
  the site's own code splitting. All three were invisible to the tests
  that existed, because a component with no styles renders perfectly
  and reports nothing.

### Added

- `test/side-effects.test.js`, which fails if any built module imports
  a stylesheet without `sideEffects` covering it. Checked against the
  old value before shipping: it fails on 64 of 97 files, which is all
  32 styled tiers and all 32 a11y tiers.

## [1.5.0] - 2026-09-22

### Added

Nine components, taking the library from twenty-three to thirty-two.
They were chosen by listing what the nine libraries in the comparison
harness actually export and counting how many ship each thing abaabil
does not, then keeping only the ones the browser mostly does already.
Date pickers, data grids, trees, colour pickers, carousels and command
palettes came out of that count too and are deliberately still absent.

- **`abaabil/toast`** with `Toast`, `ToastRegion` and `ToastLive`.
  Seven of the eight libraries scanned ship one, and outside them
  `react-toastify` and `react-hot-toast` together pull nearly six
  million weekly installs that no meta-framework is dragging in.

  There is no `toast()` function. An imperative API needs a
  module-level store, a subscription and a root you must remember to
  mount, which is a state manager shipped inside a component library.
  You keep the list; this renders and announces it.

  The region must be mounted once, empty, and left there: a live region
  inserted together with its first message announces nothing in most
  screen readers, because there was no region to change. That is the
  single most common way this pattern breaks and it cannot be fixed
  from inside `Toast`. Politeness is derived from the variant rather
  than left to the caller, because everything feels urgent to the
  person writing it and a stream of assertive messages makes a page
  unusable with a screen reader. The dismiss timer pauses on hover, on
  focus within, and while the tab is hidden.

- **`abaabil/drawer`**. A modal panel pinned to an edge, which is a
  modal `<dialog>` with different geometry, so it is one. `side` is
  logical, so `end` is the right edge in English and the left in
  Arabic. The entry animation is `@starting-style`, so nothing holds an
  "is opening" flag.

- **`abaabil/alert-dialog`**. A `<dialog>` with `role="alertdialog"`.
  Separate from `abaabil/dialog` rather than a variant of it because
  the two differ in more than a role: it requires a description, it
  does not light-dismiss, and it moves focus to the element marked
  `data-safe-action`. The platform focuses the first focusable child,
  and a confirmation that opens with Delete focused is one Enter from
  deleting.

- **`abaabil/toggle`** with `Toggle` and `ToggleGroup`. The group is
  radio and checkbox inputs, not buttons with `aria-pressed`. Arrow-key
  movement, wrapping, one tab stop for the set, skipping disabled
  members and form submission all arrive from the browser; roving
  tabindex is most of what a toggle group costs elsewhere. The inputs
  are clipped rather than hidden, because a hidden input is not
  focusable and every one of those behaviours would go with it.

- **`abaabil/collapsible`**. `accordion`'s `Disclosure` without the
  group, so one section does not require importing an accordion's
  stylesheet. All three tiers ship no JavaScript.

- **`abaabil/card`**. The thinnest component here and the one with the
  weakest claim to being one. Its `a11y` tier requires `headingLevel`
  alongside `heading` and refuses to guess: the right level depends on
  where the card sits, and a page of `<h3>`s under no `<h2>` is a
  broken outline that looks fine.

- **`abaabil/separator`**. An `<hr>`. Worth a component because a
  vertical one is announced as horizontal however it is rotated in CSS,
  and because a purely decorative rule should be hidden rather than
  read out between every row of a list.

- **`abaabil/spinner`** and **`abaabil/skeleton`**. The spinner
  announces through `role="status"`; the skeleton is always hidden from
  assistive technology, with no opt-out, because grey bars read aloud
  are noise. Under `prefers-reduced-motion` the spinner pulses rather
  than freezing, since it still has to say work is happening, while the
  skeleton simply stops, since it communicates by occupying space.

Twenty-seven new entry points. Fifteen of them carry no `'use client'`:
separator, spinner, skeleton, collapsible and toggle are server-safe at
every tier.

### Fixed

- **The spinner's ring was invisible in dark mode when first written.**
  It drew the track in `--color-border` and the moving arc in the
  accent, which is 1.65:1 in light and 1.13:1 in dark, so the component
  spun and looked like a static circle. Caught by adding the pairing to
  `test/contrast.test.js` before shipping it. The fix was to use
  `--color-track`, the token that already means "the empty part of a
  track", whose pairing against the accent was already guarded.

- **`scripts/check-complete.js` could not see hyphenated components.**
  Its reverse check, which catches an exports entry with no source
  directory behind it, matched `[a-z]+` only, so `./alert-dialog` would
  have been skipped silently. Now `[a-z-]+`.

- **`scripts/measure.js` derived nothing from the component list.** The
  CSS budget was 7000 B against an actual 5231 B, and nine stylesheets
  took it to about 6830 B. It was raised to 8000 rather than left to
  fail on whatever was added next, which is a budget doing its job a
  release late.

### Added (tokens)

- `--radius-sm`, for the parts that sit inside something already
  rounded: a skeleton bar, a toggle inside a group. `--radius-md` on a
  child of a `--radius-md` box reads as two corners fighting.

## [1.4.3] - 2026-09-21

### Fixed

- **The popover and menu trigger styles never applied.** Both rules were
  written `.abaabil-abaabil-popover__trigger` and
  `.abaabil-abaabil-menu__trigger`, a doubled prefix, so they matched
  nothing. The triggers rendered as raw browser buttons: a light grey
  UA button face with black text, on a themed page, in either theme.

  This was introduced by the contrast fix in 1.4.1, which means the
  fix described there for those two components never took effect. The
  irony is that breaking the selector also disabled the
  `color: inherit` that caused the original 1.08:1 failure, so the
  contrast was accidentally fine at 18.26:1 while the appearance was
  wrong. The styles now apply as 1.4.1 intended.

### Added

- `test/css-selectors.test.js`: every class a component renders must
  have a rule in its stylesheet, or be listed as a deliberate hook with
  a reason.

  A selector that matches nothing looks exactly like one that was never
  written. No error, no warning, no failing test: the element simply
  wears different styles than intended. This one shipped in a release,
  then survived a browser audit and a contrast sweep, and was found by
  eye by the project's owner looking at a different component. The
  allowlist is explicit so that a rule which stops matching cannot hide
  in it, and a second test fails if a class on that list turns out to
  be styled after all.

## [1.4.2] - 2026-09-21

### Fixed

- **The hover state of a filled button failed WCAG 1.4.3 in the stock
  theme.** `--color-primary-hover` mixed `--color-primary` toward white.
  The label on that fill is `--color-primary-fg`, which is also white,
  so every step the fill took toward white took it closer to its own
  text: the default blue hovered to `#467aee` and carried white at
  **3.98:1**, under the 4.5 body text needs. Hovering is a state, and
  1.4.3 does not stop applying during one.

  The token now mixes toward black, so the fill moves away from the
  label rather than toward it, and the stock blue reads 6.64:1 hovered.
  Any accent dark enough to carry a white label at rest carries it
  hovered too, which was not previously true of any accent at all.

  In dark mode a hovered button now sits slightly closer to the page
  than a resting one. That is the right trade: hover is a pointer
  affordance, the resting state is what carries the 1.4.11 boundary
  requirement, and a label nobody can read is not negotiable.

  If you set `--color-primary-hover` yourself, nothing changes. If you
  relied on the hover being lighter, it is now darker.

### Added

- Two pairings in `test/contrast.test.js`. The first asserts
  `--color-primary-fg` against `--color-primary-hover`, which is the
  check whose absence let the above ship: the resting pair sat at a
  comfortable 5.17:1 and reported everything fine. The second asserts
  the hover is still a *visible* change from the resting colour, between
  1.1:1 and 2:1, because the first check on its own is satisfied by a
  button that turns black.

## [1.4.1] - 2026-09-21

A colour audit of all twenty-three components, in both themes, against
WCAG 1.4.3 (text, 4.5:1) and 1.4.11 (controls and their states, 3:1).
Nothing about the API changed; several things that were invisible now are
not. If you have overridden any of these tokens, re-read the neutrals
table in the README, because two of them have swapped jobs.

### Fixed

Text and control colours that did not meet their contrast floor:

- `--color-border` was `#d1d5db`, **1.47:1** on the surface. It is the
  only thing marking where an input is, since an input's background is
  the same colour as the page, so at that ratio the field boundary was
  not there for anyone who needed it. Now `#8b929e` (3.13:1) in light
  and `#5b6675` (3.28:1) in dark.
- `--color-placeholder` was **2.54:1**. Placeholder text is text.
- `--color-success` was **3.30:1** as text in light mode;
  `--color-danger` was **3.97:1** in dark, and `--color-warning`
  likewise. Each is now at or above 4.5:1 in both themes.
- The popover and menu triggers set `color: inherit` over the browser's
  own button face and nothing else, which in dark mode was **1.08:1**:
  dark grey text on a light grey UA button. Both now bring their own
  surface, border, text colour and focus ring.
- The unavailable step in a paginator was drawn at `opacity: 0.6`,
  **2.32:1**. It is plain text, not a disabled control, so the 1.4.3
  exemption does not cover it. Now 4.83:1.
- A progress bar's track and a slider's groove had no boundary, so at
  **1.07:1** against the page a bar at 0% was nothing at all and a bar
  at 40% was a blue stripe with no indication of what it was 40% of.
  Both now have a `--color-border` edge.
- A switch's thumb is `--color-surface`, and its off state was
  `--color-muted`: **1.08:1** in light, 1.31:1 in dark. The thumb's
  position is the entire non-colour cue for on versus off, so the state
  rested on hue alone. The off state is now `--color-border`.
- The combobox's active option, where `aria-activedescendant` points and
  the only thing telling a sighted keyboard user what Enter will choose,
  shared the `:hover` rule and so was marked by a **1.07:1** wash. It is
  now the primary fill with `--color-primary-fg` text, and it wins over
  `:hover` so the pointer cannot override the keyboard position.

### Added

- **`--color-track`**, the empty part of a progress bar or slider
  groove. It was `--color-muted`, which also serves as the hover wash,
  and the two want opposite things: a wash sits a hair off the surface,
  a track stays clear of the fill drawn over it. In dark mode that
  conflict put a blue fill on a grey track at 2.84:1. The tokens share a
  value in light mode and diverge in dark.
- **`--color-border-subtle`**, for rules that carry no information:
  accordion dividers, a toolbar separator. These kept the old quiet
  `#d1d5db` so that raising `--color-border` to a visible weight did not
  drag every decorative hairline up with it.
- `test/contrast.test.js` - sixteen pairings per theme, each one that
  actually occurs in a component, computed from the token sources and
  asserted against the floor WCAG sets for it. The audit that found all
  of the above was a browser sweep, which the suite cannot run; this
  holds the fixed points it landed on, so a token edit that drops one
  back under the line fails in milliseconds rather than surviving until
  someone next thinks to open a browser. It also checks that the two
  dark-mode blocks, which CSS forces to be written twice, still agree.

### Changed

- The dark palette is defined once as `--abaabil-dark-*` primitives and
  assigned by both the `prefers-color-scheme` block and the
  `[data-theme="dark"]` block, rather than written out twice. The values
  had no way to stay in step before; now they cannot drift.
- `Pagination`'s `label` prop is documented for the case a page has two
  paginators, above and below a list. Both default to "Pagination", and
  two navigation landmarks with one name is a real finding. Only the
  page knows the second paginator is the same list again, so this is
  guidance, not a fix the component can make.

## [1.4.0] - 2026-09-21

### Added

Five components, taking the library from eighteen to twenty-three. Two
carry real accessibility work, one wraps a native element that is
genuinely painful to do by hand, and two are the presentational pieces a
design system is expected to have, each with a trap worth encoding.

- **`abaabil/pagination`** - a `<nav>` around an ordered list of real
  links, so a page is a URL you can open in a new tab and share; a
  paginator built from buttons gives that up for nothing. Server
  renderable at every tier. The gap is drawn in CSS so an ellipsis is
  never read out between numbers, and it only appears when it stands in
  for two or more pages. Every number is named "Page 7" rather than
  announced as a bare "7", and all four labels are replaceable for
  translation.
- **`abaabil/file`** - a real `<input type="file">`, not a button with a
  hidden input behind it. That pattern reimplements the label
  association, the keyboard activation and the announcement of the
  chosen file, and usually manages one of the three;
  `::file-selector-button` means the real control can be styled
  instead. Warns when `accept` is set with nothing explaining it in
  words, because `accept` is never announced and does not apply to a
  dropped file.
- **`abaabil/toolbar`** - the APG toolbar pattern. The point is the tab
  sequence: eight buttons are eight stops on the way past them, and as
  a toolbar they are one. Takes arbitrary children rather than an items
  array, since a toolbar's contents are heterogeneous by definition,
  and manages `tabindex` on its focusable descendants directly because
  cloning only reaches the top level. A control that needs the arrows
  itself keeps them.
- **`abaabil/avatar`** - an image, or initials when there is none. No
  fallback-on-load-error: that needs state, and would make every tier a
  client component for a case the server usually already knows about.
  The a11y tier asks whether the avatar repeats something already on
  screen, because the answer changes per use and the component cannot
  guess. The initials are never the accessible name; "FA" read aloud is
  not a person.
- **`abaabil/badge`** - shorthand that only means something beside what
  it is attached to. `context` supplies the rest of the sentence as
  hidden text, so a badge draws "3" and announces "3 unread messages".
  Hidden text rather than `aria-label`, because a `<span>` has no role
  and discards it. That is not hypothetical: it is the bug found in
  this library's own popover one release ago.

Fifty-one of the sixty-nine entry points carry no client directive.
Nine components are server-renderable at every tier, up from six.

### Fixed

- **Re-theming only went halfway.** `--color-primary-hover` and
  `--color-focus-ring` were pinned to blue primitives rather than
  derived from `--color-primary`, so setting the primary colour to red
  gave a red button with a blue hover state and a blue focus ring on
  every control in the library, with nothing saying so. Both now follow
  `--color-primary`. The stock theme is unchanged for the focus ring,
  which was already the same value, and the default hover moves from
  `#3b82f6` to `#467aee`, which is the same blue to look at.
  `--abaabil-blue-400` existed only to feed the old hover and is
  removed: a primitive nothing reads is one someone overrides expecting
  a result, and gets none.
- `pageWindow` emitted a gap where it stood in for exactly one page, so
  at page 4 of 12 an ellipsis replaced page 2: the same width as the
  number it hid, carrying less. Caught by its own test rather than by
  looking at it.

## [1.3.0] - 2026-09-21

### Added

Five components, taking the library from thirteen to eighteen. Two of
them are the things people ask for most and are hard; three are nearly
free because the platform already does the work.

- **`abaabil/menu`** - the W3C APG menu button pattern on top of the
  native Popover API. The browser supplies the top layer, the
  outside-click dismissal and Escape; this supplies `role="menu"`, a
  roving tabindex, Up/Down with wrapping, Home/End, multi-character
  typeahead, Tab to close, and focus moving into the menu on open and
  back to the trigger on close. `aria-expanded` is driven by the panel's
  own `toggle` event rather than a second copy of the open state, since
  the browser can close the panel without telling the component. Its
  docs say when a menu is the wrong widget: a button revealing
  navigation links is a popover, not a menu.
- **`abaabil/tooltip`** - shows on `:hover` and `:focus-within`, which
  are selectors, so the `normal` and `styled` tiers need no JavaScript
  at all. The `a11y` tier adds the two things CSS cannot: the
  `aria-describedby` that makes a screen reader read it, and Escape to
  dismiss, which WCAG 1.4.13 requires. The docs lead with when not to
  use one.
- **`abaabil/progress`** - native `<progress>`. `value` has no default,
  so omitting it gives a genuinely indeterminate bar rather than one
  claiming to be 0% done. `valueText` sets `aria-valuetext`, because a
  bar whose number is not a percentage is otherwise announced as one.
- **`abaabil/slider`** - native `<input type="range">`, so the keyboard
  support and the min/max/step arithmetic are the platform's.
  `formatValue` sets `aria-valuetext` and the optional visible
  `<output>`, which is marked `aria-hidden` so the value is not
  announced twice.
- **`abaabil/breadcrumb`** - a `<nav>` around an ordered list, because
  the order is the information. Server-renderable at every tier. The
  separator is drawn in CSS so it is never read aloud, the `<nav>` is
  named, and the last item renders as text with `aria-current="page"`.

Thirty-six of the fifty-four entry points now carry no client directive.
Six components are server-renderable at every tier including `a11y`, up
from four.

`role="tooltip"` is deliberately **not** in tooltip's `normal` tier,
unlike `role="switch"` in switch's. The difference: a switch's role
changes how a reachable interactive control is announced, so it does
something on its own. A tooltip is only ever reached through the
`aria-describedby` on its trigger, so the role without that association
announces nothing, and it belongs with the wiring that gives it meaning.

Three bugs were found by driving these in a real browser, after 511
jsdom tests had passed. All three are the same shape: jsdom does not run
the thing that was broken.

- Menu focused its first item inside `requestAnimationFrame`, which does
  not fire in a background tab, so focus silently never moved there. The
  `toggle` event already fires with the panel in the top layer and
  focusable, so the focus call is synchronous now.
- Menu read the active index from state, so two keydowns arriving in the
  same tick both moved one step from the same origin: holding ArrowDown
  advanced one item and stopped. The index is a ref now. Covered by a
  test that dispatches two raw events inside one `act`, which is the
  only way to reproduce it, since `fireEvent` flushes between calls.
- Tooltip put its fade on the shown state, so whenever the transition
  did not advance the bubble stayed at opacity 0 while every selector
  said it should be visible: a tooltip that silently never appears. The
  fade is on the hidden state now and showing is instant, which is also
  the better behaviour for a tooltip.

Two more came out of a full accessibility audit of all eighteen
components, run with axe against a real browser. Both were silent: the
component looked right, the tests passed, and the thing it claimed to add
was being discarded.

- **`popover/a11y` was not naming its panel at all.** A bare
  `<div popover>` has no role, and `aria-label` is prohibited on a
  generic element, so the label was dropped: the panel computed to role
  `null` with no accessible name, and axe flags it as
  `aria-prohibited-attr`. The panel is `role="group"` now, overridable
  with `role`. Naming the panel was this tier's entire contribution, so
  until now it added 484 bytes and achieved nothing.
- **`progress/a11y` was not naming its bar.** `<progress>` is a labelable
  element, so `<label for>` is not wrong, but no accessible name is
  computed from it: axe names an `<input>` from identical markup and
  names neither `<progress>` nor `<meter>`. `aria-labelledby` now points
  at the label, making the name explicit instead of leaving it to differ
  between implementations.

The audit itself had to be redone once. The first pass rendered the
dialog open, and a modal dialog makes everything behind it inert, so the
sweep that reported zero violations had not actually examined the other
seventeen components.

### Fixed

- `dist/combobox/index.js` and `dist/combobox/styled.js` had no size
  budget. Combobox was the first component built and only its `a11y`
  tier was ever listed, so two entry points had been unwatched since
  1.0.0. Found by the new registration check, not by noticing.

### Added (tooling)

- `llms.txt`, shipped inside the package. It is the short version of the
  README written for coding agents: the rules that are easy to get wrong
  (no root export, import `theme.css` once, prefer the `a11y` tier) and
  the per-component traps (popover needs an explicit `id`, alert has to
  exist before it has a message, combobox and tabs are uncontrolled). An
  agent with `node_modules` can read it without the network. It reaches
  npm with the next release.
- `AGENTS.md` at the repository root, for agents changing the library
  rather than using it: the enforced architecture rules, the conventions,
  and the seven steps for adding a component.

## [1.2.0] - 2026-09-21

### Added

Five components, taking the library from eight to thirteen. Each ships the
same three tiers.

- **`abaabil/textarea`** - a native `<textarea>` with the same label,
  description, error and `aria-describedby` wiring as `input`. The most
  obvious gap in a library that already had five form controls.
- **`abaabil/switch`** - a native checkbox carrying `role="switch"`. The
  role sits in the `normal` tier, not the `a11y` tier: it is the
  component's identity, the way `<dialog>` and `<details>` are for the
  components built on them, and without it the styled tier would look like
  a switch while announcing itself as a checkbox. No `aria-checked`; the
  native `checked` property already exposes the state.
- **`abaabil/popover`** - the native Popover API. The trigger, the top
  layer, light-dismiss and Escape all come from the browser, so all three
  tiers ship **zero JavaScript** and all three are server-renderable. It
  needs an explicit `id` rather than generating one, because generating
  one would mean `useId`, which would mean a client boundary, which would
  cost the component the only property that makes it interesting. It is
  the one component with a floor of its own: Chrome 114, Firefox 125,
  Safari 17.
- **`abaabil/tabs`** - the W3C APG tabs pattern, with roving tabindex,
  arrow keys, Home/End, both orientations and both activation modes. The
  only new component whose `a11y` tier does substantial work, because tabs
  have no native element behind them. Client at every tier for the same
  reason combobox is.
- **`abaabil/alert`** - a live region. The role follows the variant, since
  the right answer is the same every time and getting it wrong is the
  common failure: `info` and `success` announce politely, `warning` and
  `danger` interrupt. Read the caveat in the README about when a live
  region actually announces; it decides whether this works at all.

Also added: `--color-success` and `--color-warning` semantic tokens, which
alert needs and nothing else previously did.

Twenty-six of the thirty-nine entry points now carry no client directive.
Four components are server-renderable at every tier including `a11y`
(button, accordion, popover, alert), up from two.

### Fixed

Documentation errors from 1.1.0, all of the same kind: figures typed in by
hand that had stopped being true.



- Corrected the headline size comparison in `README.md`. It claimed
  `dialog/a11y` at 674 B against `@radix-ui/react-dialog` at 3,422 B. The
  Radix figure was measured by importing only `Dialog.Root`, which renders
  nothing; a dialog you can actually open needs `Root`, `Trigger`, `Portal`,
  `Overlay`, `Content`, `Title` and `Close`, and costs 13,493 B. Both sides
  are now measured the same way, at 580 B against 13,493 B. The correction
  is less favourable to Radix, not more.
- Regenerated the delivered-size table in `README.md`. It was still printing
  1.0.0's figures in the 1.1.0 release, several of them out by more than
  10% (`checkbox/a11y` read 600 B against an actual 534 B, `radio/a11y`
  542 B against 444 B). The table is now generated from the published
  package rather than copied by hand.
- Noted in `README.md` that a `styled` entry can measure a byte or two below
  its `normal` entry. That is compression noise: `styled` is `normal` plus a
  CSS side-effect import, so the JavaScript is identical.

## [1.1.0] - 2026-09-21

### Added

- `abaabil/accordion`, `abaabil/accordion/styled`, and `abaabil/accordion/a11y` now each default-export their main component (`Accordion` and `Accordion_a11y` respectively), in addition to the existing named exports. This was a bug fix, not a feature: every other component in the library default-exports its main component at every tier, and accordion was the only one that did not. The README's own documented import for the `a11y` tier, `import { Accordion } from 'abaabil/accordion/a11y'`, was `undefined` in the published 1.0.0 package, because that tier only exported `Accordion_a11y` as a named export. The default export fixes that import path. Existing named imports (`{ Accordion }` from `abaabil/accordion` or `abaabil/accordion/styled`, `{ Accordion_a11y }` from `abaabil/accordion/a11y`) continue to work unchanged.
- Added a `"./package.json"` entry to the `exports` map, so `require('abaabil/package.json')` and the dynamic-import equivalent resolve instead of failing with `ERR_PACKAGE_PATH_NOT_EXPORTED`. There is still no root `"."` export; that remains unchanged.

### Fixed

- Corrected every accordion import example in `README.md` to match what the package actually exports.

## [1.0.0] - 2026-09-20

### Added

- Initial release: eight components (button, dialog, combobox, input, checkbox, radio, select, accordion), each shipped as three entry-point tiers (`normal`, `styled`, `a11y`).
- Zero runtime dependencies, `react`/`react-dom` as peer dependencies.
- CSS theming via `abaabil/theme.css` and `abaabil/styles.css`.
