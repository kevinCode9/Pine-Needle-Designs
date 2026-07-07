<template>
  <template v-if="isDashboard || hideLayout">
    <router-view />
  </template>

  <template v-else>
    <GlobalHeader :chrome-dimmed="isDesktopPageScrolling" @toggle-cart="toggleCart" />

    <main>
      <router-view />
    </main>

    <GlobalFooter :chrome-dimmed="isDesktopPageScrolling" />

    <button
      v-if="cartStore.totalItems > 0 && !cartStore.isOpen"
      ref="floatingCartButton"
      class="floating-cart-btn"
      type="button"
      aria-label="Open cart"
      :style="floatingCartStyle"
      @click="handleFloatingCartClick"
      @pointerdown="startFloatingCartDrag"
    >
      <i class="bi bi-bag"></i>
      <span class="floating-cart-btn__count">
        {{ cartStore.totalItems }}
      </span>
    </button>

    <CartSidebar />
  </template>

  <LoginDialog @success="handleLoginSuccess" />
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GlobalHeader from './components/GlobalHeader.vue'
import GlobalFooter from './components/GlobalFooter.vue'
import CartSidebar from './components/CartSidebar.vue'
import LoginDialog from './components/LoginDialog.vue'
import { useCartStore } from './stores/cart'
import { useAuthStore } from './stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const handleLoginSuccess = async () => {
  const redirect = authStore.redirectAfterLogin
    || (typeof route.query.redirect === 'string' ? route.query.redirect : '')
    || '/dashboard'

  authStore.closeLoginDialog()
  await router.replace(redirect)
}

const hideLayout = computed(() => route.meta.hideLayout)

const isDashboard = computed(() =>
  route.path.startsWith('/dashboard')
)

const cartStore = useCartStore()

const toggleCart = () => {
  cartStore.toggleOpen()
}

const floatingCartButton = ref(null)
const floatingCartPosition = ref(null)
const floatingCartDrag = ref(null)
const suppressFloatingCartClick = ref(false)
const isDesktopPageScrolling = ref(false)
const desktopScrollFadeEnabled = ref(false)
const floatingCartPositionKey = 'pine-needle-floating-cart-position'
const floatingCartMargin = 8
const floatingCartDragThreshold = 4
const desktopScrollFadeQuery = '(min-width: 0px)'
const scrollFadeDelay = 320
let desktopScrollFadeMedia = null
let scrollFadeTimer = null

const isFloatingCartDimmed = computed(() =>
  isDesktopPageScrolling.value && !floatingCartDrag.value
)

const floatingCartStyle = computed(() => {
  const styles = isFloatingCartDimmed.value
    ? {
        opacity: '0.14',
        pointerEvents: 'none',
        transform: 'scale(0.96)',
      }
    : {}

  if (!floatingCartPosition.value) return styles

  return {
    ...styles,
    left: `${floatingCartPosition.value.x}px`,
    top: `${floatingCartPosition.value.y}px`,
    right: 'auto',
    bottom: 'auto',
  }
})

const clampFloatingCartPosition = (x, y) => {
  const button = floatingCartButton.value
  const width = button?.offsetWidth || 58
  const height = button?.offsetHeight || 58
  const maxX = Math.max(floatingCartMargin, window.innerWidth - width - floatingCartMargin)
  const maxY = Math.max(floatingCartMargin, window.innerHeight - height - floatingCartMargin)

  return {
    x: Math.min(Math.max(x, floatingCartMargin), maxX),
    y: Math.min(Math.max(y, floatingCartMargin), maxY),
  }
}

const saveFloatingCartPosition = () => {
  if (!floatingCartPosition.value) return

  try {
    window.localStorage.setItem(floatingCartPositionKey, JSON.stringify(floatingCartPosition.value))
  } catch (error) {
    console.error('Failed to save cart bubble position:', error)
  }
}

const loadFloatingCartPosition = () => {
  try {
    const savedPosition = JSON.parse(window.localStorage.getItem(floatingCartPositionKey) || 'null')
    if (!savedPosition || !Number.isFinite(savedPosition.x) || !Number.isFinite(savedPosition.y)) return

    floatingCartPosition.value = clampFloatingCartPosition(savedPosition.x, savedPosition.y)
  } catch (error) {
    console.error('Failed to read cart bubble position:', error)
  }
}

const startFloatingCartDrag = (event) => {
  if (event.button !== undefined && event.button !== 0) return

  const button = floatingCartButton.value
  if (!button) return

  const rect = button.getBoundingClientRect()
  floatingCartDrag.value = {
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startX: rect.left,
    startY: rect.top,
    moved: false,
  }
  floatingCartPosition.value = clampFloatingCartPosition(rect.left, rect.top)
  button.setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', handleFloatingCartDrag)
  window.addEventListener('pointerup', stopFloatingCartDrag)
  window.addEventListener('pointercancel', stopFloatingCartDrag)
}

