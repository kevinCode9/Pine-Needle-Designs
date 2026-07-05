<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { dashboardApi } from '../../api/dashboard.js'

const route = useRoute()
const groupedCollections = ref([])
const loading = ref(true)
const error = ref('')
const showCollectionManager = ref(false)
const showEditModal = ref(false)
const editingProduct = ref(null)
const collectionForm = ref({ name: '' })
const editingCollection = ref(null)
const saving = ref(false)
const expandedSubcollectionCollectionId = ref(null)
const subcollectionForm = ref({ name: '' })
const editingSubcollection = ref(null)
const editingSubcollectionCollectionId = ref(null)
const previewFilters = ref({})

const nonSystemCollections = computed(() => groupedCollections.value.filter((collection) => !collection.isSystem))

const loadItems = async () => {
  loading.value = true
  error.value = ''

  try {
    groupedCollections.value = await dashboardApi.getGroupedProducts()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const getCollectionId = (product) => String(
  product.collectionId?._id || product.collectionId || '',
)

const getSubcollectionIds = (product) => (
  Array.isArray(product.subcollectionIds)
    ? product.subcollectionIds.map((item) => String(item?._id || item))
    : []
)

const productSubcollectionLabels = (product) => (
  Array.isArray(product.subcollectionIds)
    ? product.subcollectionIds.map((item) => item?.name).filter(Boolean)
    : []
)

const productCountForSubcollection = (collection, subcollectionId) => (
  collection.products.filter((product) => (
    Array.isArray(product.subcollectionIds)
    && product.subcollectionIds.some((item) => String(item?._id || item) === String(subcollectionId))
  )).length
)

const getPreviewFilter = (collectionId) => previewFilters.value[collectionId] || 'all'

const setPreviewFilter = (collectionId, filter) => {
  previewFilters.value = {
    ...previewFilters.value,
    [collectionId]: filter,
  }
}

const isSubcollectionPanelOpen = (collectionId) => (
  String(expandedSubcollectionCollectionId.value) === String(collectionId)
)

const resetSubcollectionForm = () => {
  subcollectionForm.value = { name: '' }
  editingSubcollection.value = null
  editingSubcollectionCollectionId.value = null
}

const toggleSubcollectionPanel = (collection) => {
  if (isSubcollectionPanelOpen(collection._id)) {
    expandedSubcollectionCollectionId.value = null
    resetSubcollectionForm()
    return
  }

  expandedSubcollectionCollectionId.value = collection._id
  resetSubcollectionForm()
}

const saveSubcollection = async (collection) => {
  const name = subcollectionForm.value.name.trim()
  if (!name) return

  saving.value = true
  error.value = ''

  try {
    if (
      editingSubcollection.value
      && String(editingSubcollectionCollectionId.value) === String(collection._id)
    ) {
      await dashboardApi.updateSubcollection(
        collection._id,
        editingSubcollection.value._id,
        name,
      )
    } else {
      await dashboardApi.createSubcollection(collection._id, name)
    }

    resetSubcollectionForm()
    await loadItems()
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

const startEditSubcollection = (collection, subcollection) => {
  expandedSubcollectionCollectionId.value = collection._id
  editingSubcollection.value = subcollection
  editingSubcollectionCollectionId.value = collection._id
  subcollectionForm.value = { name: subcollection.name }
}

const cancelSubcollectionEdit = () => {
  resetSubcollectionForm()
}

const deleteSubcollection = async (collection, subcollection) => {
  if (!window.confirm(`Delete "${subcollection.name}"? Items keep their collection but lose this filter.`)) {
    return
  }

  saving.value = true
  error.value = ''

  try {
    await dashboardApi.deleteSubcollection(collection._id, subcollection._id)

    if (editingSubcollection.value?._id === subcollection._id) {
      resetSubcollectionForm()
    }

    await loadItems()
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

const moveSubcollection = async (collection, index, direction) => {
  const items = [...(collection.subcollections || [])]
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= items.length) return

  const reordered = [...items]
  const [moved] = reordered.splice(index, 1)
  reordered.splice(targetIndex, 0, moved)

  saving.value = true
  error.value = ''

  try {
    await dashboardApi.reorderSubcollections(
      collection._id,
      reordered.map((item) => item._id),
    )
    await loadItems()
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

const openEditModal = (product) => {
  editingProduct.value = {
    ...product,
    collectionId: getCollectionId(product),
    subcollectionIds: getSubcollectionIds(product),
    customProperties: product.customProperties?.length
      ? product.customProperties.map((property) => ({ ...property, options: [...(property.options || [])] }))
      : [],
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingProduct.value = null
}

const subcollectionsForCollection = (collectionId) => {
  const collection = groupedCollections.value.find(
    (item) => String(item._id) === String(collectionId),
  )
  return collection?.subcollections || []
}

const toggleProductSubcollection = (subcollectionId) => {
  if (!editingProduct.value) return

  const currentIds = [...editingProduct.value.subcollectionIds]
  const normalizedId = String(subcollectionId)
  const existingIndex = currentIds.indexOf(normalizedId)

  if (existingIndex >= 0) {
    currentIds.splice(existingIndex, 1)
  } else {
    currentIds.push(normalizedId)
  }

  editingProduct.value.subcollectionIds = currentIds
}

const handleEditCollectionChange = () => {
  if (!editingProduct.value) return

  const allowedIds = new Set(
    subcollectionsForCollection(editingProduct.value.collectionId).map((item) => String(item._id)),
  )

  editingProduct.value.subcollectionIds = editingProduct.value.subcollectionIds.filter(
    (id) => allowedIds.has(String(id)),
  )
}

const saveProduct = async () => {
  if (!editingProduct.value) return

  saving.value = true
  error.value = ''

  try {
    await dashboardApi.updateProduct(editingProduct.value._id, {
      name: editingProduct.value.name,
      collectionId: editingProduct.value.collectionId,
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
      subcollectionIds: editingProduct.value.subcollectionIds,
    })
    closeEditModal()
    await loadItems()
  } catch (err) {
    error.value = err.message
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

const openCollectionManager = () => {
  showCollectionManager.value = true
  collectionForm.value = { name: '' }
  editingCollection.value = null
}

const closeCollectionManager = () => {
  showCollectionManager.value = false
  collectionForm.value = { name: '' }
  editingCollection.value = null
}

const saveCollection = async () => {
  const name = collectionForm.value.name.trim()
  if (!name) return

  saving.value = true
  error.value = ''

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
    error.value = err.message
  } finally {
    saving.value = false
  }
}

const startEditCollection = (collection) => {
  editingCollection.value = collection
  collectionForm.value = { name: collection.name }
}

const deleteCollection = async (collection) => {
  if (!window.confirm(`Delete "${collection.name}"? Items will move to Uncategorized.`)) return

  try {
    await dashboardApi.deleteCollection(collection._id)
    if (String(expandedSubcollectionCollectionId.value) === String(collection._id)) {
      expandedSubcollectionCollectionId.value = null
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

const moveProduct = async (collection, index, direction) => {
  const products = [...collection.products]
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
          Edit Collections
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
    >
      <summary>
        {{ collectionLabel(collection) }}
        <span class="collection-count">({{ collection.products.length }} Items)</span>
        <span v-if="collection.subcollections?.length" class="collection-count">
          · {{ collection.subcollections.length }} Subcollections
        </span>
      </summary>

      <section v-if="!collection.isSystem" class="subcollections-section">
        <div class="subcollections-header">
          <div>
            <h3>Subcollections</h3>
            <p class="hint">
              Filter chips shown on the storefront collection page.
            </p>
          </div>

          <button
            type="button"
            class="manage-btn"
            @click="toggleSubcollectionPanel(collection)"
          >
            {{ isSubcollectionPanelOpen(collection._id) ? 'Hide Manager' : 'Manage Subcollections' }}
          </button>
        </div>

        <div class="storefront-preview">
          <div class="collection-filters" :aria-label="`${collection.name} subcollection preview`">
            <button
              type="button"
              class="collection-filter"
              :class="{ 'collection-filter--active': getPreviewFilter(collection._id) === 'all' }"
              @click="setPreviewFilter(collection._id, 'all')"
            >
              All
            </button>
            <button
              v-for="subcollection in collection.subcollections || []"
              :key="subcollection._id"
              type="button"
              class="collection-filter"
              :class="{ 'collection-filter--active': getPreviewFilter(collection._id) === subcollection._id }"
              @click="setPreviewFilter(collection._id, subcollection._id)"
            >
              {{ subcollection.name }}
            </button>
          </div>
        </div>

        <div
          v-if="isSubcollectionPanelOpen(collection._id)"
          class="subcollection-manager"
        >
          <div class="field">
            <label>
              {{
                editingSubcollection && String(editingSubcollectionCollectionId) === String(collection._id)
                  ? 'Rename Subcollection'
                  : 'New Subcollection'
              }}
            </label>
            <div class="inline-field">
              <input
                v-model="subcollectionForm.name"
                type="text"
                placeholder="e.g. Vests"
                :disabled="saving"
                @keyup.enter="saveSubcollection(collection)"
              >
              <button
                type="button"
                class="continue-btn"
                :disabled="saving || !subcollectionForm.name.trim()"
                @click="saveSubcollection(collection)"
              >
                {{
                  saving
                    ? 'Saving...'
                    : (
                      editingSubcollection && String(editingSubcollectionCollectionId) === String(collection._id)
                        ? 'Save Name'
                        : 'Add Subcollection'
                    )
                }}
              </button>
              <button
                v-if="editingSubcollection && String(editingSubcollectionCollectionId) === String(collection._id)"
                type="button"
                class="clear-btn"
                :disabled="saving"
                @click="cancelSubcollectionEdit"
              >
                Cancel
              </button>
            </div>
          </div>

          <p v-if="!collection.subcollections?.length" class="empty-subcollections">
            No subcollections yet. Add one above to create chips like “Vests” or “Bracelets”.
          </p>

          <div v-else class="subcollection-list">
            <article
              v-for="(subcollection, subcollectionIndex) in collection.subcollections"
              :key="subcollection._id"
              class="subcollection-row"
              :class="{
                'subcollection-row--editing': editingSubcollection?._id === subcollection._id,
              }"
            >
              <div class="subcollection-main">
                <span class="subcollection-chip">{{ subcollection.name }}</span>
                <span class="subcollection-meta">
                  {{ productCountForSubcollection(collection, subcollection._id) }} items
                </span>
              </div>

              <div class="row-actions">
                <button
                  type="button"
                  :disabled="saving || subcollectionIndex === 0"
                  @click="moveSubcollection(collection, subcollectionIndex, -1)"
                >
                  ↑
                </button>
                <button
                  type="button"
                  :disabled="saving || subcollectionIndex === collection.subcollections.length - 1"
                  @click="moveSubcollection(collection, subcollectionIndex, 1)"
                >
                  ↓
                </button>
                <button
                  type="button"
                  class="edit-btn"
                  :disabled="saving"
                  @click="startEditSubcollection(collection, subcollection)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="delete-btn"
                  :disabled="saving"
                  @click="deleteSubcollection(collection, subcollection)"
                >
                  Delete
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <p v-if="!collection.products.length" class="empty-collection">
        No items in this collection yet.
      </p>

      <div v-for="(product, productIndex) in collection.products" :key="product._id" class="item-card">
        <div class="item-header">
          <h3>{{ product.name }}</h3>

          <div class="badges">
            <span class="badge" :class="product.outOfStock ? 'red' : 'green'">
              {{ product.outOfStock ? 'Out Of Stock' : 'In Stock' }}
            </span>
            <span v-if="product.freeShipping" class="badge blue">Free Shipping</span>
            <span
              v-for="label in productSubcollectionLabels(product)"
              :key="`${product._id}-${label}`"
              class="badge purple"
            >
              {{ label }}
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
          <p v-if="productSubcollectionLabels(product).length">
            <strong>Subcollections:</strong> {{ productSubcollectionLabels(product).join(', ') }}
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
          <button type="button" @click="moveProduct(collection, productIndex, -1)">↑</button>
          <button type="button" @click="moveProduct(collection, productIndex, 1)">↓</button>
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
      <section class="modal-card">
        <div class="modal-header">
          <h2>Manage Collections</h2>
          <button type="button" class="clear-btn" @click="closeCollectionManager">Close</button>
        </div>

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
            <span>{{ collection.name }}</span>
            <div class="row-actions">
              <button type="button" @click="moveCollection(index, -1)">↑</button>
              <button type="button" @click="moveCollection(index, 1)">↓</button>
              <button type="button" class="edit-btn" @click="startEditCollection(collection)">Rename</button>
              <button type="button" class="delete-btn" @click="deleteCollection(collection)">Delete</button>
            </div>
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
          v-if="subcollectionsForCollection(editingProduct.collectionId).length"
          class="field"
        >
          <label>Subcollections</label>
          <div class="subcollection-options">
            <label
              v-for="subcollection in subcollectionsForCollection(editingProduct.collectionId)"
              :key="subcollection._id"
              class="checkbox-row"
            >
              <input
                type="checkbox"
                :checked="editingProduct.subcollectionIds.includes(String(subcollection._id))"
                @change="toggleProductSubcollection(subcollection._id)"
              >
              {{ subcollection.name }}
            </label>
          </div>
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
          <button type="button" class="continue-btn" :disabled="saving" @click="saveProduct">
            Save Changes
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

.subcollections-section {
  padding: 20px;
  border-top: 1px solid #e5e5e5;
  background: #fafafa;
}

.subcollections-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.subcollections-header h3 {
  margin: 0 0 4px;
}

.hint {
  margin: 0;
  color: #666;
  font-size: 0.92rem;
}

.storefront-preview {
  margin-bottom: 16px;
}

.collection-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
  line-height: 1.2;
  min-height: 42px;
  padding: 9px 18px;
}

.collection-filter--active {
  background: #1f6f78;
  border-color: #1f6f78;
  color: #fff;
}

.subcollection-manager {
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
}

.subcollection-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subcollection-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  background: #fff;
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

.subcollection-meta {
  color: #666;
  font-size: 0.9rem;
}

.empty-subcollections {
  margin: 16px 0 0;
  padding: 16px;
  border: 1px dashed #d0d0d0;
  border-radius: 8px;
  color: #666;
  background: #fff;
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

.green {
  background: #dff6e5;
}

.blue {
  background: #ddefff;
}

.red {
  background: #ffe2e2;
}

.purple {
  background: #efe6ff;
}

.custom-properties {
  margin-top: 20px;
}

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
}

.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  margin-bottom: 8px;
}

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

.header-actions {
  gap: 12px;
}

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
  background: #fff;
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

.collection-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.collection-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
}

.inline-field input {
  flex: 1;
}

.subcollection-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-banner {
  background: #ffe2e2;
  color: #8a1f1f;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.status-text,
.empty-collection {
  color: #666;
  padding: 16px 20px;
}

@media (max-width: 720px) {
  .subcollections-header,
  .subcollection-row {
    flex-direction: column;
    align-items: stretch;
  }

  .row-actions {
    justify-content: flex-end;
  }
}
</style>
