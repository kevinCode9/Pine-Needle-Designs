<template>
  <div class="home-page">
    <section id="dashboard-signin" class="dashboard-signin">
      <div class="container dashboard-signin__content">
        <h2>Dashboard Access</h2>
        <p v-if="redirectPath" class="dashboard-signin__hint">
          Sign in with your authorized Gmail address to continue to the dashboard.
        </p>
        <p v-else class="dashboard-signin__hint">
          Authorized team members must sign in with Gmail to manage products, collections, and orders.
        </p>

        <p v-if="authStore.isAuthenticated" class="dashboard-signin__status">
          Signed in as {{ authStore.user.email }}
        </p>

        <button
          v-if="!authStore.isAuthenticated"
          type="button"
          class="btn dashboard-signin__button"
          @click="authStore.openLoginDialog(redirectPath)"
        >
          Sign In
        </button>

        <button
          v-else
          type="button"
          class="btn dashboard-signin__button dashboard-signin__button--secondary"
          @click="handleSignOut"
        >
          Sign Out
        </button>
      </div>
    </section>

    <section v-if="homeSections.length" id="about">
      <div class="container">
        <h2 class="section-title">Highlighted Collections</h2>
      </div>

      <div v-for="section in homeSections" :key="section.id" class="container highlighted-collection">
        <div class="section-head">
          <h2>{{ section.title }}</h2>
          <router-link class="link" :to="section.path">Browse All Collections</router-link>
        </div>

        <div v-if="section.cards.length" class="grid grid-4">
          <article v-for="(card, cardIndex) in section.cards" :key="card.title + card.pill" class="product card disabled">
            <router-link :to="section.path">
              <img
                :loading="featuredImageLoading(cardIndex)"
                :fetchpriority="featuredImagePriority(cardIndex)"
                decoding="async"
                class="media"
                :src="card.image"
              />
            </router-link>
            <div class="body">
              <div class="pill">{{ card.pill }}</div>
              <h3>{{ uppercase(card.title) }}</h3>
              <div class="product-meta"><span>{{ card.meta }}</span></div>
              <div class="price">{{ card.price }}</div>
              <div class="description">{{ card.description }}</div>
            </div>
          </article>
        </div>
        <p v-else class="subtle">Coming Soon</p>
      </div>
    </section>

    <section class="home-product-collections" aria-label="Featured product collections">
      <div class="container">
        <CollectionProductSlider
          v-for="collection in featuredProductCollections"
          :key="collection.slug"
          :collection="collection"
        />
      </div>
    </section>

    <section class="collections">
      <div class="container">
        <div class="section-head">
          <h2>Other Collections</h2>
        </div>

        <div class="grid grid-6">
          <article
            v-for="(collection, collectionIndex) in otherCollections"
            :key="collection.slug"
            :class="['card', { disabled: collection.count === 0 }]"
          >
            <router-link v-if="collection.count > 0" class="card-link" :to="collection.path">
              <img
                :loading="collectionImageLoading(collectionIndex)"
                :fetchpriority="collectionImagePriority(collectionIndex)"
                decoding="async"
                :class="['media', { 'coming-soon-image': isComingSoonImage(collection.cardImage) }]"
                :src="collection.cardImage"
              />
              <div class="body">
                <h3>{{ uppercase(collection.title) }}</h3>
                <div class="subtle">{{ itemCountLabel(collection.count) }}</div>
              </div>
            </router-link>
            <div v-else>
              <img
                :loading="collectionImageLoading(collectionIndex)"
                :fetchpriority="collectionImagePriority(collectionIndex)"
                decoding="async"
                :class="['media', { 'coming-soon-image': isComingSoonImage(collection.cardImage) }]"
                :src="collection.cardImage"
              />
              <div class="body">
                <h3>{{ uppercase(collection.title) }}</h3>
                <div class="subtle">{{ itemCountLabel(0) }}</div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="one-of-a-kind">
      <div class="container one-of-a-kind__content">
        <h2>One-of-a-kind designs</h2>
        <p>From purses and bracelets to denim jackets with detachable trains, every piece is designed to make a statement. The vibe blends a little boho, a little country, and a whole lot of chic—crafted in the USA and made for all sizes.</p>
        <router-link class="btn one-of-a-kind__button" to="/about">About Us</router-link>
      </div>
    </section>

    <ImageSlider />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CollectionProductSlider from '../components/CollectionProductSlider.vue'