const handleFloatingCartDrag = (event) => {
  const drag = floatingCartDrag.value
  if (!drag || event.pointerId !== drag.pointerId) return

  const deltaX = event.clientX - drag.startClientX
  const deltaY = event.clientY - drag.startClientY
  const movedEnough = Math.hypot(deltaX, deltaY) >= floatingCartDragThreshold

  if (!drag.moved && movedEnough) {
    drag.moved = true
  }

  if (!drag.moved) return

  event.preventDefault()
  floatingCartPosition.value = clampFloatingCartPosition(drag.startX + deltaX, drag.startY + deltaY)
}

const stopFloatingCartDrag = (event) => {
  const drag = floatingCartDrag.value
  if (!drag || event.pointerId !== drag.pointerId) return

  if (drag.moved) {
    suppressFloatingCartClick.value = true
    saveFloatingCartPosition()
    window.setTimeout(() => {
      suppressFloatingCartClick.value = false
    }, 150)
  }

  floatingCartButton.value?.releasePointerCapture?.(event.pointerId)
  floatingCartDrag.value = null
  window.removeEventListener('pointermove', handleFloatingCartDrag)
  window.removeEventListener('pointerup', stopFloatingCartDrag)
  window.removeEventListener('pointercancel', stopFloatingCartDrag)
}

const handleFloatingCartClick = () => {
  if (suppressFloatingCartClick.value) return

  toggleCart()
}

const keepFloatingCartInView = () => {
  if (!floatingCartPosition.value) return

  floatingCartPosition.value = clampFloatingCartPosition(
    floatingCartPosition.value.x,
    floatingCartPosition.value.y
  )
  saveFloatingCartPosition()
}

const stopScrollFadeTimer = () => {
  if (!scrollFadeTimer) return

  window.clearTimeout(scrollFadeTimer)
  scrollFadeTimer = null
}

const finishPageScroll = () => {
  isDesktopPageScrolling.value = false
  scrollFadeTimer = null
}

const handlePageScroll = () => {
  if (!desktopScrollFadeEnabled.value) return

  isDesktopPageScrolling.value = true
  stopScrollFadeTimer()
  scrollFadeTimer = window.setTimeout(finishPageScroll, scrollFadeDelay)
}

const setDesktopScrollFadeEnabled = (matches) => {
  desktopScrollFadeEnabled.value = matches
  if (!matches) {
    stopScrollFadeTimer()
    isDesktopPageScrolling.value = false
  }
}

const handleDesktopScrollFadeChange = (event) => {
  setDesktopScrollFadeEnabled(event.matches)
}

onMounted(() => {
  loadFloatingCartPosition()
  desktopScrollFadeMedia = window.matchMedia(desktopScrollFadeQuery)
  setDesktopScrollFadeEnabled(desktopScrollFadeMedia.matches)
  desktopScrollFadeMedia.addEventListener?.('change', handleDesktopScrollFadeChange)
  desktopScrollFadeMedia.addListener?.(handleDesktopScrollFadeChange)
  window.addEventListener('resize', keepFloatingCartInView)
  window.addEventListener('scroll', handlePageScroll, { passive: true })
})

onBeforeUnmount(() => {
  stopScrollFadeTimer()
  desktopScrollFadeMedia?.removeEventListener?.('change', handleDesktopScrollFadeChange)
  desktopScrollFadeMedia?.removeListener?.(handleDesktopScrollFadeChange)
  window.removeEventListener('resize', keepFloatingCartInView)
  window.removeEventListener('scroll', handlePageScroll)
  window.removeEventListener('pointermove', handleFloatingCartDrag)
  window.removeEventListener('pointerup', stopFloatingCartDrag)
  window.removeEventListener('pointercancel', stopFloatingCartDrag)
})
</script>

<style scoped>
.floating-cart-btn {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 930;
  width: 58px;
  height: 58px;
  border: 0;
  border-radius: 50%;
  background: var(--accent);
  color: var(--white);
  box-shadow: var(--shadow);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24pt;
  line-height: 1;
  cursor: pointer;
  touch-action: none;
  user-select: none;
  transition: opacity 180ms ease, transform 180ms ease, background 180ms ease;
}

.floating-cart-btn:hover {
  background: var(--accent-2);
  transform: translateY(-2px);
}

.floating-cart-btn:focus-visible {
  outline: 3px solid var(--brand-red-45);
  outline-offset: 4px;
}

.floating-cart-btn__count {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 22px;
  height: 22px;
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--error);
  color: var(--white);
  border: 2px solid var(--white);
  font-size: 10pt;
  font-weight: 700;
  line-height: 16px;
}

@media (max-width: 640px) {
  .floating-cart-btn {
    right: 14px;
    bottom: calc(92px + env(safe-area-inset-bottom));
    width: 54px;
    height: 54px;
    font-size: 22pt;
  }
}
</style>
