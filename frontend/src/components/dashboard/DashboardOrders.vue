<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { dashboardApi } from '../../api/dashboard.js'

const route = useRoute()
const orders = ref([])
const loading = ref(true)
const error = ref('')
const savingOrderId = ref('')
const statusFilter = ref('all')

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
]

const filteredOrders = computed(() => {
  if (statusFilter.value === 'all') {
    return orders.value
  }
  return orders.value.filter((order) => order.status === statusFilter.value)
})

const openCount = computed(() => orders.value.filter((order) => order.status === 'open').length)
const closedCount = computed(() => orders.value.filter((order) => order.status === 'closed').length)

const loadOrders = async () => {
  loading.value = true
  error.value = ''

  try {
    orders.value = await dashboardApi.getOrders('all')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const formatDate = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatTime = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`

const orderLabel = (order) => {
  if (order.orderNumber) {
    return `#${order.orderNumber}`
  }
  const suffix = order.paypalOrderId?.slice(-6) || order._id?.slice(-6) || '000000'
  return `#${suffix.toUpperCase()}`
}

const addressesMatch = (order) => {
  const billing = order.billingAddress || {}
  const shipping = order.shippingAddress || {}
  return JSON.stringify(billing) === JSON.stringify(shipping)
}

const formatAddress = (address = {}) => {
  const lines = [
    address.name,
    address.address1,
    address.address2,
    [address.city, address.state, address.zip].filter(Boolean).join(', '),
    address.county ? address.county : null,
  ].filter(Boolean)

  return lines
}

const displayLineItems = (order) => {
  if (order.lineItems?.length) {
    return order.lineItems
  }

  return (order.items || []).map((item) => ({
    title: item.name,
    quantity: Number(item.quantity || 1),
    subtotal: Number(item.unit_amount?.value || item.unitAmount?.value || 0) * Number(item.quantity || 1),
    discountAmount: 0,
    discountPercentDisplay: '0%',
    taxAmount: 0,
    taxRateDisplay: '0%',
    lineTotal: Number(item.unit_amount?.value || item.unitAmount?.value || 0) * Number(item.quantity || 1),
  }))
}

const totalWithoutTax = (order) => {
  if (order.summary?.discountedTotal !== undefined) {
    return order.summary.discountedTotal
  }
  return Math.max(0, Number(order.summary?.subtotal || 0) - Number(order.summary?.discount || 0))
}

const taxBreakdown = (order) => order.tax?.breakdown || []

const updateStatus = async (order, status) => {
  savingOrderId.value = order._id

  try {
    const updated = await dashboardApi.updateOrderStatus(order._id, status)
    orders.value = orders.value.map((entry) => (
      entry._id === updated._id ? updated : entry
    ))
  } catch (err) {
    error.value = err.message
  } finally {
    savingOrderId.value = ''
  }
}

onMounted(loadOrders)
watch(
  () => route.fullPath,
  (path) => {
    if (path === '/dashboard/orders') {
      loadOrders()
    }
  },
)
</script>

