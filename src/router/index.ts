import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'piano',
      component: () => import('@/views/PianoView.vue'),
      meta: { title: '钢琴键盘' },
    },
    {
      path: '/interval',
      name: 'interval',
      component: () => import('@/views/IntervalView.vue'),
      meta: { title: '音程计算' },
    },
    {
      path: '/反查',
      name: 'reverse',
      component: () => import('@/views/ReverseLookupView.vue'),
      meta: { title: '反查' },
    },
    {
      path: '/设置',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { title: '设置' },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const decodedPath = decodeURIComponent(to.path)
  if (decodedPath !== to.path) {
    next({ ...to, path: decodedPath, replace: true })
    return
  }
  next()
})

router.afterEach((to) => {
  const title = (to.meta.title as string) ?? '十二平均律'
  document.title = `${title} · 十二平均律`
})

if (router.currentRoute.value.name == null) {
  const initialPath = decodeURIComponent(window.location.pathname)
  if (initialPath !== router.currentRoute.value.path) {
    router.replace(initialPath)
  }
}

export default router
