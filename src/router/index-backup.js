import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { requiresAuth: false, title: '注册' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true, title: '仪表盘' }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/OrdersView.vue'),
    meta: { requiresAuth: true, title: '订单列表' }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetailView.vue'),
    meta: { requiresAuth: true, title: '订单详情' }
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('@/views/NewsView.vue'),
    meta: { requiresAuth: true, title: '新闻监控' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true, title: '系统配置' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true, title: '个人中心' }
  },
  {
    path: '/accounts',
    name: 'Accounts',
    component: () => import('@/views/AccountsView.vue'),
    meta: { requiresAuth: true, title: '账户管理' }
  },
  {
    path: '/accounts/add',
    name: 'AddAccount',
    component: () => import('@/views/AddAccountView.vue'),
    meta: { requiresAuth: true, title: '添加账户' }
  },
  {
    path: '/rules',
    name: 'Rules',
    component: () => import('@/views/RulesView.vue'),
    meta: { requiresAuth: true, title: '策略配置' }
  },
  {
    path: '/backtest',
    name: 'Backtest',
    component: () => import('@/views/NewsBacktestView.vue'),
    meta: { requiresAuth: true, title: '新闻回测' }
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('@/views/LogsView.vue'),
    meta: { requiresAuth: true, title: '系统日志' }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('@/views/AnalyticsView.vue'),
    meta: { requiresAuth: true, title: '数据分析' }
  },
  {
    path: '/news-history',
    name: 'NewsHistory',
    component: () => import('@/views/NewsHistoryView.vue'),
    meta: { requiresAuth: true, title: '历史新闻' }
  },
  {
    path: '/kline',
    name: 'KlineData',
    component: () => import('@/views/KlineDataView.vue'),
    meta: { requiresAuth: true, title: 'K线数据' }
  },
  {
     path: '/import',
     name: 'TelegramImport',
     component: () => import('@/views/TelegramImport.vue'),
     meta: { title: '导入历史新闻' }
   },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '页面未找到' }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title 
    ? `${to.meta.title} - News Trade` 
    : 'News Trade'
  
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth !== false
  
  if (requiresAuth && !authStore.isLoggedIn) {
    // 需要登录但未登录
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (!requiresAuth && authStore.isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    // 已登录访问登录/注册页
    next('/dashboard')
  } else {
    next()
  }
})

export default router