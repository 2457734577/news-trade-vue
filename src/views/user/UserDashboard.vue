<template>
  <div class="user-dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">👋 欢迎回来，{{ authStore.userName }}！</h1>
        <p class="page-subtitle">{{ getCurrentGreeting() }}</p>
      </div>
      <div class="header-actions">
        <button @click="refreshAllAssets" class="btn btn-primary" :disabled="assetsStore.loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          {{ assetsStore.loading ? '刷新中...' : '刷新资产' }}
        </button>
      </div>
    </div>

    <!-- 资产概览统计卡片 -->
    <div class="asset-overview">
      <div class="overview-card overview-card-total">
        <div class="overview-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-label">总资产</div>
          <div class="overview-value">${{ formatCurrency(assetsStore.totalAssets) }}</div>
          <div class="overview-change positive">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
            +{{ formatPercentage(dailyChange) }}%
          </div>
        </div>
      </div>

      <div class="overview-card overview-card-spot">
        <div class="overview-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-label">现货总额</div>
          <div class="overview-value">${{ formatCurrency(assetsStore.totalSpotBalance) }}</div>
          <div class="overview-desc">{{ assetsStore.accounts.length }} 个账户</div>
        </div>
      </div>

      <div class="overview-card overview-card-futures">
        <div class="overview-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-label">合约总额</div>
          <div class="overview-value">${{ formatCurrency(assetsStore.totalFuturesBalance) }}</div>
          <div 
            class="overview-desc"
            :class="assetsStore.totalUnrealizedPnl >= 0 ? 'positive' : 'negative'"
          >
            未实现盈亏: {{ assetsStore.totalUnrealizedPnl >= 0 ? '+' : '' }}${{ formatCurrency(assetsStore.totalUnrealizedPnl) }}
          </div>
        </div>
      </div>

      <div class="overview-card overview-card-funding">
        <div class="overview-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M7 15h0M2 9.5h20"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-label">资金账户</div>
          <div class="overview-value">${{ formatCurrency(assetsStore.totalFundingBalance) }}</div>
          <div class="overview-desc">可用资金</div>
        </div>
      </div>
    </div>

    <!-- 按交易所分组的资产卡片 -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">📊 交易所资产</h2>
        <router-link to="/user/assets" class="btn btn-sm btn-secondary">查看详情</router-link>
      </div>

      <!-- 加载状态 -->
      <div v-if="assetsStore.loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载资产数据中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="assetsStore.error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p class="error-message">{{ assetsStore.error }}</p>
        <button @click="refreshAllAssets" class="btn btn-secondary">重试</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="assetsStore.accounts.length === 0" class="empty-state">
        <div class="empty-icon">💼</div>
        <h3>暂无交易所账户</h3>
        <p>添加您的第一个交易所账户开始交易</p>
        <router-link to="/user/accounts/add" class="btn btn-primary">添加账户</router-link>
      </div>

      <!-- 资产卡片列表 -->
      <div v-else class="assets-grid">
        <template v-for="(accounts, exchangeType) in assetsStore.assetsByExchange" :key="exchangeType">
          <AssetCard
            v-for="account in accounts"
            :key="account.accountId"
            :account="account"
            :exchangeType="exchangeType"
          />
        </template>
      </div>
    </div>

    <!-- 最近订单和新闻 -->
    <div class="dashboard-grid">
      <!-- 最近订单 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📋 最近订单</h3>
          <router-link to="/user/orders" class="btn btn-sm btn-secondary">查看全部</router-link>
        </div>
        <div class="card-body">
          <div v-if="ordersLoading" class="loading-state">
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
          <h3 class="card-title">📰 最新新闻</h3>
          <router-link to="/user/news" class="btn btn-sm btn-secondary">查看全部</router-link>
        </div>
        <div class="card-body">
          <div v-if="newsLoading" class="loading-state">
            <div class="spinner"></div>
          </div>
          <div v-else-if="recentNews.length === 0" class="empty-state">
            <div class="empty-state-icon">📰</div>
            <p class="empty-state-title">暂无新闻</p>
            <p class="empty-state-text">新闻将在这里显示</p>
          </div>
          <div v-else class="news-list">
            <div v-for="news in recentNews" :key="news.id" class="news-item">
              <div class="news-content">
                <div class="news-header">
                  <span :class="['sentiment-badge', `sentiment-${news.sentiment?.toLowerCase()}`]">
                    {{ getSentimentText(news.sentiment) }}
                  </span>
                  <span class="news-source">{{ news.source }}</span>
                </div>
                <p class="news-title">{{ news.title }}</p>
                <div class="news-meta">
                  <span class="news-symbol">{{ news.symbol }}</span>
                  <span class="news-time">{{ formatTime(news.publishTime) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最后更新时间 -->
    <div v-if="assetsStore.lastUpdate" class="last-update">
      最后更新: {{ formatDateTime(assetsStore.lastUpdate) }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAssetsStore } from '@/stores/assets'
import { useOrdersStore } from '@/stores/orders'
import { useNewsStore } from '@/stores/news'
import AssetCard from '@/components/assets/AssetCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const assetsStore = useAssetsStore()
const ordersStore = useOrdersStore()
const newsStore = useNewsStore()

// 状态
const ordersLoading = ref(false)
const newsLoading = ref(false)
const recentOrders = ref([])
const recentNews = ref([])
const dailyChange = ref(2.34) // 模拟数据，实际应从后端获取

// 方法

/**
 * 获取当前问候语
 */
function getCurrentGreeting() {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了，注意休息 🌙'
  if (hour < 12) return '早上好！新的一天开始了 ☀️'
  if (hour < 18) return '下午好！继续加油 💪'
  return '晚上好！辛苦了一天 🌆'
}

/**
 * 刷新所有资产
 */
async function refreshAllAssets() {
  await assetsStore.refreshAssets()
}

/**
 * 格式化货币
 */
function formatCurrency(value) {
  if (value === undefined || value === null) return '0.00'
  return Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化百分比
 */
function formatPercentage(value) {
  if (value === undefined || value === null) return '0.00'
  return Number(value).toFixed(2)
}

/**
 * 格式化时间
 */
function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

/**
 * 格式化日期时间
 */
function formatDateTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 获取订单状态徽章样式
 */
function getStatusBadge(status) {
  const badges = {
    'OPEN': 'badge-warning',
    'CLOSED': 'badge-success',
    'CANCELLED': 'badge-secondary',
    'FAILED': 'badge-danger'
  }
  return badges[status] || 'badge-secondary'
}

/**
 * 获取订单状态文本
 */
function getStatusText(status) {
  const texts = {
    'OPEN': '进行中',
    'CLOSED': '已完成',
    'CANCELLED': '已取消',
    'FAILED': '失败'
  }
  return texts[status] || status
}

/**
 * 获取情绪文本
 */
function getSentimentText(sentiment) {
  const texts = {
    'BULLISH': '看涨',
    'BEARISH': '看跌',
    'NEUTRAL': '中性'
  }
  return texts[sentiment] || sentiment
}

/**
 * 跳转到订单详情
 */
function goToOrder(orderId) {
  router.push(`/user/orders/${orderId}`)
}

/**
 * 加载最近订单
 */
async function loadRecentOrders() {
  ordersLoading.value = true
  try {
    // 使用API获取最近订单
    const result = await ordersStore.fetchOrders({ page: 0, size: 5 })
    if (result.success) {
      recentOrders.value = result.data.content || []
    }
  } catch (error) {
    console.error('加载订单失败:', error)
  } finally {
    ordersLoading.value = false
  }
}

/**
 * 加载最新新闻
 */
async function loadRecentNews() {
  newsLoading.value = true
  try {
    const result = await newsStore.fetchNews({ page: 0, size: 5 })
    if (result.success) {
      recentNews.value = result.data.content || []
    }
  } catch (error) {
    console.error('加载新闻失败:', error)
  } finally {
    newsLoading.value = false
  }
}

// 初始化
onMounted(() => {
  // 加载资产数据 - 使用新的API方法名
  assetsStore.fetchBalances()
  
  // 加载最近订单
  loadRecentOrders()
  
  // 加载最新新闻
  loadRecentNews()
})
</script>

<style scoped>
/* 样式与之前相同，省略... */
/* 完整样式请参考之前创建的 UserDashboard.vue */

.user-dashboard {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #718096;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 资产概览 */
.asset-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.overview-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 16px;
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.overview-card-total .overview-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.overview-card-spot .overview-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.overview-card-futures .overview-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.overview-card-funding .overview-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.overview-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.overview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.overview-label {
  font-size: 14px;
  color: #718096;
}

.overview-value {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
}

.overview-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
}

.overview-change.positive { color: #48bb78; }
.overview-change.negative { color: #f56565; }

.overview-desc {
  font-size: 12px;
  color: #a0aec0;
}

.overview-desc.positive { color: #48bb78; }
.overview-desc.negative { color: #f56565; }

/* 其余样式与之前相同... */
.section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f7fafc;
  border-color: #667eea;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.loading-state,
.empty-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.last-update {
  text-align: center;
  font-size: 12px;
  color: #a0aec0;
  padding: 16px 0;
}

@media (max-width: 1200px) {
  .asset-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .user-dashboard {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .asset-overview {
    grid-template-columns: 1fr;
  }
  
  .assets-grid {
    grid-template-columns: 1fr;
  }
}
</style>