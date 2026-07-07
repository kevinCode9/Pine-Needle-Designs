<script setup>
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { isGmailAddress } from '../utils/emailValidation.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'success'])

const authStore = useAuthStore()

const email = ref('')
const loading = ref(false)
const error = ref('')

const isOpen = computed({
  get: () => props.modelValue || authStore.loginDialogOpen,
  set: (value) => {
    emit('update:modelValue', value)
    if (!value) {
      authStore.closeLoginDialog()
    }
  },
})

const close = () => {
  isOpen.value = false
}

const resetForm = () => {
  email.value = ''
  error.value = ''
  loading.value = false
}

const handleSubmit = async () => {
  error.value = ''
  const trimmedEmail = email.value.trim()

  if (!isGmailAddress(trimmedEmail)) {
    error.value = 'Please enter a valid Gmail address.'
    return
  }

  loading.value = true

  try {
    await authStore.signInWithEmail(trimmedEmail)
    emit('success')
    close()
  } catch (err) {
    if (err.status === 403) {
      error.value = 'You are not authorized to access the dashboard.'
    } else {
      error.value = err.message || 'Unable to sign in. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

watch(isOpen, (open) => {
  if (!open) {
    resetForm()
  }
})
</script>

<template>
  <div
    v-if="isOpen"
    class="login-dialog-overlay"
    @click.self="close"
  >
    <section
      class="login-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-dialog-title"
    >
      <div class="login-dialog__header">
        <h2 id="login-dialog-title">Dashboard Login</h2>
        <button type="button" class="login-dialog__close" aria-label="Close" @click="close">
          &times;
        </button>
      </div>

      <p class="login-dialog__description">
        Enter your authorized Gmail address to access the dashboard.
      </p>

      <form class="login-dialog__form" @submit.prevent="handleSubmit">
        <label class="login-dialog__label" for="login-email">Gmail address</label>
        <input
          id="login-email"
          v-model="email"
          type="email"
          class="login-dialog__input"
          placeholder="you@gmail.com"
          autocomplete="email"
          required
          :disabled="loading"
        >

        <p v-if="error" class="login-dialog__error" role="alert">{{ error }}</p>

        <button type="submit" class="btn login-dialog__submit" :disabled="loading || !email.trim()">
          {{ loading ? 'Signing in...' : 'Login' }}
        </button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.login-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.45);
}

.login-dialog {
  width: min(100%, 420px);
  padding: 28px;
  background: #fff;
  border: 1px solid #d8eadb;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(31, 122, 61, 0.12);
}

.login-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.login-dialog__header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.login-dialog__close {
  border: 0;
  background: transparent;
  font-size: 1.75rem;
  line-height: 1;
  color: #666;
  cursor: pointer;
}

.login-dialog__description {
  margin: 0 0 20px;
  color: #666;
  line-height: 1.6;
}

.login-dialog__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-dialog__label {
  font-weight: 600;
}

.login-dialog__input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d8eadb;
  border-radius: 8px;
  font: inherit;
}

.login-dialog__input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-dialog__error {
  margin: 0;
  padding: 12px 14px;
  border-radius: 8px;
  background: #ffe2e2;
  color: #8a1f1f;
}

.login-dialog__submit {
  margin-top: 4px;
}
</style>
