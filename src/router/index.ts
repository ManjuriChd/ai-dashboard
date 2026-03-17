import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/DashboardView.vue'

/** Vue Router: single route for the dashboard (SPA). */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { title: 'AI Market Intelligence' },
    },
  ],
})

router.afterEach((to) => {
  const title = (to.meta?.title as string) || 'AI Market Intelligence'
  document.title = title
})

export default router
