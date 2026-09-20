import '@testing-library/jest-dom/vitest'

// jsdom does not fully implement HTMLDialogElement. Provide a minimal,
// faithful shim: showModal()/show() set `open`, close() clears it and
// fires a 'close' event, matching the spec's observable behaviour.
if (typeof HTMLDialogElement !== 'undefined') {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.open = true
      this.setAttribute('open', '')
    }
  }
  if (!HTMLDialogElement.prototype.show) {
    HTMLDialogElement.prototype.show = function () {
      this.open = true
      this.setAttribute('open', '')
    }
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.open = false
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }
  }
}

// Accessibility matchers. Lives here rather than in each suite so every test
// file gets them without repeating the wiring.
import { toHaveNoViolations } from 'jest-axe'
import { expect } from 'vitest'
expect.extend(toHaveNoViolations)