import ImageSlider from '../components/ImageSlider.vue'
import { useAuthStore } from '../stores/auth.js'
import { collectionPages, homeSections, otherCollections } from '../data/siteData'
import { preloadImages, preloadImagesOnIdle } from '../utils/mediaPreloader'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const redirectPath = computed(() => (
  typeof route.query.redirect === 'string' ? route.query.redirect : ''
))

const handleSignOut = async () => {
  await authStore.logout()
  await router.replace({ path: '/', hash: '#dashboard-signin' })
}

const featuredCollectionSlugs = [
  'shirts',
  'jackets',
  'upcycled-logo',
  'upcycled-collaboration',
  'denim-and-lace',
]
const featuredProductCollections = featuredCollectionSlugs
  .map((slug) => collectionPages.find((collection) => collection.slug === slug))
  .filter((collection) => collection?.products.some((product) => !product.placeholder && product.images?.length))

const featuredImageLoading = (index) => (index === 0 ? 'eager' : 'lazy')
const featuredImagePriority = (index) => (index === 0 ? 'high' : 'auto')
const collectionImageLoading = (index) => (index < 2 ? 'eager' : 'lazy')
const collectionImagePriority = (index) => (index === 0 ? 'high' : 'auto')
const isComingSoonImage = (src) => String(src).includes('/comingsoon/')
const uppercase = (value) => String(value).toUpperCase()
const itemCountLabel = (count) => `${count} ITEMS`

onMounted(async () => {
  await authStore.initialize()

  if (authStore.isAuthenticated && redirectPath.value) {
    await router.replace(redirectPath.value)
    return
  }

  if (!authStore.isAuthenticated && redirectPath.value) {
    authStore.openLoginDialog(redirectPath.value)
  }

  const visibleImages = otherCollections.map((collection) => collection.cardImage)
  preloadImages(visibleImages.slice(0, 4))
  preloadImagesOnIdle(visibleImages.slice(4), 3)
})
</script>

<style scoped>
.dashboard-signin {
  padding: clamp(32px, 5vw, 56px) 0;
  background: linear-gradient(180deg, var(--pale-blue), var(--pale-blue-2));
  border-bottom: 1px solid var(--pale-blue-2);
}

.dashboard-signin__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.dashboard-signin__content h2 {
  margin: 0;
  font-size: clamp(20pt, 3.5vw, 28pt);
}

.dashboard-signin__hint,
.dashboard-signin__status {
  max-width: 640px;
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.dashboard-signin__button {
  margin-top: 8px;
}

.dashboard-signin__button--secondary {
  background: #fff;
  color: inherit;
  border: 1px solid #d8eadb;
}

.home-product-collections {
  padding: 60px 0 80px;
  background: linear-gradient(180deg, var(--pale-blue-2), var(--page-bg));
}

.one-of-a-kind {
  padding: clamp(64px, 9vw, 112px) 0;
  background: linear-gradient(120deg, var(--pale-blue), var(--pale-blue-2));
}

.one-of-a-kind__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.one-of-a-kind__content h2 {
  margin: 0;
  font-size: clamp(28pt, 5vw, 46pt);
  line-height: 1.08;
}

.one-of-a-kind__content p {
  max-width: 900px;
  margin: 20px auto 28px;
  font-size: clamp(12pt, 2vw, 15pt);
  line-height: 1.7;
}

.one-of-a-kind__button {
  background: linear-gradient(135deg, var(--accent), var(--accent-3));
  border-color: var(--accent-3);
  box-shadow: 0 12px 25px var(--accent-3-50);
  color: var(--white);
}

.one-of-a-kind__button:hover {
  color: var(--white);
  transform: translateY(-1px);
  box-shadow: 0 16px 30px var(--accent-3-55);
}

@media (max-width: 640px) {
  .home-product-collections {
    padding: 42px 0 56px;
  }
}
</style>
