<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { dashboardApi } from '../../api/dashboard.js'
import { useSubcollections } from '../../composables/useSubcollections.js'

const route = useRoute()
const groupedCollections = ref([])
const loading = ref(true)
const error = ref('')
const modalError = ref('')
const editModalError = ref('')
const showCollectionManager = ref(false)
const showEditModal = ref(false)
const editingProduct = ref(null)
const collectionForm = ref({ name: '' })
const editingCollection = ref(null)
const saving = ref(false)
const managingSubcollectionsFor = ref(null)
const subcollectionForm = ref({ name: '' })
const subcollectionFieldError = ref('')
const editingSubcollection = ref(null)
const previewFilter = ref('all')
const subcollectionsByCollectionId = ref({})
const subcollectionsLoadingMap = ref({})
const collectionFilters = ref({})

const {
  subcollections: managerSubcollections,
  loading: subcollectionsLoading,
  error: subcollectionsError,
  loadSubcollections: loadManagerSubcollections,
  resetSubcollections: resetManagerSubcollections,
} = useSubcollections()

const {
  subcollections: editSubcollections,
  loading: editSubcollectionsLoading,
  error: editSubcollectionsError,
  loadSubcollections: loadEditSubcollections,
  resetSubcollections: resetEditSubcollections,
} = useSubcollections()

const nonSystemCollections = computed(() => groupedCollections.value.filter((collection) => !collection.isSystem))

const managingSubcollectionList = computed(() => {
  if (!managingSubcollectionsFor.value) return []
  if (managerSubcollections.value.length) {
    return managerSubcollections.value
  }
  const collection = groupedCollections.value.find(
    (item) => String(item._id) === String(managingSubcollectionsFor.value._id),
  )
  return collection?.subcollections || []
})

