import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// ======================
// 公共路由
// ======================
const publicRoutes = [
  {
    path: '/',
    redirect: '/user/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false, title: '用户登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { requiresAuth: false, title: '用户注册' }
  }
]

// ======================
// 用户路由
// ======================
const userRoutes = [
  {
    path: '/user',
    redirect: '/user/dashboard',
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/user/dashboard',
    name: 'UserDashboard',
    component: () => import('@/views/user/UserDashboard.vue'),
    meta: { requiresAuth: true, role: 'user', title: '用户仪表盘' }
  },
  {
    path: '/user/assets',
    name: 'UserAssets',
    component: () => import('@/views/user/AssetsView.vue'),
    meta: { requiresAuth: true, role: 'user', title: '资产管理' }
  },
  {
    path: '/user/accounts',
    name: 'UserAccounts',
    component: () => import('@/views/AccountsView.vue'),
    meta: { requiresAuth: true, role: 'user', title: '账户管理' }
  },
  {
    path: '/user/accounts/add',
    name: 'UserAddAccount',
    component: () => import('@/views/AddAccountView.vue'),
    meta: { requiresAuth: true, role: 'user', title: '添加账户' }
  },
  {
    path: '/user/orders',
    name: 'UserOrders',
    component: () => import('@/views/OrdersView.vue'),
    meta: { requiresAuth: true, role: 'user', title: '订单列表' }
  },
  {
    path: '/user/orders/:id',
    name: 'UserOrderDetail',
    component: () => import('@/views/OrderDetailView.vue'),
    meta: { requiresAuth: true, role: 'user', title: '订单详情' }
  },
  {
    path: '/user/news',
    name: 'UserNews',
    component: () => import('@/views/NewsView.vue'),
    meta: { requiresAuth: true, role: 'user', title: '新闻监控' }
  },
  {
    path: '/user/rules',
    name: 'UserRules',
    component: () => import('@/views/RulesView.vue'),
    meta: { requiresAuth: true, role: 'user', title: '策略配置' }
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true, role: 'user', title: '个人中心' }
  },
  {
    path: '/user/support',
    name: 'UserSupport',
    component: () => import('@/views/user/SupportView.vue'),
    meta: { requiresAuth: true, role: 'user', title: '联系客服' }
  }
]

// ======================
// 管理员路由
// ======================
const adminRoutes = [
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/AdminLogin.vue'),
    meta: { requiresAuth: false, title: '管理员登录' }
  },
  {
    path: '/admin',
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, role: 'admin', title: '管理后台' }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/views/admin/UsersManagement.vue'),
    meta: { requiresAuth: true, role: 'admin', title: '用户管理' }
  },
  {
    path: '/admin/system',
    name: 'AdminSystem',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true, role: 'admin', title: '系统配置' }
  },
  {
    path: '/admin/logs',
    name: 'AdminLogs',
    component: () => import('@/views/LogsView.vue'),
    meta: { requiresAuth: true, role: 'admin', title: '系统日志' }
  },
  {
    path: '/admin/analytics',
    name: 'AdminAnalytics',
    component: () => import('@/views/AnalyticsView.vue'),
    meta: { requiresAuth: true, role: 'admin', title: '数据分析' }
  },
  {
    path: '/admin/backtest',
    name: 'AdminBacktest',
    component: () => import('@/views/NewsBacktestView.vue'),
    meta: { requiresAuth: true, role: 'admin', title: '新闻回测' }
  },
  {
    path: '/admin/news-history',
    name: 'AdminNewsHistory',
    component: () => import('@/views/NewsHistoryView.vue'),
    meta: { requiresAuth: true, role: 'admin', title: '历史新闻' }
  },
  {
    path: '/admin/kline',
    name: 'AdminKlineData',
    component: () => import('@/views/KlineDataView.vue'),
    meta: { requiresAuth: true, role: 'admin', title: 'K线数据' }
  },
  {
    path: '/admin/import',
    name: 'AdminTelegramImport',
    component: () => import('@/views/TelegramImport.vue'),
    meta: { requiresAuth: true, role: 'admin', title: '导入历史新闻' }
  },
  {
    path: '/admin/support',
    name: 'AdminSupport',
    component: () => import('@/views/admin/SupportManagement.vue'),
    meta: { requiresAuth: true, role: 'admin', title: '客服管理' }
  }
]

// ======================
// 404路由
// ======================
const notFoundRoute = {
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('@/views/NotFoundView.vue'),
  meta: { title: '页面未找到' }
}

// 合并所有路由
const routes = [
  ...publicRoutes,
  ...userRoutes,
  ...adminRoutes,
  notFoundRoute
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
  document.title = to.meta.title 
    ? `${to.meta.title} - News Trade` 
    : 'News Trade'
  
  const authStore = useAuthStore()
  
  if (!authStore.token && localStorage.getItem('token')) {
    authStore.init()
  }
  
  const requiresAuth = to.meta.requiresAuth !== false
  const requiredRole = to.meta.role
  
  if (requiresAuth && !authStore.isLoggedIn) {
    const loginPath = requiredRole === 'admin' ? '/admin/login' : '/login'
    return next({
      path: loginPath,
      query: { redirect: to.fullPath }
    })
  }
  
  if (requiresAuth && requiredRole) {
    if (requiredRole === 'admin' && !authStore.isAdmin) {
      return next('/user/dashboard')
    }
    
    if (requiredRole === 'user' && authStore.isAdmin) {
      return next('/admin/dashboard')
    }
  }
  
  if (!requiresAuth && authStore.isLoggedIn) {
    if (to.path === '/login' || to.path === '/register') {
      return next(authStore.isAdmin ? '/admin/dashboard' : '/user/dashboard')
    }
    if (to.path === '/admin/login') {
      return next(authStore.isAdmin ? '/admin/dashboard' : '/user/dashboard')
    }
  }
  
  next()
})

export default router