<template>
  <article
    class="collection-product-slider"
    :aria-label="`${collection.title} product slider`"
    tabindex="0"
    @keydown.left.prevent="previous"
    @keydown.right.prevent="next"
  >
    <div class="collection-product-slider__header">
      <div class="collection-product-slider__heading">
        <p class="collection-product-slider__eyebrow">{{ presentation.eyebrow }}</p>
        <h3>{{ presentation.heading }}</h3>
      </div>
      <div v-if="products.length > 1" class="collection-product-slider__quick-controls" aria-label="Quick product navigation">
        <button
          type="button"
          :aria-label="`Previous ${collection.title} product`"
          @click="previous"
        >
          <i class="bi bi-chevron-left" aria-hidden="true"></i>
        </button>
        <span aria-live="polite">{{ currentIndex + 1 }} / {{ products.length }}</span>
        <button
          type="button"
          :aria-label="`Next ${collection.title} product`"
          @click="next"
        >
          <i class="bi bi-chevron-right" aria-hidden="true"></i>
        </button>
      </div>
    </div>

    <div class="collection-product-slider__descriptions" aria-live="polite">
      <p
        v-for="(product, index) in products"
        :key="`description-${product.id}`"
        class="collection-product-slider__description"
        :class="{ 'collection-product-slider__description--active': index === currentIndex }"
        :aria-hidden="index !== currentIndex"
      >
        {{ product.description }}
      </p>
    </div>

    <div
      class="collection-product-slider__stage"
      :class="{ 'collection-product-slider__stage--dragging': isDragging }"
      aria-live="polite"
      @pointerdown="pointerDown"
      @pointermove="pointerMove"
      @pointerup="pointerUp"
      @pointercancel="pointerCancel"
      @wheel="wheel"
      @click.capture="clickCapture"
    >
      <button
        v-if="products.length > 1"
        class="collection-product-slider__control collection-product-slider__control--previous"
        type="button"
        :aria-label="`Previous ${collection.title} product`"
        @click="previous"
      >
        <i class="bi bi-chevron-left" aria-hidden="true"></i>
      </button>

      <router-link class="collection-product-slider__product" :to="productPath(currentProduct)">
        <img
          class="collection-product-slider__image"
          :src="currentProduct.images[0]"
          loading="lazy"
          decoding="async"
        />
        <div class="collection-product-slider__details-stack">
          <div
            v-for="(product, productIndex) in products"
            :key="`details-${product.id}`"
            class="collection-product-slider__details"
            :class="{ 'collection-product-slider__details--active': productIndex === currentIndex }"
            :aria-hidden="productIndex !== currentIndex"
          >
            <p class="collection-product-slider__position">{{ productIndex + 1 }} of {{ products.length }}</p>
            <h4>{{ product.title }}</h4>
            <div class="collection-product-slider__facts">
              <p v-for="(item, index) in productMeta(product)" :key="`meta-${index}`">{{ item }}</p>
              <p v-if="product.maker"><strong>Maker:</strong> {{ product.maker }}</p>
              <p v-for="option in product.options || []" :key="option.name">
                <strong>{{ option.name }}:</strong> {{ option.values.join(', ') }}
              </p>
            </div>
            <span class="collection-product-slider__link">View this item <span aria-hidden="true">→</span></span>
          </div>
        </div>
      </router-link>

      <button
        v-if="products.length > 1"
        class="collection-product-slider__control collection-product-slider__control--next"
        type="button"
        :aria-label="`Next ${collection.title} product`"
        @click="next"
      >
        <i class="bi bi-chevron-right" aria-hidden="true"></i>
      </button>
    </div>

    <div v-if="products.length > 1" class="collection-product-slider__dots" role="tablist" :aria-label="`${collection.title} product navigation`">
      <button
        v-for="(product, index) in products"
        :key="product.id"
        class="collection-product-slider__dot"
        :class="{ 'collection-product-slider__dot--active': index === currentIndex }"
        type="button"
        role="tab"
        :aria-selected="index === currentIndex"
        :aria-label="`Show ${product.title}`"
        @click="currentIndex = index"
      ></button>
    </div>

    <div class="collection-product-slider__footer">
      <router-link class="collection-product-slider__all" :to="collection.path">
        View Full Collection <span aria-hidden="true">→</span>
      </router-link>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useSliderGestures } from '../composables/useSliderGestures'

