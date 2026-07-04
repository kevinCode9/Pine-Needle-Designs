<template>
  <section class="booking-success-page">
    <div class="booking-success-card">
      <template v-if="loading">
        <h1>Confirming your deposit…</h1>
        <p>Please keep this page open while PayPal confirms your payment.</p>
      </template>

      <template v-else-if="error">
        <h1>We couldn’t confirm your deposit</h1>
        <p class="error" role="alert">{{ error }}</p>
        <router-link to="/">Return home</router-link>
      </template>

      <template v-else>
        <p class="success-mark" aria-hidden="true">✓</p>
        <h1>Deposit received!</h1>
        <p>Your ${{ result.amount }} deposit is confirmed. Now choose your appointment time to finish booking.</p>
        <a class="calendar-button" :href="result.bookingUrl">Choose Appointment Time</a>
        <p class="important">Your appointment is not reserved until you complete the calendar booking.</p>
      </template>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'

const loading = ref(true)
const error = ref('')
const result = reactive({ amount: '', bookingUrl: '' })

onMounted(async () => {
  const token = new URLSearchParams(window.location.search).get('token')
  if (!token) {
    error.value = 'This confirmation link is incomplete. If you paid through PayPal, please do not submit another payment. Check your PayPal receipt, then contact Pine Needle Designs for help.'
    loading.value = false
    return
  }

  try {
    const response = await fetch(`/api/booking-deposit/capture/${encodeURIComponent(token)}`)
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'We cannot confirm your deposit right now. Please do not submit another payment. Check your PayPal receipt, then contact Pine Needle Designs for help.')
    }
    result.amount = data.amount
    result.bookingUrl = data.bookingUrl
  } catch (err) {
    error.value = err.message || 'We cannot confirm your deposit right now. Please do not submit another payment. Check your PayPal receipt, then contact Pine Needle Designs for help.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.booking-success-page { min-height: 65vh; display: grid; place-items: center; padding: 56px 18px; }
.booking-success-card { width: min(100%, 600px); padding: clamp(28px, 5vw, 48px); border-radius: 24px; background: #fff; box-shadow: 0 18px 50px rgba(0, 0, 0, .12); text-align: center; }
.success-mark { display: grid; place-items: center; width: 58px; height: 58px; margin: 0 auto 16px; border-radius: 50%; background: #27834a; color: #fff; font-size: 2rem; font-weight: 800; }
.calendar-button { display: inline-flex; min-height: 50px; margin: 18px 0 8px; padding: 12px 26px; align-items: center; border-radius: 999px; background: #8d2635; color: #fff; font-weight: 800; text-decoration: none; }
.important { color: #555; font-size: .9rem; }
.error { color: #a40000; font-weight: 700; }
</style>
