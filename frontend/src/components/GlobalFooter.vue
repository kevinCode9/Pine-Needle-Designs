<template>
  <footer class="footer--temporary-booking">
    <div ref="bookingControl" class="temporary-booking" :class="{ 'temporary-booking--dimmed': chromeDimmed }">
      <div v-if="calendarMenuOpen" id="calendar-menu" class="calendar-menu" aria-label="Choose calendar">
        <div class="calendar-menu__header">
          <p class="calendar-menu__title">Choose Calendar</p>
          <button class="calendar-menu__close" type="button" aria-label="Close calendar choices" @click="closeCalendarMenu">×</button>
        </div>
        <div class="calendar-menu__actions">
          <router-link v-if="bookingDepositsEnabled" to="/booking/fitting" @click="closeCalendarMenu">
            <span class="calendar-menu__emoji" aria-hidden="true">💃🏻</span>
            <span class="calendar-choice__copy">
              <strong>First Fitting</strong>
              <span>For new customers choosing their first personalized fitting.</span>
            </span>
          </router-link>
          <a v-else :href="calendarLinks.fitting" @click="closeCalendarMenu">
            <span class="calendar-menu__emoji" aria-hidden="true">💃🏻</span>
            <span class="calendar-choice__copy">
              <strong>First Fitting</strong>
              <span>For new customers choosing their first personalized fitting.</span>
            </span>
          </a>
          <router-link v-if="bookingDepositsEnabled" to="/booking/brides" @click="closeCalendarMenu">
            <span class="calendar-menu__emoji" aria-hidden="true">👰🏻‍♀️</span>
            <span class="calendar-choice__copy">
              <strong>Brides</strong>
              <span>For bridal styling, gown details, and wedding appointments.</span>
            </span>
          </router-link>
          <a v-else :href="calendarLinks.brides" @click="closeCalendarMenu">
            <span class="calendar-menu__emoji" aria-hidden="true">👰🏻‍♀️</span>
            <span class="calendar-choice__copy">
              <strong>Brides</strong>
              <span>For bridal styling, gown details, and wedding appointments.</span>
            </span>
          </a>
          <a href="https://calendar.app.google/CJqD3qRvcjUuq2HB7" @click="closeCalendarMenu">
            <span class="calendar-menu__emoji" aria-hidden="true">👚</span>
            <span class="calendar-choice__copy">
              <strong>Repeat Customers</strong>
              <span>For returning customers booking another fitting or follow-up.</span>
            </span>
          </a>
        </div>
      </div>

      <button
        class="temporary-booking__trigger"
        type="button"
        :aria-expanded="String(calendarMenuOpen)"
        aria-controls="calendar-menu"
        @click="calendarMenuOpen = !calendarMenuOpen"
      >
        <span>Book Fitting Appointment</span>
      </button>
    </div>

    <div class="footer-actions" :class="{ 'footer-actions--dimmed': chromeDimmed }" aria-label="Shop and booking links">
      <router-link
        to="/collections"
        aria-label="Shop all collections"
        :class="{ active: route.path.startsWith('/collections') }"
      >
        <i class="bi bi-shop" aria-hidden="true"></i>
        <span>Shop</span>
      </router-link>
      <router-link v-if="bookingDepositsEnabled" to="/booking/fitting">
        <i class="footer-actions__emoji" aria-hidden="true">💃🏻</i>
        <span>First Fitting</span>
      </router-link>
      <a v-else :href="calendarLinks.fitting">
        <i class="footer-actions__emoji" aria-hidden="true">💃🏻</i>
        <span>First Fitting</span>
      </a>
      <router-link v-if="bookingDepositsEnabled" to="/booking/brides">
        <i class="footer-actions__emoji" aria-hidden="true">👰🏻‍♀️</i>
        <span>Brides</span>
      </router-link>
      <a v-else :href="calendarLinks.brides">
        <i class="footer-actions__emoji" aria-hidden="true">👰🏻‍♀️</i>
        <span>Brides</span>
      </a>
      <a href="https://calendar.app.google/CJqD3qRvcjUuq2HB7">
        <i class="footer-actions__emoji" aria-hidden="true">👚</i>
        <span>Repeat Customers</span>
      </a>
    </div>

    <section id="foot-section-1" class="footer-section">
      <div class="container foot-toggle-wrap">
        <p class="toggle-label" id="toggle-about-label">OH BEAUTIFUL YOU.......AND ME TOO!</p>
        <button
          class="foot-toggle icon-plusminus"
          type="button"
          @click="toggle('about')"
          :aria-expanded="String(expanded.about)"
          aria-controls="foot-about"
          aria-labelledby="toggle-about-label"
        >
          <span class="sr-only">Expand Section</span>
        </button>
      </div>

      <div
        id="foot-about"
        class="container footer-grid collapsible"
        :data-collapsed="String(!expanded.about)"
        :aria-hidden="String(!expanded.about)"
        role="region"
        aria-label="About Pine Needle Designs"
      >
        <div class="footer-left">
          <p class="hare">OH BEAUTIFUL YOU.......AND ME TOO!</p>
          <img loading="lazy" decoding="async" class="bunny-image" src="/images/bunny.webp" />
        </div>

        <div class="footer-right">
          <div class="footer-brand">
            <h4 class="footer-brand__title">Pine Needle Designs</h4>
            <p class="footer-brand__tagline">Refashioned clothing & accessories with a boho-meets-chic point of view.</p>
          </div>

          <p class="special-footer-p">
            Pine Needle Designs is an exclusive collection of refashioned clothing and accessories transforming the mundane to Artful Expression. AND Yes, all sizes! A little BOHO, a little Country, a lot of Chic. Could be hippy. (Peace) More upscale AND trendy for sure! My designs are unique and will give you Confidence, Compliments, and scream Country Couture.<br />Designed and made in the USA
          </p>
        </div>
      </div>
    </section>

    <section id="foot-section-2" class="footer-section">
      <div class="container foot-toggle-wrap">
        <p class="toggle-label" id="toggle-links-label">WHAT YOU NEED TO KNOW....hmmm</p>
        <button
          class="foot-toggle icon-plusminus"
          type="button"
          @click="toggle('links')"
          :aria-expanded="String(expanded.links)"
          aria-controls="foot-links"
          aria-labelledby="toggle-links-label"
        >
          <span class="sr-only">Expand Section</span>
        </button>
      </div>

      <div
        id="foot-links"
        class="container collapsible"
        :data-collapsed="String(!expanded.links)"
        :aria-hidden="String(!expanded.links)"
        role="region"
        aria-label="Footer links"
      >
        <div class="foot-links">
          <div class="foot-col">
            <h4>Help</h4>
            <ul>
              <li><router-link to="/privacy-policy">Privacy Policy</router-link></li>
              <li><router-link to="/refund-policy">Refund Policy</router-link></li>
              <li><router-link to="/shipping-policy">Shipping Policy</router-link></li>
              <li><router-link to="/terms-of-service">Terms of Service</router-link></li>
            </ul>
          </div>
          <div class="foot-col">
            <h4>Company</h4>
            <ul>
              <li><router-link to="/about">About</router-link></li>
              <li><router-link to="/collections">Collections</router-link></li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <div class="container footer-qr">
      <a class="qr-link" href="https://pineneedledesigns.store">
        <img loading="lazy" decoding="async" src="/images/1b.webp" width="250" height="250" />
        <span>One-of-a-kind Designs</span>
      </a>
    </div>

    <div class="container copyright" role="contentinfo" style="text-align:center">
      <span>© 2025 Pine Needle Designs <br /> All Rights Reserved.</span>
    </div>
  </footer>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