const loadItems = async () => {
  loading.value = true
  error.value = ''

  try {
    groupedCollections.value = await dashboardApi.getGroupedProducts()
    syncSubcollectionsFromGrouped()
    await prefetchCollectionSubcollections()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const syncSubcollectionsFromGrouped = () => {
  const next = { ...subcollectionsByCollectionId.value }

  groupedCollections.value.forEach((collection) => {
    if (!collection.isSystem && Array.isArray(collection.subcollections)) {
      next[String(collection._id)] = collection.subcollections
    }
  })

  subcollectionsByCollectionId.value = next
}

const fetchCollectionSubcollections = async (collectionId) => {
  const id = String(collectionId)
  subcollectionsLoadingMap.value = { ...subcollectionsLoadingMap.value, [id]: true }

  try {
    const subcollections = await dashboardApi.getSubcollections(collectionId)
    subcollectionsByCollectionId.value = {
      ...subcollectionsByCollectionId.value,
      [id]: subcollections,
    }
    return subcollections
  } catch (err) {
    error.value = err.message
    return []
  } finally {
    subcollectionsLoadingMap.value = {
      ...subcollectionsLoadingMap.value,
      [id]: false,
    }
  }
}

const getSubcollectionsForCollection = (collection) => {
  const id = String(collection._id)
  return subcollectionsByCollectionId.value[id] ?? collection.subcollections ?? []
}

const isSubcollectionsLoading = (collectionId) => (
  Boolean(subcollectionsLoadingMap.value[String(collectionId)])
)

const getCollectionFilter = (collectionId) => (
  collectionFilters.value[String(collectionId)] || 'all'
)

const setCollectionFilter = (collectionId, filter) => {
  collectionFilters.value = {
    ...collectionFilters.value,
    [String(collectionId)]: filter,
  }
}

const filteredProductsForCollection = (collection) => {
  const filter = getCollectionFilter(collection._id)
  if (filter === 'all') {
    return collection.products
  }

  return collection.products.filter(
    (product) => String(getSubCollectionId(product)) === String(filter),
  )
}

const onCollectionToggle = async (collection, event) => {
  if (!event.target.open || collection.isSystem) {
    return
  }

  await fetchCollectionSubcollections(collection._id)
}

const prefetchCollectionSubcollections = async () => {
  const collections = groupedCollections.value.filter((collection) => !collection.isSystem)
  await Promise.all(collections.map((collection) => fetchCollectionSubcollections(collection._id)))
}

const getCollectionId = (product) => String(
  product.collectionId?._id || product.collectionId || '',
)

const getSubCollectionId = (product) => {
  const value = product.subCollectionId?._id || product.subCollectionId
  return value ? String(value) : ''
}

const productSubcollectionLabel = (product) => (
  product.subCollectionId?.name || ''
)

const productCountForSubcollection = (collectionId, subcollectionId) => {
  const collection = groupedCollections.value.find(
    (item) => String(item._id) === String(collectionId),
  )
  if (!collection) return 0

  return collection.products.filter(
    (product) => String(product.subCollectionId?._id || product.subCollectionId || '') === String(subcollectionId),
  ).length
}

const productMissingSubcollection = (product, collection) => (
  !collection.isSystem
  && (collection.subcollections?.length || 0) > 0
  && !getSubCollectionId(product)
)

const resetSubcollectionForm = () => {
  subcollectionForm.value = { name: '' }
  editingSubcollection.value = null
  subcollectionFieldError.value = ''
}

const openCollectionManager = () => {
  showCollectionManager.value = true
  collectionForm.value = { name: '' }
  editingCollection.value = null
  managingSubcollectionsFor.value = null
  modalError.value = ''
  resetSubcollectionForm()
  resetManagerSubcollections()
  previewFilter.value = 'all'
}

const closeCollectionManager = () => {
  showCollectionManager.value = false
  collectionForm.value = { name: '' }
  editingCollection.value = null
  managingSubcollectionsFor.value = null
  modalError.value = ''
  resetSubcollectionForm()
  resetManagerSubcollections()
  previewFilter.value = 'all'
}

const openSubcollectionManager = async (collection) => {
  managingSubcollectionsFor.value = collection
  modalError.value = ''
  resetSubcollectionForm()
  previewFilter.value = 'all'
  await loadManagerSubcollections(collection._id)
}

const closeSubcollectionManager = () => {
  managingSubcollectionsFor.value = null
  resetSubcollectionForm()
  resetManagerSubcollections()
  previewFilter.value = 'all'
}

const saveSubcollection = async () => {
  if (!managingSubcollectionsFor.value) return

  const name = subcollectionForm.value.name.trim()
  if (!name) {
    subcollectionFieldError.value = 'Subcollection name is required.'
    return
  }

  saving.value = true
  modalError.value = ''
  subcollectionFieldError.value = ''

  try {
    if (editingSubcollection.value) {
      await dashboardApi.updateSubcollection(
        managingSubcollectionsFor.value._id,
        editingSubcollection.value._id,
        name,
      )
    } else {
      await dashboardApi.createSubcollection(managingSubcollectionsFor.value._id, name)
    }

    resetSubcollectionForm()
    await loadItems()
    await loadManagerSubcollections(managingSubcollectionsFor.value._id)
    await fetchCollectionSubcollections(managingSubcollectionsFor.value._id)

    const refreshed = groupedCollections.value.find(
      (item) => String(item._id) === String(managingSubcollectionsFor.value._id),
    )
    if (refreshed) {
      managingSubcollectionsFor.value = refreshed
    }
  } catch (err) {
    modalError.value = err.message
  } finally {
    saving.value = false
  }
}

const startEditSubcollection = (subcollection) => {
  editingSubcollection.value = subcollection
  subcollectionForm.value = { name: subcollection.name }
  subcollectionFieldError.value = ''
}

const cancelSubcollectionEdit = () => {
  resetSubcollectionForm()
}

const deleteSubcollection = async (subcollection) => {
  if (!managingSubcollectionsFor.value) return
  if (!window.confirm(`Delete "${subcollection.name}"? Products in this subcollection will become unassigned.`)) {
    return
  }

  saving.value = true
  modalError.value = ''

  try {
    await dashboardApi.deleteSubcollection(
      managingSubcollectionsFor.value._id,
      subcollection._id,
    )

    if (editingSubcollection.value?._id === subcollection._id) {
      resetSubcollectionForm()
    }

    await loadItems()
    await loadManagerSubcollections(managingSubcollectionsFor.value._id)
    await fetchCollectionSubcollections(managingSubcollectionsFor.value._id)

    const refreshed = groupedCollections.value.find(
      (item) => String(item._id) === String(managingSubcollectionsFor.value._id),
    )
    managingSubcollectionsFor.value = refreshed || null
  } catch (err) {
    modalError.value = err.message
  } finally {
    saving.value = false
  }
}

const moveSubcollection = async (index, direction) => {
  if (!managingSubcollectionsFor.value) return

  const items = [...managingSubcollectionList.value]
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= items.length) return

  const reordered = [...items]
  const [moved] = reordered.splice(index, 1)
  reordered.splice(targetIndex, 0, moved)

  saving.value = true
  modalError.value = ''

  try {
    await dashboardApi.reorderSubcollections(
      managingSubcollectionsFor.value._id,
      reordered.map((item) => item._id),
    )
    await loadItems()
    await loadManagerSubcollections(managingSubcollectionsFor.value._id)
    await fetchCollectionSubcollections(managingSubcollectionsFor.value._id)

    const refreshed = groupedCollections.value.find(
      (item) => String(item._id) === String(managingSubcollectionsFor.value._id),
    )
    if (refreshed) {
      managingSubcollectionsFor.value = refreshed
    }
  } catch (err) {
    modalError.value = err.message
  } finally {
    saving.value = false
  }
}

const openEditModal = async (product) => {
  editingProduct.value = {
    ...product,
    collectionId: getCollectionId(product),
    subCollectionId: getSubCollectionId(product),
    customProperties: product.customProperties?.length
      ? product.customProperties.map((property) => ({ ...property, options: [...(property.options || [])] }))
      : [],
  }
  editModalError.value = ''
  showEditModal.value = true
  await loadEditSubcollections(editingProduct.value.collectionId)
}

const closeEditModal = () => {
  showEditModal.value = false
  editingProduct.value = null
  editModalError.value = ''
  resetEditSubcollections()
}

const subcollectionsForCollection = (collectionId) => {
  if (
    editingProduct.value
    && String(editingProduct.value.collectionId) === String(collectionId)
    && editSubcollections.value.length
  ) {
    return editSubcollections.value
  }

  const collection = groupedCollections.value.find(
    (item) => String(item._id) === String(collectionId),
  )
  return collection?.subcollections || []
}

const collectionRequiresSubcollection = (collectionId) => (
  subcollectionsForCollection(collectionId).length > 0
)

const handleEditCollectionChange = async () => {
  if (!editingProduct.value) return
  editingProduct.value.subCollectionId = ''
  editModalError.value = ''
  await loadEditSubcollections(editingProduct.value.collectionId)
}

const saveProduct = async () => {
  if (!editingProduct.value) return

  if (
    collectionRequiresSubcollection(editingProduct.value.collectionId)
    && !editingProduct.value.subCollectionId
  ) {
    editModalError.value = 'Please select a subcollection for this collection.'
    return
  }

  saving.value = true
  editModalError.value = ''

  try {
    await dashboardApi.updateProduct(editingProduct.value._id, {
      name: editingProduct.value.name,
      collectionId: editingProduct.value.collectionId,
      subCollectionId: editingProduct.value.subCollectionId || null,
      color: editingProduct.value.color,
      size: editingProduct.value.size,
      importantNotes: editingProduct.value.importantNotes,
      description: editingProduct.value.description,
      price: Number(editingProduct.value.price),
      shippingCost: Number(editingProduct.value.shippingCost || 0),
      freeShipping: editingProduct.value.freeShipping,
      outOfStock: editingProduct.value.outOfStock,
      customProperties: editingProduct.value.customProperties,
      photos: editingProduct.value.photos,
    })
    closeEditModal()
    await loadItems()
  } catch (err) {
    editModalError.value = err.message
  } finally {
    saving.value = false
  }
}

const removeProduct = async (productId) => {
  if (!window.confirm('Remove this item?')) return

  try {
    await dashboardApi.deleteProduct(productId)
    await loadItems()
  } catch (err) {
    error.value = err.message
  }
}

const saveCollection = async () => {
  const name = collectionForm.value.name.trim()
  if (!name) return

  saving.value = true
  modalError.value = ''

  try {
    if (editingCollection.value) {
      await dashboardApi.updateCollection(editingCollection.value._id, name)
    } else {
      await dashboardApi.createCollection(name)
    }
    collectionForm.value = { name: '' }
    editingCollection.value = null
    await loadItems()
  } catch (err) {
    modalError.value = err.message
  } finally {
    saving.value = false
  }
}

const startEditCollection = (collection) => {
  editingCollection.value = collection
  collectionForm.value = { name: collection.name }
  managingSubcollectionsFor.value = null
  modalError.value = ''
  resetSubcollectionForm()
  resetManagerSubcollections()
}

const deleteCollection = async (collection) => {
  if (!window.confirm(`Delete "${collection.name}"? Items will move to Uncategorized.`)) return

  try {
    await dashboardApi.deleteCollection(collection._id)
    if (String(managingSubcollectionsFor.value?._id) === String(collection._id)) {
      managingSubcollectionsFor.value = null
      resetSubcollectionForm()
    }
    await loadItems()
  } catch (err) {
    error.value = err.message
  }
}

const moveCollection = async (index, direction) => {
  const collections = [...nonSystemCollections.value]
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= collections.length) return

  const reordered = [...collections]
  const [moved] = reordered.splice(index, 1)
  reordered.splice(targetIndex, 0, moved)

  try {
    const uncategorized = groupedCollections.value.find((collection) => collection.isSystem)
    const orderedIds = [
      ...reordered.map((collection) => collection._id),
      ...(uncategorized ? [uncategorized._id] : []),
    ]
    await dashboardApi.reorderCollections(orderedIds)
    await loadItems()
  } catch (err) {
    error.value = err.message
  }
}