<template>
  <div class="orders-page">
    <div class="page-header">
      <div>
        <h1>Orders</h1>
        <p class="page-subtitle">
          {{ openCount }} open · {{ closedCount }} closed
        </p>
      </div>
      <button type="button" class="refresh-btn" :disabled="loading" @click="loadOrders">
        Refresh
      </button>
    </div>

    <div class="filter-tabs">
      <button
        v-for="option in filterOptions"
        :key="option.value"
        type="button"
        class="filter-tab"
        :class="{ active: statusFilter === option.value }"
        @click="statusFilter = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <p v-if="error" class="error-banner">{{ error }}</p>
    <p v-if="loading" class="status-text">Loading orders...</p>
    <p v-else-if="!orders.length" class="status-text">
      No orders yet. Completed checkout orders will appear here after PayPal payment.
    </p>
    <p v-else-if="!filteredOrders.length" class="status-text">
      No {{ statusFilter }} orders found.
    </p>

    <div v-else class="orders-list">
      <details
        v-for="order in filteredOrders"
        :key="order._id"
        class="order-card"
        :open="order.status === 'open'"
      >
        <summary>
          <div class="order-summary">
            <div>
              <strong>{{ orderLabel(order) }}</strong><br>
              <span>{{ formatDate(order.createdAt) }}</span><br>
              <span>{{ order.customer?.email || 'No email' }}</span>
            </div>

            <div class="order-badges">
              <span class="badge" :class="order.status === 'open' ? 'badge-open' : 'badge-closed'">
                {{ order.status === 'open' ? 'OPEN' : 'CLOSED' }}
              </span>
              <span class="badge badge-paid">
                {{ formatMoney(order.summary?.finalTotal) }}
              </span>
            </div>
          </div>
        </summary>

        <div class="order-content">
          <section class="order-section">
            <h3>Customer Information</h3>

            <div class="info-grid">
              <div>
                <label>Email</label>
                <p>{{ order.customer?.email || '—' }}</p>
              </div>

              <div>
                <label>Phone</label>
                <p>{{ order.customer?.phone || '—' }}</p>
              </div>

              <div>
                <label>Customer Type</label>
                <p>{{ order.customer?.type || '—' }}</p>
              </div>
            </div>
          </section>

          <section class="order-section">
            <h3>Billing Address</h3>
            <p v-for="(line, index) in formatAddress(order.billingAddress)" :key="`billing-${index}`">
              {{ line }}
            </p>
          </section>

          <section class="order-section">
            <h3>Shipping Address</h3>
            <p v-if="addressesMatch(order)" class="same-address">
              Same as billing address
            </p>
            <template v-else>
              <p v-for="(line, index) in formatAddress(order.shippingAddress)" :key="`shipping-${index}`">
                {{ line }}
              </p>
            </template>
          </section>

          <section class="order-section">
            <h3>Order Items</h3>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Tax</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(line, index) in displayLineItems(order)" :key="`${order._id}-line-${index}`">
                  <td>{{ line.title }}</td>
                  <td>{{ line.quantity }}</td>
                  <td>{{ formatMoney(line.subtotal) }}</td>
                  <td>{{ line.discountPercentDisplay || '0%' }} ({{ formatMoney(line.discountAmount) }})</td>
                  <td>{{ line.taxRateDisplay || '0%' }} ({{ formatMoney(line.taxAmount) }})</td>
                  <td>{{ formatMoney(line.lineTotal) }}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="order-section">
            <h3>Totals</h3>

            <div class="totals">
              <div><span>Subtotal</span><span>{{ formatMoney(order.summary?.subtotal) }}</span></div>
              <div><span>Discount</span><span>-{{ formatMoney(order.summary?.discount) }}</span></div>
              <div><span>Total without tax</span><span>{{ formatMoney(totalWithoutTax(order)) }}</span></div>
              <div><span>Tax</span><span>{{ formatMoney(order.summary?.tax) }}</span></div>
              <div class="final-total">
                <span>Final Total</span>
                <span>{{ formatMoney(order.summary?.finalTotal) }}</span>
              </div>
            </div>
          </section>

          <section v-if="order.discountCode" class="order-section">
            <h3>Discount Code</h3>
            <p>{{ order.discountCode }}</p>
          </section>

          <section v-if="taxBreakdown(order).length" class="order-section">
            <h3>Tax Breakdown</h3>
            <p v-if="order.tax?.label">{{ order.tax.label }}</p>
            <ul>
              <li v-for="(row, index) in taxBreakdown(order)" :key="`${order._id}-tax-${index}`">
                {{ row.label }}: {{ row.rate }} ({{ formatMoney(row.amount) }})
              </li>
            </ul>
          </section>

          <section class="order-section">
            <h3>Order Timeline</h3>

            <div class="timeline">
              <div
                v-for="(entry, index) in order.timeline"
                :key="`${order._id}-timeline-${index}`"
              >
                {{ formatTime(entry.at) }} - {{ entry.label }}
              </div>
            </div>
          </section>

          <p v-if="order.paypalOrderId" class="paypal-id">
            PayPal order: {{ order.paypalOrderId }}
          </p>

          <div class="order-actions">
            <button
              v-if="order.status === 'open'"
              type="button"
              class="close-btn"
              :disabled="savingOrderId === order._id"
              @click="updateStatus(order, 'closed')"
            >
              Close Order
            </button>

            <button
              v-else
              type="button"
              class="reopen-btn"
              :disabled="savingOrderId === order._id"
              @click="updateStatus(order, 'open')"
            >
              Reopen Order
            </button>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<style scoped>
.orders-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-subtitle {
  color: #666;
  margin: 4px 0 0;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-tab {
  background: white;
  border: 1px solid #d8eadb;
  color: #1f7a3d;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
}

.filter-tab.active {
  background: #2ea44f;
  border-color: #2ea44f;
  color: white;
}

.refresh-btn {
  background: white;
  border: 1px solid #2ea44f;
  color: #2ea44f;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  border: 1px solid #dfe7df;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.order-card summary {
  padding: 18px;
  cursor: pointer;
  list-style: none;
}

.order-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.order-content {
  padding: 24px;
  border-top: 1px solid #eee;
}

.order-section {
  margin-bottom: 30px;
}

.order-section h3 {
  color: #2ea44f;
  margin-bottom: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  padding: 10px;
  border: 1px solid #ddd;
}

.totals {
  display: grid;
  gap: 10px;
  max-width: 420px;
}

.totals > div {
  display: flex;
  justify-content: space-between;
}

.final-total {
  font-weight: 700;
  padding-top: 8px;
  border-top: 1px solid #ddd;
}

.badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: .8rem;
}

.badge-paid {
  background: #e3f8e8;
}

.badge-open {
  background: #dff1ff;
}

.badge-closed {
  background: #ffe4e4;
}

.order-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.order-actions {
  display: flex;
  gap: 12px;
}

.close-btn,
.reopen-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: white;
}

.close-btn {
  background: #d9534f;
}

.reopen-btn {
  background: #2ea44f;
}

.same-address,
.status-text,
.paypal-id {
  color: #666;
}

.paypal-id {
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.error-banner {
  background: #ffe2e2;
  color: #8a1f1f;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
