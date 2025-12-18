<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">仪表盘</h1>
      <p class="page-subtitle">欢迎回来，{{ authStore.userName }}！查看您的交易概览</p>
    </div>
    
    <!-- 统计卡片 -->
    <div class="grid grid-cols-4">
      <div class="stat-card">
        <div class="stat-icon stat-icon-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalOrders }}</div>
          <div class="stat-label">总订单数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon stat-icon-success">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(stats.totalProfit) }}</div>
          <div class="stat-label">总盈亏</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon stat-icon-warning">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.activeOrders }}</div>
          <div class="stat-label">活跃订单</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon stat-icon-danger">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.newsCount }}</div>
          <div class="stat-label">今日新闻</div>
        </div>
      </div>
    </div>
    
    <!-- 主要内容 -->
    <div class="dashboard-grid">
      <!-- 最近订单 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">最近订单</h3>
          <router-link to="/orders" class="btn btn-sm btn-secondary">查看全部</router-link>
        </div>
        <div class="card-body">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
          </div>
          <div v-else-if="recentOrders.length === 0" class="empty-state">
            <div class="empty-state-icon">📋</div>
            <p class="empty-state-title">暂无订单</p>
            <p class="empty-state-text">开始您的第一笔交易吧</p>
          </div>
          <div v-else class="order-list">
            <div v-for="order in recentOrders" :key="order.id" class="order-item" @click="goToOrder(order.id)">
              <div class="order-info">
                <span class="order-symbol">{{ order.symbol }}</span>
                <span class="order-direction" :class="order.direction === 'BUY' ? 'text-success' : 'text-danger'">
                  {{ order.direction === 'BUY' ? '买入' : '卖出' }}
                </span>
              </div>
              <div class="order-details">
                <span class="order-quantity">{{ order.quantity }}</span>
                <span :class="['badge', getStatusBadge(order.status)]">{{ getStatusText(order.status) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 最新新闻 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">最新新闻</h3>
          <router-link to="/news" class="btn btn-sm btn-secondary">查看全部</router-link>
        </div>
        <div class="card-body">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
          </div>
          <div v-else-if="recentNews.length === 0" class="empty-state">
            <div class="empty-state-icon">📰</div>
            <p class="empty-state-title">暂无新闻</p>
            <p class="empty-state-text">新闻将在这里显示</p>
          </div>
          <div v-else class="news-list">
            <div v-for="news in recentNews" :key="news.id" class="news-item">
              <div class="news-header">
                <span :class="['badge', getImpactBadge(news.impact)]">{{ news.impact }}</span>
                <span class="news-time">{{ formatRelativeTime(news.publishedAt) }}</span>
              </div>
              <h4 class="news-title">{{ news.title }}</h4>
              <p class="news-source">{{ news.source }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快捷操作 -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">快捷操作</h3>
      </div>
      <div class="card-body">
        <div class="quick-actions">
          <router-link to="/orders" class="quick-action">
            <div class="quick-action-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
            </div>
            <span>订单管理</span>
          </router-link>
          <router-link to="/news" class="quick-action">
            <div class="quick-action-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
            </div>
            <span>新闻监控</span>
          </router-link>
          <router-link to="/accounts/add" class="quick-action">
            <div class="quick-action-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            </div>
            <span>添加账户</span>
          </router-link>
          <router-link to="/settings" class="quick-action">
            <div class="quick-action-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <span>系统设置</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrdersStore } from '@/stores/orders'
import { useNewsStore } from '@/stores/news'
import { formatCurrency, formatRelativeTime } from '@/utils/format'

const router = useRouter()
const authStore = useAuthStore()
const ordersStore = useOrdersStore()
const newsStore = useNewsStore()

const loading = ref(true)
const stats = reactive({ totalOrders: 0, totalProfit: 0, activeOrders: 0, newsCount: 0 })
const recentOrders = ref([])
const recentNews = ref([])

function getStatusBadge(status) {
  const map = { PENDING: 'badge-warning', OPEN: 'badge-info', CLOSED: 'badge-success', CANCELLED: 'badge-secondary' }
  return map[status] || 'badge-secondary'
}

function getStatusText(status) {
  const map = { PENDING: '待执行', OPEN: '持仓中', CLOSED: '已平仓', CANCELLED: '已取消' }
  return map[status] || status
}

function getImpactBadge(impact) {
  const map = { HIGH: 'badge-danger', MEDIUM: 'badge-warning', LOW: 'badge-info' }
  return map[impact] || 'badge-secondary'
}

function goToOrder(id) {
  router.push(`/orders/${id}`)
}

onMounted(async () => {
  try {
    await Promise.all([ordersStore.fetchOrders({ pageSize: 5 }), newsStore.fetchNews({ pageSize: 5 })])
    recentOrders.value = ordersStore.orders.slice(0, 5)
    recentNews.value = newsStore.newsList.slice(0, 5)
    stats.totalOrders = ordersStore.pagination.total || ordersStore.orders.length
    stats.activeOrders = ordersStore.activeOrders.length
    stats.newsCount = newsStore.pagination.total || newsStore.newsList.length
    stats.totalProfit = ordersStore.orders.reduce((sum, o) => sum + (o.profit || 0), 0)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard { max-width: 1400px; margin: 0 auto; }
.dashboard-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-top: 1.5rem; }
.loading-state { display: flex; justify-content: center; padding: 2rem; }
.order-list, .news-list { display: flex; flex-direction: column; gap: 0.75rem; }
.order-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--bg-tertiary); border-radius: var(--radius-md); cursor: pointer; transition: background var(--transition-fast); }
.order-item:hover { background: var(--border-light); }
.order-info { display: flex; align-items: center; gap: 0.75rem; }
.order-symbol { font-weight: 600; color: var(--text-primary); }
.order-direction { font-size: 0.8125rem; font-weight: 500; }
.order-details { display: flex; align-items: center; gap: 0.75rem; }
.order-quantity { font-size: 0.875rem; color: var(--text-secondary); }
.news-item { padding: 0.75rem; background: var(--bg-tertiary); border-radius: var(--radius-md); }
.news-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.news-time { font-size: 0.75rem; color: var(--text-muted); }
.news-title { font-size: 0.9375rem; font-weight: 500; color: var(--text-primary); margin-bottom: 0.25rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.news-source { font-size: 0.8125rem; color: var(--text-secondary); }
.quick-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.quick-action { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 1.5rem; background: var(--bg-tertiary); border-radius: var(--radius-lg); transition: all var(--transition-fast); text-decoration: none; color: var(--text-primary); }
.quick-action:hover { background: var(--border-light); transform: translateY(-2px); }
.quick-action-icon { width: 48px; height: 48px; background: var(--primary-gradient); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: white; }
.text-success { color: var(--success-color); }
.text-danger { color: var(--danger-color); }
@media (max-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr; } .quick-actions { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .quick-actions { grid-template-columns: 1fr; } }
</style>