const moveProduct = async (collection, product, direction) => {
  const products = [...collection.products]
  const index = products.findIndex((item) => String(item._id) === String(product._id))
  if (index === -1) return

  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= products.length) return

  const reordered = [...products]
  const [moved] = reordered.splice(index, 1)
  reordered.splice(targetIndex, 0, moved)

  try {
    await dashboardApi.reorderProducts(
      collection._id,
      reordered.map((product) => product._id),
    )
    await loadItems()
  } catch (err) {
    error.value = err.message
  }
}

const collectionLabel = (collection) => {
  if (collection.isSystem) {
    return 'Uncategorized (These items have no collection.)'
  }
  return collection.name
}

onMounted(loadItems)
watch(
  () => route.fullPath,
  (path) => {
    if (path === '/dashboard/items') {
      loadItems()
    }
  },
)
</script>

<template>
  <div class="items-page">
    <div class="page-header">
      <h1>Items</h1>

      <div class="header-actions">
        <RouterLink to="/dashboard/create" class="create-btn">
          Create New Item
        </RouterLink>

        <button class="manage-btn" type="button" @click="openCollectionManager">
          Manage Collections
        </button>
      </div>
    </div>

    <p v-if="error" class="error-banner">{{ error }}</p>
    <p v-if="loading" class="status-text">Loading items...</p>

    <details
      v-for="collection in groupedCollections"
      :key="collection._id"
      open
      class="collection"
      @toggle="onCollectionToggle(collection, $event)"
    >
      <summary>
        {{ collectionLabel(collection) }}
        <span class="collection-count">({{ collection.products.length }} Items)</span>
        <span v-if="getSubcollectionsForCollection(collection).length" class="collection-count">
          · {{ getSubcollectionsForCollection(collection).length }} Subcollections
        </span>
      </summary>

      <div
        v-if="!collection.isSystem"
        class="collection-header"
      >
        <h2 class="collection-title">{{ collectionLabel(collection) }}</h2>

        <p v-if="getSubcollectionsForCollection(collection).length" class="collection-subtitle">
          Filter items by sub-collection.
        </p>

        <p v-if="isSubcollectionsLoading(collection._id)" class="collection-subtitle">
          Loading sub-collections...
        </p>

        <div
          v-else-if="getSubcollectionsForCollection(collection).length"
          class="collection-filters"
          aria-label="Sub-collection filters"
        >
          <button
            type="button"
            class="collection-filter"
            :class="{ 'collection-filter--active': getCollectionFilter(collection._id) === 'all' }"
            :aria-pressed="getCollectionFilter(collection._id) === 'all'"
            @click="setCollectionFilter(collection._id, 'all')"
          >
            All
          </button>

          <button
            v-for="subcollection in getSubcollectionsForCollection(collection)"
            :key="subcollection._id"
            type="button"
            class="collection-filter"
            :class="{ 'collection-filter--active': getCollectionFilter(collection._id) === subcollection._id }"
            :aria-pressed="getCollectionFilter(collection._id) === subcollection._id"
            @click="setCollectionFilter(collection._id, subcollection._id)"
          >
            {{ subcollection.name }}
          </button>
        </div>
      </div>

      <p v-if="!collection.products.length" class="empty-collection">
        No items in this collection yet.
      </p>

      <p
        v-else-if="!filteredProductsForCollection(collection).length"
        class="empty-collection"
      >
        No items in this sub-collection yet.
      </p>

      <div
        v-for="product in filteredProductsForCollection(collection)"
        :key="product._id"
        class="item-card"
      >
        <div class="item-header">
          <h3>{{ product.name }}</h3>

          <div class="badges">
            <span class="badge" :class="product.outOfStock ? 'red' : 'green'">
              {{ product.outOfStock ? 'Out Of Stock' : 'In Stock' }}
            </span>
            <span v-if="product.freeShipping" class="badge blue">Free Shipping</span>
            <span v-if="productSubcollectionLabel(product)" class="badge purple">
              {{ productSubcollectionLabel(product) }}
            </span>
            <span
              v-else-if="productMissingSubcollection(product, collection)"
              class="badge orange"
            >
              No Subcollection
            </span>
          </div>
        </div>

        <div v-if="product.photos?.length" class="photo-grid">
          <img
            v-for="(photo, index) in product.photos.slice(0, 4)"
            :key="`${product._id}-${index}`"
            :src="photo"
            :alt="`${product.name} photo ${index + 1}`"
            class="photo"
          >
        </div>

        <div class="item-details">
          <p><strong>Collection:</strong> {{ collectionLabel(collection) }}</p>
          <p v-if="productSubcollectionLabel(product)">
            <strong>Subcollection:</strong> {{ productSubcollectionLabel(product) }}
          </p>
          <p><strong>Price:</strong> ${{ Number(product.price).toFixed(2) }}</p>
          <p v-if="product.color"><strong>Color:</strong> {{ product.color }}</p>
          <p v-if="product.size"><strong>Size:</strong> {{ product.size }}</p>
          <p v-if="product.importantNotes">
            <strong>Important Notes:</strong><br>
            {{ product.importantNotes }}
          </p>
          <p>
            <strong>Description:</strong><br>
            {{ product.description }}
          </p>

          <div v-if="product.customProperties?.length" class="custom-properties">
            <h4>Custom Properties</h4>

            <div v-for="property in product.customProperties" :key="property.name" class="property">
              <strong>{{ property.name }}{{ property.required ? ' *' : '' }}</strong>
              <ul>
                <li v-for="option in property.options" :key="option">{{ option }}</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="actions">
          <button type="button" @click="moveProduct(collection, product, -1)">↑</button>
          <button type="button" @click="moveProduct(collection, product, 1)">↓</button>
          <button class="edit-btn" type="button" @click="openEditModal(product)">
            Edit
          </button>

          <button class="delete-btn" type="button" @click="removeProduct(product._id)">
            Remove
          </button>
        </div>
      </div>
    </details>

    <div v-if="showCollectionManager" class="modal-overlay">
      <section class="modal-card modal-card--wide">
        <div class="modal-header">
          <h2>Manage Collections</h2>
          <button type="button" class="clear-btn" @click="closeCollectionManager">Close</button>
        </div>

        <p v-if="modalError" class="error-banner">{{ modalError }}</p>

        <div class="field">
          <label>{{ editingCollection ? 'Rename Collection' : 'New Collection' }}</label>
          <div class="inline-field">
            <input v-model="collectionForm.name" type="text" placeholder="Collection name">
            <button type="button" class="continue-btn" :disabled="saving" @click="saveCollection">
              {{ editingCollection ? 'Save Name' : 'Add Collection' }}
            </button>
          </div>
        </div>

        <div class="collection-list">
          <div
            v-for="(collection, index) in nonSystemCollections"
            :key="collection._id"
            class="collection-row"
          >
            <div class="collection-row-main">
              <span>{{ collection.name }}</span>
              <span v-if="collection.subcollections?.length" class="collection-meta">
                {{ collection.subcollections.length }} subcollections
              </span>
            </div>
            <div class="row-actions">
              <button type="button" @click="moveCollection(index, -1)">↑</button>
              <button type="button" @click="moveCollection(index, 1)">↓</button>
              <button type="button" class="edit-btn" @click="startEditCollection(collection)">Rename</button>
              <button
                type="button"
                class="manage-btn"
                @click="openSubcollectionManager(collection)"
              >
                Subcollections
              </button>
              <button type="button" class="delete-btn" @click="deleteCollection(collection)">Delete</button>
            </div>
          </div>
        </div>

        <div v-if="managingSubcollectionsFor" class="subcollection-panel">
          <div class="modal-header">
            <h3>Subcollections for {{ managingSubcollectionsFor.name }}</h3>
            <button type="button" class="clear-btn" @click="closeSubcollectionManager">Done</button>
          </div>

          <p class="hint">
            These appear as filter chips on the storefront collection page.
          </p>

          <p v-if="subcollectionsError" class="error-banner">{{ subcollectionsError }}</p>
          <p v-if="subcollectionsLoading" class="status-text">Loading subcollections...</p>

          <div class="storefront-preview">
            <div class="collection-filters">
              <button
                type="button"
                class="collection-filter"
                :class="{ 'collection-filter--active': previewFilter === 'all' }"
                @click="previewFilter = 'all'"
              >
                All
              </button>
              <button
                v-for="subcollection in managingSubcollectionList"
                :key="subcollection._id"
                type="button"
                class="collection-filter"
                :class="{ 'collection-filter--active': previewFilter === subcollection._id }"
                @click="previewFilter = subcollection._id"
              >
                {{ subcollection.name }}
              </button>
            </div>
          </div>

          <div class="field">
            <label>{{ editingSubcollection ? 'Rename Subcollection' : 'New Subcollection' }}</label>
            <div class="inline-field">
              <input
                v-model="subcollectionForm.name"
                type="text"
                placeholder="e.g. Vests"
                :disabled="saving"
                @keyup.enter="saveSubcollection"
              >
              <button
                type="button"
                class="continue-btn"
                :disabled="saving || !subcollectionForm.name.trim()"
                @click="saveSubcollection"
              >
                {{ saving ? 'Saving...' : (editingSubcollection ? 'Save Name' : 'Add Subcollection') }}
              </button>
              <button
                v-if="editingSubcollection"
                type="button"
                class="clear-btn"
                :disabled="saving"
                @click="cancelSubcollectionEdit"
              >
                Cancel
              </button>
            </div>
            <p v-if="subcollectionFieldError" class="field-error">{{ subcollectionFieldError }}</p>
          </div>

          <p v-if="!subcollectionsLoading && !managingSubcollectionList.length" class="empty-subcollections">
            No subcollections yet. Add one above to create chips like “Vests” or “Bracelets”.
          </p>

          <div v-else class="subcollection-list">
            <article
              v-for="(subcollection, subcollectionIndex) in managingSubcollectionList"
              :key="subcollection._id"
              class="subcollection-row"
              :class="{ 'subcollection-row--editing': editingSubcollection?._id === subcollection._id }"
            >
              <div class="subcollection-main">
                <span class="subcollection-chip">{{ subcollection.name }}</span>
                <span class="subcollection-meta">
                  {{ productCountForSubcollection(managingSubcollectionsFor._id, subcollection._id) }} items
                </span>
              </div>

              <div class="row-actions">
                <button
                  type="button"
                  :disabled="saving || subcollectionIndex === 0"
                  @click="moveSubcollection(subcollectionIndex, -1)"
                >
                  ↑
                </button>
                <button
                  type="button"
                  :disabled="saving || subcollectionIndex === managingSubcollectionList.length - 1"
                  @click="moveSubcollection(subcollectionIndex, 1)"
                >
                  ↓
                </button>
                <button
                  type="button"
                  class="edit-btn"
                  :disabled="saving"
                  @click="startEditSubcollection(subcollection)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="delete-btn"
                  :disabled="saving"
                  @click="deleteSubcollection(subcollection)"
                >
                  Delete
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>

    <div v-if="showEditModal && editingProduct" class="modal-overlay">
      <section class="modal-card">
        <div class="modal-header">
          <h2>Edit Item</h2>
          <button type="button" class="clear-btn" @click="closeEditModal">Cancel</button>
        </div>

        <p v-if="editModalError" class="error-banner">{{ editModalError }}</p>

        <div class="field">
          <label>Item Name</label>
          <input v-model="editingProduct.name" type="text">
        </div>

        <div class="field">
          <label>Collection</label>
          <select v-model="editingProduct.collectionId" @change="handleEditCollectionChange">
            <option
              v-for="collection in groupedCollections"
              :key="collection._id"
              :value="String(collection._id)"
            >
              {{ collectionLabel(collection) }}
            </option>
          </select>
        </div>

        <div
          v-if="collectionRequiresSubcollection(editingProduct.collectionId)"
          class="field"
        >
          <label>Subcollection *</label>
          <select
            v-model="editingProduct.subCollectionId"
            required
            :disabled="editSubcollectionsLoading || saving"
          >
            <option value="">
              {{ editSubcollectionsLoading ? 'Loading subcollections...' : 'Select a subcollection' }}
            </option>
            <option
              v-for="subcollection in subcollectionsForCollection(editingProduct.collectionId)"
              :key="subcollection._id"
              :value="String(subcollection._id)"
            >
              {{ subcollection.name }}
            </option>
          </select>
          <p v-if="editSubcollectionsError" class="field-error">{{ editSubcollectionsError }}</p>
        </div>

        <div class="field">
          <label>Color</label>
          <input v-model="editingProduct.color" type="text">
        </div>

        <div class="field">
          <label>Size</label>
          <input v-model="editingProduct.size" type="text">
        </div>

        <div class="field">
          <label>Important Notes</label>
          <textarea v-model="editingProduct.importantNotes" rows="3" />
        </div>

        <div class="field">
          <label>Description</label>
          <textarea v-model="editingProduct.description" rows="6" />
        </div>

        <div class="field">
          <label>Price (USD)</label>
          <input v-model.number="editingProduct.price" type="number" min="0" step="0.01">
        </div>

        <div class="field">
          <label>Shipping Cost (USD)</label>
          <input v-model.number="editingProduct.shippingCost" type="number" min="0" step="0.01">
        </div>

        <div class="field">
          <label>
            <input v-model="editingProduct.freeShipping" type="checkbox">
            Free Shipping
          </label>
        </div>

        <div class="field">
          <label>
            <input v-model="editingProduct.outOfStock" type="checkbox">
            Out Of Stock
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="continue-btn" :disabled="saving || editSubcollectionsLoading" @click="saveProduct">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.items-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.create-btn {
  background: #2ea44f;
  color: white;
  padding: 12px 18px;
  border-radius: 8px;
  text-decoration: none;
}

