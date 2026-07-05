<template>
  <section
    class="image-slider"
    :class="{ 'is-dragging': isDragging }"
    aria-label="Featured images"
    @pointerdown="pointerDown"
    @pointermove="pointerMove"
    @pointerup="pointerUp"
    @pointercancel="pointerCancel"
    @wheel="wheel"
    @click.capture="clickCapture"
  >
    <button class="slider-btn prev-btn" type="button" aria-label="Previous featured image" @click="handlePrevSlide">←</button>

    <div id="slider-container" :class="slideClass">
      <div v-for="src in currentSlide.images" :key="src" class="slide-item">
        <img :src="src" loading="lazy" decoding="async" />
      </div>
    </div>

    <button class="slider-btn next-btn" type="button" aria-label="Next featured image" @click="handleNextSlide">→</button>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { sliderSlides } from '../data/siteData'
import { useSliderGestures } from '../composables/useSliderGestures'

const currentIndex = ref(0)
const currentSlide = computed(() => sliderSlides[currentIndex.value])
const slideClass = computed(() => {
  const count = currentSlide.value.images.length
  if (count === 1) return 'single'
  if (count === 2) return 'double'
  return 'triple'
})

const showSlide = (index) => {
  currentIndex.value = (index + sliderSlides.length) % sliderSlides.length
}

const nextSlide = () => {
  showSlide(currentIndex.value + 1)
}

const prevSlide = () => {
  showSlide(currentIndex.value - 1)
}

const { isDragging, pointerDown, pointerMove, pointerUp, pointerCancel, wheel, clickCapture } = useSliderGestures({
  next: () => handleNextSlide(),
  previous: () => handlePrevSlide(),
  enabled: () => sliderSlides.length > 1,
})

let interval
const startAutoSlide = () => {
  interval = setInterval(nextSlide, 5000)
}
const resetInterval = () => {
  clearInterval(interval)
  startAutoSlide()
}

const handleNextSlide = () => {
  nextSlide()
  resetInterval()
}

const handlePrevSlide = () => {
  prevSlide()
  resetInterval()
}

onMounted(() => {
  startAutoSlide()
})

onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>
