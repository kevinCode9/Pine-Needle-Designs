<template>
  <section class="booking-deposit-page">
    <div v-if="ready" class="booking-deposit-card">
      <p class="booking-eyebrow">Reserve your appointment</p>
      <h1>{{ details.title }}</h1>
      <p class="booking-intro">
        A <strong>${{ details.amount }} deposit</strong> is required before choosing and confirming your appointment time.
      </p>

      <form class="booking-form" @submit.prevent="startPayment">
        <label>
          Name
          <input v-model.trim="customer.name" type="text" autocomplete="name" required />
        </label>
        <label>
          Email
          <input v-model.trim="customer.email" type="email" autocomplete="email" required />
        </label>
        <label>
          Phone
          <input v-model.trim="customer.phone" type="tel" autocomplete="tel" required />
        </label>

        <p v-if="cancelled" class="booking-notice">PayPal checkout was cancelled. No deposit was charged.</p>
        <p v-if="error" class="booking-error" role="alert" aria-live="assertive">{{ error }}</p>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Opening PayPal…' : `Pay $${details.amount} with PayPal` }}
        </button>
      </form>

      <p class="booking-fine-print">After payment, you’ll continue to the calendar to choose your appointment time.</p>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'

const props = defineProps({ service: { type: String, required: true } })

const services = {
  fitting: {
    title: 'First Fitting',
    amount: '10.00',
    calendarUrl: 'https://calendar.app.google/NU1nzMP69Vjz7JU4A',
  },
  brides: {
    title: 'Bridal Appointment',
    amount: '25.00',
    calendarUrl: 'https://calendar.app.google/EU8HAuemRhmr4zBY6',
  },
}

const details = computed(() => services[props.service] || services.fitting)
const customer = reactive({ name: '', email: '', phone: '' })
const loading = ref(false)
const ready = ref(false)
const error = ref('')
const cancelled = new URLSearchParams(window.location.search).get('cancelled') === '1'

onMounted(async () => {
  try {
    const response = await fetch('/api/booking-deposit/config')
    const config = await response.json()
    if (!response.ok || config.enabled !== true) {
      window.location.replace(details.value.calendarUrl)
      return
    }
    ready.value = true
  } catch {
    window.location.replace(details.value.calendarUrl)
  }
})

const startPayment = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch('/api/booking-deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: props.service, customer }),
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok || !data.url) {
      throw new Error(data.error || 'We could not connect to PayPal right now. Please wait a moment and try again. You have not been charged.')
    }
    window.location.assign(data.url)
  } catch (err) {
    error.value = err.message || 'We could not connect to PayPal right now. Please wait a moment and try again. You have not been charged.'
    loading.value = false
  }
}
</script>

<style scoped>
.booking-deposit-page { min-height: 65vh; display: grid; place-items: center; padding: 56px 18px; }
.booking-deposit-card { width: min(100%, 560px); padding: clamp(24px, 5vw, 44px); border-radius: 24px; background: #fff; box-shadow: 0 18px 50px rgba(0, 0, 0, .12); }
.booking-eyebrow { margin: 0 0 8px; color: #8d2635; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
h1 { margin: 0 0 14px; }
.booking-intro { margin-bottom: 28px; font-size: 1.05rem; }
.booking-form { display: grid; gap: 16px; }
label { display: grid; gap: 7px; font-weight: 700; }
input { width: 100%; min-height: 46px; padding: 10px 13px; border: 1px solid #b8b8b8; border-radius: 10px; font: inherit; }
input:focus { border-color: #8d2635; outline: 3px solid rgba(141, 38, 53, .16); }
button { min-height: 50px; margin-top: 4px; border: 0; border-radius: 999px; background: #ffc439; color: #111; font: inherit; font-weight: 800; cursor: pointer; }
button:hover { background: #f2ba36; }
button:disabled { cursor: wait; opacity: .65; }
.booking-fine-print { margin: 18px 0 0; color: #555; font-size: .9rem; text-align: center; }
.booking-notice { margin: 0; color: #624a00; }
.booking-error { margin: 0; color: #a40000; font-weight: 700; }
</style>
