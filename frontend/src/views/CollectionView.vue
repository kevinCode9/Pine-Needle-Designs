<template>
  <section class="products" v-if="page">
    <div class="products-header">
      <div class="product-actions">
        <router-link class="back-link" :to="previousPath">← Previous Collection</router-link>
        <router-link class="btn btn-next" :to="nextPath">Next Collection →</router-link>
      </div>
      <h2>{{ page.title }}</h2>
      <p>{{ page.description }}</p>
      <div
        v-if="collectionFilters.length"
        class="collection-filters"
        :class="{ 'collection-filters--with-bag-types': showBagTypeFilter }"
        aria-label="Product filters"
      >
        <button
          type="button"
          class="collection-filter"
          :class="['collection-filter--filter-all', { 'collection-filter--active': activeFilter === allFilter }]"
          :aria-pressed="activeFilter === allFilter"
          @click="activeFilter = allFilter"
        >
          All
        </button>
        <button
          v-for="filter in collectionFilters"
          :key="filter"
          type="button"
          class="collection-filter"
          :class="[filterClass(filter), { 'collection-filter--active': activeFilter === filter }]"
          :aria-pressed="activeFilter === filter"
          @click="activeFilter = filter"
        >
          {{ filter }}
        </button>
        <label v-if="showBagTypeFilter" class="collection-filter-select">
          <span class="visually-hidden">Bag type</span>
          <select v-model="activeBagType">
            <option :value="allBagTypes">Select bag type</option>
            <option v-for="bagType in bagTypeOptions" :key="bagType" :value="bagType">
              {{ bagType }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <div v-if="filteredProducts.length" class="product-grid">
      <article
        v-for="(product, productIndex) in filteredProducts"
        :id="`product-${product.id}`"
        :key="product.title"
        class="product-card"
      >
        <header>
          <h3>{{ displayTitle(product) }}</h3>
          <div class="product-meta">
            <div v-for="(item, index) in displayProductMeta(product)" :key="index">{{ item }}</div>
            <div v-if="product.maker" class="product-maker">{{ product.maker }}</div>
          </div>
          <div class="product-description">
            <h4>Description</h4>
            <p>{{ displayDescription(product) }}</p>
          </div>
        </header>
        <div v-if="product.options && product.options.length" class="product-options">
          <ProductOptionSelect
            v-for="option in product.options"
            :key="`${product.id}-${option.name}`"
            v-model="selectedOptions[optionKey(product, option)]"
            :label="option.name"
            :options="option.values"
            :placeholder="option.placeholder"
          />
        </div>
        <div class="product-images">
          <template v-if="hasMedia(product)">
            <MediaSlider
              :media="productMedia(product)"
              :label="`${displayTitle(product)} media gallery`"
              :eager="productIndex < 2"
              :priority="productIndex === 0 ? 'high' : 'auto'"
            />
          </template>
          <template v-else>
            <div
              v-for="(placeholder, index) in product.imagePlaceholders || Array(product.imageCount || 2).fill('')"
              :key="index"
              :class="product.imageWrapper || 'placeholder'"
            >
                <img
                  class="placeholder-image"
                  :src="placeholderImageFor(product, index)"
                  :loading="placeholderImageLoading(productIndex, index)"
                  :fetchpriority="placeholderImagePriority(productIndex, index)"
                  decoding="async"
                />
            </div>
          </template>
        </div>
        <button v-if="canAddToCart(product)" class="addtocart" @click="addToCart(product)">Add to Cart</button>
        <button v-else-if="isProductSold(product)" class="addtocart" disabled>Sold</button>
        <button v-else-if="Number.isFinite(productPrice(product))" class="addtocart" disabled>Select Options</button>
        <button v-else class="addtocart" disabled>Price TBD</button>
      </article>
    </div>
    <p v-else class="subtle">{{ page.products.length ? 'No matching items' : 'Coming Soon' }}</p>
  </section>
  <section v-else class="not-found">
    <p>Collection not found.</p>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import MediaSlider from '../components/MediaSlider.vue'
import ProductOptionSelect from '../components/ProductOptionSelect.vue'
import { collectionPages } from '../data/siteData'
import { useCartStore } from '../stores/cart'
import { firstVisibleProductMedia, preloadImages, preloadImagesOnIdle } from '../utils/mediaPreloader'

const props = defineProps({
  slug: String,
})

const cartStore = useCartStore()
const selectedOptions = ref({})
const allFilter = 'All'
const bagsFilter = 'Bags'
const allBagTypes = 'All'
const activeFilter = ref(allFilter)
const activeBagType = ref(allBagTypes)

const page = computed(() =>
  collectionPages.find((item) => item.slug === props.slug)
)

const previousPath = computed(() => {
  if (!page.value || !page.value.previous) return '/collections'
  return `/collections/${page.value.previous}`
})

const nextPath = computed(() => {
  if (!page.value || !page.value.next) return '/collections'
  return `/collections/${page.value.next}`
})

const collectionFilters = computed(() => page.value?.filters || [])
const filterClass = (filter) =>
  `collection-filter--filter-${String(filter).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
const productFilters = (product) => Array.isArray(product.filters) ? product.filters : [product.filters].filter(Boolean)
const productBagTypes = (product) => Array.isArray(product.bagTypes) ? product.bagTypes : [product.bagTypes].filter(Boolean)
const bagTypeOptions = computed(() => {
  if (!page.value) return []

  return [...new Set(
    page.value.products
      .filter((product) => productFilters(product).includes(bagsFilter))
      .flatMap(productBagTypes)
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b))
})
const showBagTypeFilter = computed(() =>
  activeFilter.value === bagsFilter && bagTypeOptions.value.length > 0
)
const filteredProducts = computed(() => {
  if (!page.value) return []
  if (activeFilter.value === allFilter) return page.value.products

  return page.value.products.filter((product) => {
    if (!productFilters(product).includes(activeFilter.value)) return false
    if (activeFilter.value !== bagsFilter || activeBagType.value === allBagTypes) return true

    return productBagTypes(product).includes(activeBagType.value)
  })
})

const optionKey = (product, option) => `${product.id}-${option.name}`
const styleOptionName = 'Style'
const blingStyle = 'Bling'
const noBlingStyle = 'No Bling'
const productSelections = (product) => {
  if (!product.options || !product.options.length) return {}

  return product.options.reduce((options, option) => {
    options[option.name] = selectedOptions.value[optionKey(product, option)] || ''
    return options
  }, {})
}

const hasRequiredOptions = (product) => {
  if (!product.options || !product.options.length) return true
  return product.options.every((option) => Boolean(selectedOptions.value[optionKey(product, option)]))
}

const productMeta = (product) => Array.isArray(product.meta) ? product.meta : [product.meta].filter(Boolean)
const selectedStyle = (product) => selectedOptions.value[optionKey(product, { name: styleOptionName })] || ''
const hasBlingStyleOption = (product) =>
  product.options?.some((option) => option.name === styleOptionName && option.values?.includes(blingStyle))
const cleanNonBlingTitle = (title) =>
  String(title)
    .replace(/\bblinged\s+out\b\s*/gi, '')
    .replace(/\bblinged\b\s*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
const displayTitle = (product) => {
  if (!hasBlingStyleOption(product)) return cleanNonBlingTitle(product.title)
  if (selectedStyle(product) === blingStyle) return product.title
  return cleanNonBlingTitle(product.title)
}
const isNoBlingSelected = (product) => selectedStyle(product) === noBlingStyle
const productPrice = (product) => {
  if (isNoBlingSelected(product) && Number.isFinite(product.noBlingPrice)) return product.noBlingPrice
  return product.price
}
const displayDescription = (product) => {
  if (isNoBlingSelected(product)) return product.noBlingDescription || product.description
  return product.description
}
const displayProductMeta = (product) => {
  const meta = productMeta(product)
  const price = productPrice(product)

  if (!Number.isFinite(price)) return meta

  let replacedPrice = false
  return meta.map((item) => {
    if (!replacedPrice && /^price:/i.test(String(item).trim())) {
      replacedPrice = true
      return `Price: $${price}`
    }

    return item
  })
}
const isProductSold = (product) => {
  if (product.sold || product.soldOut) return true
  if (typeof product.status === 'string' && /^sold(?:\s*out)?$/i.test(product.status.trim())) return true
  if (typeof product.availability === 'string' && /^sold(?:\s*out)?$/i.test(product.availability.trim())) return true

  return productMeta(product).some((item) => /^price:\s*sold(?:\s*out)?\b/i.test(String(item).trim()))
}
const canAddToCart = (product) => Number.isFinite(productPrice(product)) && !isProductSold(product) && hasRequiredOptions(product)
const hasMedia = (product) =>
  Boolean((product.images && product.images.length) || (product.videos && product.videos.length))
const videoPosterFor = (product, index) =>
  product.videoPosters?.[index] || product.images?.[0] || ''
const productMedia = (product) => [
  ...(product.images || []).map((src) => ({
    src,
    type: 'image',
  })),
  ...(product.videos || []).map((src, index) => ({
    src,
    type: 'video',
    poster: videoPosterFor(product, index),
  })),
]
const defaultPlaceholderImage = '/images/comingsoon/comingsoon015.webp'
const placeholderImageFor = (product, index) =>
  product.placeholderImages?.[index] || product.placeholderImage || defaultPlaceholderImage
const placeholderImageLoading = (productIndex, imageIndex) =>
  productIndex === 0 && imageIndex === 0 ? 'eager' : 'lazy'
const placeholderImagePriority = (productIndex, imageIndex) =>
  productIndex === 0 && imageIndex === 0 ? 'high' : 'auto'

const pageVisibleMedia = (currentPage) => {
  if (!currentPage) return []
  return currentPage.products.flatMap(firstVisibleProductMedia)
}

const preloadPageMedia = (currentPage) => {
  const media = pageVisibleMedia(currentPage)
  preloadImages(media.slice(0, 2))
  preloadImagesOnIdle(media.slice(2), 2)
}

onMounted(() => preloadPageMedia(page.value))
watch(page, (currentPage) => {
  activeFilter.value = allFilter
  activeBagType.value = allBagTypes
  preloadPageMedia(currentPage)
})
watch(activeFilter, () => {
  activeBagType.value = allBagTypes
})

const addToCart = async (product) => {
  if (!canAddToCart(product)) return

  const selectedProduct = {
    ...product,
    title: displayTitle(product),
    price: productPrice(product),
    meta: displayProductMeta(product),
    description: displayDescription(product),
    selectedOptions: productSelections(product),
  }

  selectedProduct.cartItemId = [
    product.id,
    ...Object.entries(selectedProduct.selectedOptions).map(([name, value]) => `${name}:${value}`),
  ].join('|')

  await cartStore.addItem(selectedProduct)
}
</script>
