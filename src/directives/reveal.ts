import type { Directive } from 'vue'

// Scroll-reveal: elements fade + rise into view the first time they enter the
// viewport. Usage: `v-reveal` (no delay) or `v-reveal="120"` (120ms stagger).
//
// The hidden state is applied via a `data-reveal` attribute (not a class) so
// Vue's own class patching can never wipe it, and it is set in `beforeMount`
// (after Vue applies props, before the element paints) so there is no flash of
// visible-then-hidden content.

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isSupported() {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window
}

let observer: IntersectionObserver | null = null

function getObserver() {
  if (observer) {
    return observer
  }

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-reveal', 'in')
          observer?.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
  )

  return observer
}

export const vReveal: Directive<HTMLElement, number | undefined> = {
  beforeMount(el, binding) {
    if (prefersReducedMotion() || !isSupported()) {
      return
    }

    el.setAttribute('data-reveal', '')
    if (typeof binding.value === 'number' && binding.value > 0) {
      el.style.setProperty('--reveal-delay', `${binding.value}ms`)
    }
  },
  mounted(el) {
    if (!el.hasAttribute('data-reveal')) {
      return
    }

    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