defineProps({
  chromeDimmed: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()
const bookingDepositsEnabled = ref(false)
const calendarMenuOpen = ref(false)
const bookingControl = ref(null)
const calendarLinks = {
  fitting: 'https://calendar.app.google/NU1nzMP69Vjz7JU4A',
  brides: 'https://calendar.app.google/EU8HAuemRhmr4zBY6',
}

onMounted(async () => {
  document.addEventListener('pointerdown', handleOutsidePointerDown)
  document.addEventListener('keydown', handleEscape)

  try {
    const response = await fetch('/api/booking-deposit/config')
    const config = await response.json()
    bookingDepositsEnabled.value = response.ok && config.enabled === true
  } catch {
    bookingDepositsEnabled.value = false
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleOutsidePointerDown)
  document.removeEventListener('keydown', handleEscape)
})

const expanded = reactive({
  about: false,
  links: false,
})

const toggle = (id) => {
  expanded[id] = !expanded[id]
}

const closeCalendarMenu = () => {
  calendarMenuOpen.value = false
}

function handleOutsidePointerDown(event) {
  if (!calendarMenuOpen.value || bookingControl.value?.contains(event.target)) return
  closeCalendarMenu()
}

function handleEscape(event) {
  if (event.key === 'Escape') closeCalendarMenu()
}

watch(
  () => route.fullPath,
  () => closeCalendarMenu()
)
</script>