const props = defineProps({
  collection: {
    type: Object,
    required: true,
  },
})

const currentIndex = ref(0)
const collectionPresentations = {
  shirts: {
    eyebrow: 'Fresh Fits',
    heading: 'Shirts with Attitude ✨',
  },
  jackets: {
    eyebrow: 'Statement Layers',
    heading: 'Jackets with Energy 🧥',
  },
  'upcycled-logo': {
    eyebrow: 'Reimagined Icons',
    heading: 'Upcycled Logo, Made New Again ♻️',
  },
  'upcycled-collaboration': {
    eyebrow: 'Creative Collaboration',
    heading: 'Two Creative Worlds, One-of-a-Kind Magic 🤝✨',
  },
  'denim-and-lace': {
    eyebrow: 'New Drop',
    heading: 'Denim & Lace yes please ✨',
  },
}
const presentation = computed(() => collectionPresentations[props.collection.slug] || {
  eyebrow: 'Featured Collection',
  heading: `${props.collection.title} ✨`,
})
const productMeta = (product) => Array.isArray(product.meta) ? product.meta : [product.meta].filter(Boolean)
const isProductSold = (product) => {
  if (product.sold || product.soldOut) return true
  if (typeof product.status === 'string' && /^sold(?:\s*out)?$/i.test(product.status.trim())) return true
  if (typeof product.availability === 'string' && /^sold(?:\s*out)?$/i.test(product.availability.trim())) return true

  return productMeta(product).some((item) => /^price:\s*sold(?:\s*out)?\b/i.test(String(item).trim()))
}
const products = computed(() =>
  props.collection.products.filter((product) =>
    !product.placeholder && product.images?.length && !isProductSold(product)
  )
)
const currentProduct = computed(() => products.value[currentIndex.value])
const goTo = (index) => {
  currentIndex.value = (index + products.value.length) % products.value.length
}
const previous = () => goTo(currentIndex.value - 1)
const next = () => goTo(currentIndex.value + 1)
const { isDragging, pointerDown, pointerMove, pointerUp, pointerCancel, wheel, clickCapture } = useSliderGestures({
  next,
  previous,
  enabled: () => products.value.length > 1,
})
const productPath = (product) => `${props.collection.path}#product-${product.id}`

watch(
  () => props.collection.slug,
  () => { currentIndex.value = 0 }
)
</script>

<style scoped>
.collection-product-slider {
  margin-top: 28px;
  padding: clamp(18px, 3vw, 28px);
  border-radius: 24px;
  background: var(--white);
  box-shadow: var(--shadow);
}

.collection-product-slider:focus-visible {
  outline: 3px solid var(--brand-red-45);
  outline-offset: 4px;
}

.collection-product-slider__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 8px;
}

.collection-product-slider__heading {
  min-width: 0;
}

.collection-product-slider__quick-controls {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
}

.collection-product-slider__quick-controls button {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--accent-2);
  color: var(--white);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
}

.collection-product-slider__quick-controls button:hover,
.collection-product-slider__quick-controls button:active,
.collection-product-slider__quick-controls button:focus {
  background: var(--accent-2);
  color: var(--white);
  box-shadow: var(--shadow-sm);
  transform: none;
}

.collection-product-slider__quick-controls button:focus-visible {
  outline: 3px solid var(--brand-red-45);
  outline-offset: 3px;
}

.collection-product-slider__quick-controls span {
  min-width: 42px;
  color: var(--text-secondary);
  font-size: 10pt;
  font-weight: 800;
  text-align: center;
}

