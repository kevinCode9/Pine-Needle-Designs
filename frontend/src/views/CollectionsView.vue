<template>
  <section class="collections collections-catalog">
    <div class="container">
      <div class="section-head collections-page-header">
        <h1>Browse All Collections</h1>
      </div>

      <section v-for="(group, groupIndex) in collectionGroups" :key="group.title" class="collection-group">
        <h3>{{ group.title }}</h3>
        <div class="grid grid-4 collection-list">
          <article v-for="(collection, collectionIndex) in group.collections" :key="collection.slug" class="card collection-card">
            <router-link class="collection-link" :to="collection.path">
              <img
                :class="['collection-card__image', { 'coming-soon-image': isComingSoonImage(collection.cardImage) }]"
                :src="collection.cardImage"
                :loading="collectionImageLoading(groupIndex, collectionIndex)"
                :fetchpriority="collectionImagePriority(groupIndex, collectionIndex)"
                decoding="async"
              />
              <div class="body">
                <h4>{{ uppercase(collection.title) }}</h4>
                <div class="subtle">{{ itemCountLabel(collection.count) }}</div>
              </div>
            </router-link>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { collectionCategoryOrder, visibleCollectionPages } from '../data/siteData'
import { preloadImages, preloadImagesOnIdle } from '../utils/mediaPreloader'

const visibleBySlug = new Map(visibleCollectionPages.map((collection) => [collection.slug, collection]))
const groupedSlugs = new Set(collectionCategoryOrder.flatMap((group) => group.slugs))

const collectionGroups = [
  ...collectionCategoryOrder.map((group) => ({
    title: group.title,
    collections: group.slugs.map((slug) => visibleBySlug.get(slug)).filter(Boolean),
  })),
  {
    title: 'Other Collections',
    collections: visibleCollectionPages.filter((collection) => !groupedSlugs.has(collection.slug)),
  },
].filter((group) => group.collections.length > 0)

const collectionImageLoading = (groupIndex, collectionIndex) =>
  groupIndex === 0 && collectionIndex < 4 ? 'eager' : 'lazy'

const collectionImagePriority = (groupIndex, collectionIndex) =>
  groupIndex === 0 && collectionIndex === 0 ? 'high' : 'auto'

const isComingSoonImage = (src) => String(src).includes('/comingsoon/')
const uppercase = (value) => String(value).toUpperCase()
const itemCountLabel = (count) => `${count} ITEMS`

onMounted(() => {
  const visibleImages = collectionGroups.flatMap((group) =>
    group.collections.map((collection) => collection.cardImage)
  )

  preloadImages(visibleImages.slice(0, 4))
  preloadImagesOnIdle(visibleImages.slice(4), 3)
})
</script>
