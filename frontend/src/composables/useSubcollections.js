import { ref } from 'vue'
import { dashboardApi } from '../api/dashboard.js'

export const useSubcollections = () => {
  const subcollections = ref([])
  const loading = ref(false)
  const error = ref('')

  const loadSubcollections = async (collectionId) => {
    if (!collectionId) {
      subcollections.value = []
      error.value = ''
      return []
    }

    loading.value = true
    error.value = ''

    try {
      subcollections.value = await dashboardApi.getSubcollections(collectionId)
      return subcollections.value
    } catch (err) {
      error.value = err.message
      subcollections.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const resetSubcollections = () => {
    subcollections.value = []
    error.value = ''
    loading.value = false
  }

  return {
    subcollections,
    loading,
    error,
    loadSubcollections,
    resetSubcollections,
  }
}
