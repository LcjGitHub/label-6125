import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

router.isReady().then(() => {
  const route = router.currentRoute.value
  const title = (route.meta.title as string) ?? '十二平均律'
  document.title = `${title} · 十二平均律`
  app.mount('#app')
})
