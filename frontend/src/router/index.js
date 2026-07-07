import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CollectionsView from '../views/CollectionsView.vue'
import CollectionView from '../views/CollectionView.vue'
import StaticPageView from '../views/StaticPageView.vue'
import NotFoundView from '../../404View.vue'
import OrderSuccessView from '../views/OrderSuccessView.vue'
import BookingDepositView from '../views/BookingDepositView.vue'
import BookingPaymentSuccessView from '../views/BookingPaymentSuccessView.vue'
import DashboardView from '../views/DashboardView.vue'

import DashboardHome from '../components/dashboard/DashboardHome.vue'
import DashboardItems from '../components/dashboard/DashboardItems.vue'
import DashboardOrders from '../components/dashboard/DashboardOrders.vue'

import { collectionPages, sitePages } from '../data/siteData'
import DashboardItemCreation from '../components/dashboard/DashboardItemCreation.vue'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    alias: ['/index.html'],
  },
  {
    path: '/collections',
    name: 'Collections',
    component: CollectionsView,
    alias: ['/collections.html'],
  },

  ...collectionPages.map((page) => ({
    path: `/collections/${page.slug}`,
    name: `collection-${page.slug}`,
    component: CollectionView,
    props: { slug: page.slug },
    alias: [`/${page.slug}.html`],
    meta: { scrollTarget: '.products-header', scrollOffset: 190 },
  })),

  ...sitePages.map((page) => ({
    path: page.path,
    name: `page-${page.slug}`,
    component: StaticPageView,
    props: { slug: page.slug },
    alias: [`/${page.slug}.html`],
  })),

  {
    path: '/dashboard',
    component: DashboardView,
    meta: {
      dashboard: true,
      hideLayout: true,
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'DashboardHome',
        component: DashboardHome,
      },
      {
        path: 'items',
        name: 'DashboardItems',
        component: DashboardItems,
      },
      {
        path: 'orders',
        name: 'DashboardOrders',
        component: DashboardOrders,
      },
      {
        path: 'create',
        name: 'DashboardItemCreation',
        component: DashboardItemCreation,
      },
    ],
  },

  {
    path: '/order-success',
    name: 'OrderSuccess',
    component: OrderSuccessView,
  },

  {
    path: '/booking/:service(fitting|brides)',
    name: 'BookingDeposit',
    component: BookingDepositView,
    props: true,
  },

  {
    path: '/booking-payment-success',
    name: 'BookingPaymentSuccess',
    component: BookingPaymentSuccessView,
  },

  {
    path: '/404.html',
    name: 'NotFound',
    component: NotFoundView,
    meta: { hideLayout: true },
  },

  {
    path: '/:catchAll(.*)',
    name: 'CatchAll',
    component: NotFoundView,
    meta: { hideLayout: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,

  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        top: 0,
        left: 0,
        behavior: 'instant',
      }
    }

    if (to.meta.scrollTarget) {
      return {
        el: to.meta.scrollTarget,
        top: to.meta.scrollOffset || 0,
        left: 0,
        behavior: 'instant',
      }
    }

    return {
      top: 0,
      left: 0,
      behavior: 'instant',
    }
  },
})

router.beforeEach(async (to) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (!requiresAuth) {
    return true
  }

  const authStore = useAuthStore()
  const isAuthed = await authStore.verifySession()

  if (!isAuthed) {
    authStore.openLoginDialog(to.fullPath)

    return {
      path: '/',
      query: { redirect: to.fullPath },
      hash: '#dashboard-signin',
    }
  }

  return true
})

export default router
