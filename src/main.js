import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'

const app = createApp(App)

// 状态管理
const pinia = createPinia()
app.use(pinia)

// 路由
app.use(router)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Component:', instance)
  console.error('Error info:', info)
}

// 挂载
app.mount('#app')