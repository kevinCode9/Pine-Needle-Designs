<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

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
</script>

<template>
  <div class="dashboard-layout">
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
    </aside>

    <main class="content">
      <RouterView />
    </main>
  </div>
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

.content {
  flex: 1;
  padding: 24px;
}
</style>