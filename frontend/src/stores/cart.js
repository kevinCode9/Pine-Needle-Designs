import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const DISCOUNT_CODES = {
  'B$': { type: 'fixed', value: 20, label: '$20 off' },
  'W$': { type: 'fixed', value: 25, label: '$25 off' },
  'FAM': { type: 'percent', value: 40, label: '40% off' },
  'SURPRISE': { type: 'percent', value: 20, label: '20% off' },
  'SEW': { type: 'percent', value: 10, label: '10% off' },
}

const LOCAL_CART_KEY = 'pine-needle-designs-cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const isOpen = ref(false)
  const isLoading = ref(false)
  const useServerCart = ref(true)
  const appliedDiscountCode = ref('')
  const discountError = ref('')

  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })

  const discountRule = (code) => {
    if (!code || typeof code !== 'string') return null
    return DISCOUNT_CODES[code.trim().toUpperCase()] || null
  }

  const discountAmount = computed(() => {
    const rule = discountRule(appliedDiscountCode.value)
    if (!rule) return 0

    if (rule.type === 'fixed') {
      return Math.min(rule.value, totalPrice.value)
    }

    return Number(((totalPrice.value * rule.value) / 100).toFixed(2))
  })

  const discountedTotal = computed(() => {
    return Math.max(0, totalPrice.value - discountAmount.value)
  })

  const discountDescription = computed(() => {
    const rule = discountRule(appliedDiscountCode.value)
    if (!rule) return ''
    return `${rule.label} applied` 
  })

  const applyDiscountCode = (code) => {
    const normalized = code ? code.trim().toUpperCase() : ''
    if (!normalized) {
      appliedDiscountCode.value = ''
      discountError.value = ''
      return true
    }

    const rule = discountRule(normalized)
    if (!rule) {
      appliedDiscountCode.value = ''
      discountError.value = 'Invalid discount code.'
      return false
    }

    appliedDiscountCode.value = normalized
    discountError.value = ''
    return true
  }

  const clearDiscount = () => {
    appliedDiscountCode.value = ''
    discountError.value = ''
  }

  const readLocalCart = () => {
    try {
      return JSON.parse(window.localStorage.getItem(LOCAL_CART_KEY) || '[]')
    } catch (error) {
      console.error('Failed to read local cart:', error)
      return []
    }
  }

  const writeLocalCart = (cartItems = items.value) => {
    try {
      window.localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartItems))
    } catch (error) {
      console.error('Failed to save local cart:', error)
    }
  }

  const cartItemKey = (itemOrId) => {
    if (typeof itemOrId === 'object' && itemOrId !== null) {
      return itemOrId.cartItemId || String(itemOrId.id)
    }

    return String(itemOrId)
  }

  const setCartItems = (cartItems) => {
    items.value = Array.isArray(cartItems) ? cartItems : []
    writeLocalCart(items.value)
  }

  const addLocalItem = (product) => {
    const productCartItemId = product.cartItemId || String(product.id)
    const existingItem = items.value.find(item => cartItemKey(item) === productCartItemId)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      items.value.push({ ...product, cartItemId: productCartItemId, quantity: 1 })
    }

    writeLocalCart()
  }

  const updateLocalQuantity = (productId, quantity) => {
    const id = String(productId)
    items.value = items.value
      .map(item => cartItemKey(item) === id ? { ...item, quantity } : item)
      .filter(item => item.quantity > 0)
    writeLocalCart()
  }

  const removeLocalItem = (productId) => {
    const id = String(productId)
    items.value = items.value.filter(item => cartItemKey(item) !== id)
    writeLocalCart()
  }

  const fetchCart = async () => {
    try {
      isLoading.value = true
      const response = await fetch(`/api/cart`, {
        credentials: 'include'
      })
      if (response.ok) {
        useServerCart.value = true
        setCartItems(await response.json())
      } else {
        useServerCart.value = false
        setCartItems(readLocalCart())
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      useServerCart.value = false
      setCartItems(readLocalCart())
    } finally {
      isLoading.value = false
    }
  }

  const addItem = async (product) => {
    if (!useServerCart.value) {
      addLocalItem(product)
      isOpen.value = true
      return
    }

    try {
      isLoading.value = true
      const response = await fetch(`/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ product })
      })

      if (response.ok) {
        useServerCart.value = true
        setCartItems(await response.json())
      } else {
        useServerCart.value = false
        addLocalItem(product)
      }
    } catch (error) {
      console.error('Failed to add item:', error)
      useServerCart.value = false
      addLocalItem(product)
    } finally {
      isOpen.value = true // Auto open cart when item is added
      isLoading.value = false
    }
  }

  const removeItem = async (productId) => {
    if (!useServerCart.value) {
      removeLocalItem(productId)
      return
    }

    try {
      isLoading.value = true
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        useServerCart.value = true
        setCartItems(await response.json())
      } else {
        useServerCart.value = false
        removeLocalItem(productId)
      }
    } catch (error) {
      console.error('Failed to remove item:', error)
      useServerCart.value = false
      removeLocalItem(productId)
    } finally {
      isLoading.value = false
    }
  }

  const updateQuantity = async (productId, quantity) => {
    if (!useServerCart.value) {
      updateLocalQuantity(productId, quantity)
      return
    }

    try {
      isLoading.value = true
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ quantity })
      })

      if (response.ok) {
        useServerCart.value = true
        setCartItems(await response.json())
      } else {
        useServerCart.value = false
        updateLocalQuantity(productId, quantity)
      }
    } catch (error) {
      console.error('Failed to update quantity:', error)
      useServerCart.value = false
      updateLocalQuantity(productId, quantity)
    } finally {
      isLoading.value = false
    }
  }

  const clearCart = async () => {
    if (!useServerCart.value) {
      setCartItems([])
      return
    }

    try {
      isLoading.value = true
      const response = await fetch(`/api/cart`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        useServerCart.value = true
        setCartItems(await response.json())
      } else {
        useServerCart.value = false
        setCartItems([])
      }
    } catch (error) {
      console.error('Failed to clear cart:', error)
      useServerCart.value = false
      setCartItems([])
    } finally {
      isLoading.value = false
    }
  }

  const toggleOpen = () => {
    isOpen.value = !isOpen.value
  }

  const close = () => {
    isOpen.value = false
  }

  // Initialize cart on store creation
  fetchCart();

  return {
    items,
    isOpen,
    isLoading,
    totalItems,
    totalPrice,
    discountAmount,
    discountedTotal,
    discountDescription,
    appliedDiscountCode,
    discountError,
    applyDiscountCode,
    clearDiscount,
    fetchCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleOpen,
    close,
  }
})
