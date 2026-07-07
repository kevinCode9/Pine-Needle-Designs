import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '../api/auth.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const initialized = ref(false)
  const loginDialogOpen = ref(false)
  const redirectAfterLogin = ref('')

  const isAuthenticated = computed(() => Boolean(user.value?.email))

  const openLoginDialog = (redirect = '') => {
    redirectAfterLogin.value = redirect
    loginDialogOpen.value = true
  }

  const closeLoginDialog = () => {
    loginDialogOpen.value = false
  }

  const initialize = async () => {
    if (initialized.value) {
      return isAuthenticated.value
    }

    return verifySession()
  }

  const verifySession = async () => {
    loading.value = true

    try {
      const session = await authApi.getMe().catch(() => null)
      user.value = session?.user || null
    } finally {
      loading.value = false
      initialized.value = true
    }

    return isAuthenticated.value
  }

  const signInWithEmail = async (email) => {
    const data = await authApi.signInWithEmail(email)
    user.value = data.user
    initialized.value = true
    return data.user
  }

  const logout = async () => {
    await authApi.logout()
    user.value = null
    initialized.value = false
    redirectAfterLogin.value = ''
  }

  return {
    user,
    loading,
    initialized,
    loginDialogOpen,
    redirectAfterLogin,
    isAuthenticated,
    openLoginDialog,
    closeLoginDialog,
    initialize,
    verifySession,
    signInWithEmail,
    logout,
  }
})
