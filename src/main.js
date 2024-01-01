import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueFire, VueFireAuth } from 'vuefire'
import { firebaseApp } from '@/firebase'
import { veeValidatePlugin } from './plugins/vee-validate'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(VueFire, {
  // imported above but could also just be created here
  firebaseApp,
  modules: [VueFireAuth()]
})

app.use(createPinia())
app.use(router)
app.use(veeValidatePlugin)

app.mount('#app')