.collection-product-slider__eyebrow {
  display: inline-flex;
  width: fit-content;
  margin: 0 0 6px;
  padding: 5px 11px;
  border-radius: 999px;
  background: var(--pale-blue-2);
  color: var(--accent-2);
  font-size: 9pt;
  font-weight: 800;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.collection-product-slider__header h3,
.collection-product-slider__header p,
.collection-product-slider__details p,
.collection-product-slider__details h4 {
  margin: 0;
}

.collection-product-slider__header h3 {
  font-size: clamp(20pt, 4vw, 30pt);
  line-height: 1.1;
}

.collection-product-slider__position {
  color: var(--text-secondary);
  font-size: 9pt;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.collection-product-slider__description {
  grid-area: 1 / 1;
  visibility: hidden;
  max-width: 900px;
  margin: 0 0 18px;
  color: var(--text-secondary);
  font-size: clamp(11pt, 2vw, 13pt);
  line-height: 1.55;
}

.collection-product-slider__descriptions {
  display: grid;
}

.collection-product-slider__description--active {
  visibility: visible;
}

.collection-product-slider__footer {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

.collection-product-slider__all {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 11px 18px;
  border-radius: 999px;
  background: var(--accent-2);
  color: var(--white);
  font-weight: 700;
  text-decoration: none;
  box-shadow: var(--shadow-sm);
  transition: background 180ms ease, transform 180ms ease;
}

.collection-product-slider__all:hover {
  background: var(--accent);
  transform: translateY(-2px);
}

.collection-product-slider__all:focus-visible {
  outline: 3px solid var(--brand-red-45);
  outline-offset: 3px;
}

.collection-product-slider__stage {
  position: relative;
  touch-action: pan-y;
  cursor: grab;
  user-select: none;
}

.collection-product-slider__stage--dragging { cursor: grabbing; }

.collection-product-slider__product {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  overflow: hidden;
  border-radius: 18px;
  background: var(--white);
  color: var(--ink);
}

.collection-product-slider__image {
  display: block;
  width: 100%;
  height: clamp(430px, 58vw, 650px);
  min-width: 0;
  min-height: 430px;
  object-fit: contain;
  background: var(--white);
}

.collection-product-slider__details {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 12px;
  padding: clamp(26px, 5vw, 54px);
  overflow-wrap: anywhere;
  visibility: hidden;
}

.collection-product-slider__details-stack {
  display: grid;
  margin-top: clamp(12px, 2vw, 18px);
  background: var(--pale-blue-2);
}

.collection-product-slider__details--active {
  visibility: visible;
}

.collection-product-slider__details h4 {
  font-size: clamp(18pt, 3.5vw, 28pt);
  line-height: 1.15;
}

.collection-product-slider__facts {
  display: grid;
  gap: 6px;
  width: 100%;
}

.collection-product-slider__facts p {
  margin: 0;
  line-height: 1.5;
}

.collection-product-slider__link {
  display: inline-flex;
  gap: 8px;
  margin-top: 6px;
  padding: 11px 16px;
  border-radius: 999px;
  background: var(--accent-2);
  color: var(--white);
  font-weight: 700;
}

.collection-product-slider__control {
  position: absolute;
  top: clamp(215px, 29vw, 325px);
  z-index: 2;
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--white-95);
  color: var(--ink);
  box-shadow: var(--shadow);
  cursor: pointer;
  transform: translateY(-50%);
}

.collection-product-slider__control--previous { left: 14px; }
.collection-product-slider__control--next { right: 14px; }

.collection-product-slider__dots {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.collection-product-slider__dot {
  width: 9px;
  height: 9px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--black-18);
  cursor: pointer;
}

.collection-product-slider__dot--active { background: var(--accent-2); }

@media (max-width: 720px) {
  .collection-product-slider__header {
    align-items: center;
  }

  .collection-product-slider__quick-controls {
    gap: 5px;
  }

  .collection-product-slider__quick-controls button {
    width: 38px;
    height: 38px;
  }

  .collection-product-slider__quick-controls span {
    display: none;
  }

  .collection-product-slider__footer {
    justify-content: center;
  }

  .collection-product-slider__all {
    width: auto;
  }

  .collection-product-slider__product {
    grid-template-columns: 1fr;
  }

  .collection-product-slider__image {
    height: auto;
    min-height: 0;
    aspect-ratio: 1 / 1;
  }

  .collection-product-slider__details {
    padding: 24px 26px 30px;
  }

  .collection-product-slider__control {
    top: min(46vw, 210px);
    width: 44px;
    height: 44px;
  }
}
</style>