.collection {
  margin-bottom: 20px;
  border: 1px solid #d9e8dc;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.collection-header {
  padding: 20px 20px 8px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.collection-title {
  margin: 0 0 8px;
  font-size: 1.5rem;
  font-weight: 700;
}

.collection-subtitle {
  margin: 0 0 16px;
  color: #666;
}

.collection summary {
  padding: 16px;
  background: #f3faf4;
  cursor: pointer;
  font-weight: 600;
}

.collection-count {
  color: #666;
  margin-left: 10px;
}

.item-card {
  padding: 20px;
  border-top: 1px solid #e5e5e5;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin: 20px 0;
}

.photo {
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  background: #ececec;
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.badge {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: .85rem;
}

.green { background: #dff6e5; }
.blue { background: #ddefff; }
.red { background: #ffe2e2; }
.purple { background: #efe6ff; }
.orange { background: #ffe8cc; color: #8a4b00; }

.custom-properties { margin-top: 20px; }

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.edit-btn {
  background: #2ea44f;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
}

.delete-btn {
  background: #d9534f;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
}

.modal-card {
  border: 1px solid #d9e8dc;
  border-radius: 12px;
  padding: 24px;
  background: white;
  max-width: 720px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-card--wide {
  max-width: 860px;
}

.field { margin-bottom: 16px; }
.field label { display: block; margin-bottom: 8px; }

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
}

.modal-actions,
.modal-header,
.inline-field,
.row-actions,
.header-actions {
  display: flex;
  gap: 10px;
}

.modal-header {
  justify-content: space-between;
  align-items: center;
}

.continue-btn {
  background: #2ea44f;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
}

.header-actions { gap: 12px; }

.manage-btn,
.clear-btn {
  background: white;
  border: 1px solid #2ea44f;
  color: #2ea44f;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.row-actions button {
  border: 1px solid #d0d0d0;
  /* background: #fff; */
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}

.row-actions button:disabled,
.continue-btn:disabled,
.manage-btn:disabled,
.clear-btn:disabled,
.edit-btn:disabled,
.delete-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1000;
}

.collection-list,
.subcollection-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.collection-row,
.subcollection-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
}

.collection-row-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.collection-meta,
.subcollection-meta {
  color: #666;
  font-size: 0.9rem;
}

.subcollection-panel {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e5e5;
}

.hint {
  margin: 0 0 16px;
  color: #666;
}

.storefront-preview { margin-bottom: 16px; }

.collection-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.collection-filter {
  appearance: none;
  border: 1px solid #d0d0d0;
  border-radius: 999px;
  background: #fff;
  color: #111;
  cursor: pointer;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  min-height: 42px;
  padding: 9px 18px;
}

.collection-filter--active {
  background: #1f6f78;
  border-color: #1f6f78;
  color: #fff;
}

.subcollection-row--editing {
  border-color: #2ea44f;
  background: #f3faf4;
}

.subcollection-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.subcollection-chip {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid #d0d0d0;
  background: #fff;
  font-weight: 600;
}

.empty-subcollections {
  margin: 16px 0 0;
  padding: 16px;
  border: 1px dashed #d0d0d0;
  border-radius: 8px;
  color: #666;
  background: #fafafa;
}

.inline-field input { flex: 1; }

.error-banner {
  background: #ffe2e2;
  color: #8a1f1f;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.field-error {
  margin: 8px 0 0;
  color: #8a1f1f;
  font-size: 0.9rem;
}

.status-text,
.empty-collection {
  color: #666;
  padding: 16px 20px;
}

@media (max-width: 720px) {
  .collection-row,
  .subcollection-row {
    flex-direction: column;
    align-items: stretch;
  }

  .row-actions { justify-content: flex-end; }
}
</style>
