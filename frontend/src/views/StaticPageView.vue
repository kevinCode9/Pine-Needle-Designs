<template>
  <section class="static-page">
    <div class="container">
      <h1>{{ page.title }}</h1>
      <div class="page-content" v-html="page.content"></div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { sitePages } from '../data/siteData'

const props = defineProps({
  slug: String,
})

const page = computed(() =>
  sitePages.find((item) => item.slug === props.slug) || sitePages[0]
)
</script>
