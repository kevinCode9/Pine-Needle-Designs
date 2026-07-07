<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const authReady = ref(false)

const menuItems = [
  {
    label: 'Home',
    to: '/dashboard',
  },
  {
    label: 'Items',
    to: '/dashboard/items',
  },
  {
    label: 'Orders',
    to: '/dashboard/orders',
  },
]

const isActive = (path) => {
  if (path === '/dashboard') {
    return route.path === '/dashboard'
  }

  return route.path.startsWith(path)
}

const handleLogout = async () => {
  await authStore.logout()
  await router.push('/')
}

onMounted(async () => {
  const isAuthed = await authStore.verifySession()

  if (!isAuthed) {
    authStore.openLoginDialog(route.fullPath)

    await router.replace({
      path: '/',
      query: { redirect: route.fullPath },
      hash: '#dashboard-signin',
    })
    return
  }

  authReady.value = true
})
</script>

<template>
  <div v-if="authReady" class="dashboard-layout">
    <aside class="sidebar">
      <h2 class="logo">Dashboard</h2>

      <RouterLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="sidebar-btn"
        :class="{ active: isActive(item.to) }"
      >
        {{ item.label }}
      </RouterLink>

      <div class="sidebar-footer">
        <p v-if="authStore.user?.email" class="user-email">{{ authStore.user.email }}</p>
        <button type="button" class="logout-btn" @click="handleLogout">
          Sign Out
        </button>
      </div>
    </aside>

    <main class="content">
      <RouterView />
    </main>
  </div>
  <p v-else class="dashboard-loading">Checking access...</p>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  padding: 24px;
  border-right: 1px solid #ddd;

  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 100vh;
}

.logo {
  margin-bottom: 20px;
}

.sidebar-btn {
  display: block;
  padding: 12px;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
}

.sidebar-btn.active {
  font-weight: 600;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
}

.user-email {
  margin: 0 0 12px;
  font-size: 0.85rem;
  color: #666;
  word-break: break-word;
}

.logout-btn {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.logout-btn:hover {
  background: #f7f7f7;
}

.content {
  flex: 1;
  padding: 24px;
}

.dashboard-loading {
  min-height: 100vh;
  display: grid;
  place-items: center;
  margin: 0;
  color: #666;
}
</style>