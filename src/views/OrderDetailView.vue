<template>
  <div class="order-detail-page">
    <div class="page-header">
      <button class="btn btn-secondary" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
        返回
      </button>
      <h1 class="page-title">订单详情</h1>
    </div>
    
    <div v-if="loading" class="loading-state"><div class="spinner"></div></div>
    
    <template v-else-if="order">
      <div class="grid grid-cols-2">
        <!-- 基本信息 -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">基本信息</h3>
            <span :class="['badge', getStatusBadge(order.status)]">{{ getStatusText(order.status) }}</span>
          </div>
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">订单ID</span>
                <span class="info-value"><code>{{ order.id }}</code></span>
              </div>
              <div class="info-item">
                <span class="info-label">交易对</span>
                <span class="info-value">{{ order.symbol }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">方向</span>
                <span class="info-value" :class="order.direction === 'BUY' ? 'text-success' : 'text-danger'">
                  {{ order.direction === 'BUY' ? '买入' : '卖出' }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">数量</span>
                <span class="info-value">{{ formatNumber(order.quantity) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">创建时间</span>
                <span class="info-value">{{ formatDateTime(order.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">更新时间</span>
                <span class="info-value">{{ formatDateTime(order.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 价格信息 -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">价格信息</h3>
          </div>
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">开仓价格</span>
                <span class="info-value">{{ formatCurrency(order.openPrice) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">当前/平仓价</span>
                <span class="info-value">{{ formatCurrency(order.currentPrice || order.closePrice) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">止损价</span>
                <span class="info-value">{{ order.stopLoss ? formatCurrency(order.stopLoss) : '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">止盈价</span>
                <span class="info-value">{{ order.takeProfit ? formatCurrency(order.takeProfit) : '-' }}</span>
              </div>
              <div class="info-item highlight">
                <span class="info-label">盈亏</span>
                <span class="info-value" :class="getValueColorClass(order.profit)">
                  {{ formatCurrency(order.profit) }} ({{ formatPercent(order.profitPercent) }})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 关联新闻 -->
      <div class="card mt-6">
        <div class="card-header">
          <h3 class="card-title">关联新闻</h3>
        </div>
        <div class="card-body">
          <div v-if="relatedNews.length === 0" class="empty-state">
            <p class="empty-state-text">暂无关联新闻</p>
          </div>
          <div v-else class="news-list">
            <div v-for="news in relatedNews" :key="news.id" class="news-item">
              <div class="news-header">
                <span :class="['badge', getImpactBadge(news.impact)]">{{ news.impact }}</span>
                <span class="news-time">{{ formatDateTime(news.publishedAt) }}</span>
              </div>
              <h4 class="news-title">{{ news.title }}</h4>
              <p class="news-summary">{{ news.summary }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="card mt-6" v-if="order.status === 'OPEN' || order.status === 'PENDING'">
        <div class="card-body">
          <div class="action-buttons">
            <button v-if="order.status === 'OPEN'" class="btn btn-danger" @click="handleClose">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              平仓
            </button>
            <button v-if="order.status === 'PENDING'" class="btn btn-secondary" @click="handleCancel">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              取消订单
            </button>
          </div>
        </div>
      </div>
    </template>
    
    <div v-else class="empty-state">
      <p class="empty-state-title">订单不存在</p>
      <button class="btn btn-primary" @click="goBack">返回订单列表</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useNewsStore } from '@/stores/news'
import { useAlertStore } from '@/stores/alert'
import { formatNumber, formatCurrency, formatDateTime, formatPercent, getValueColorClass } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()
const newsStore = useNewsStore()
const alertStore = useAlertStore()

const loading = ref(true)
const relatedNews = ref([])

const order = computed(() => ordersStore.currentOrder)

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

function goBack() {
  router.push('/orders')
}

async function handleClose() {
  if (!confirm('确定要平仓此订单吗？')) return
  const result = await ordersStore.closeOrder(order.value.id)
  if (result.success) alertStore.success('平仓成功')
  else alertStore.error(result.message || '平仓失败')
}

async function handleCancel() {
  if (!confirm('确定要取消此订单吗？')) return
  const result = await ordersStore.cancelOrder(order.value.id)
  if (result.success) alertStore.success('取消成功')
  else alertStore.error(result.message || '取消失败')
}

onMounted(async () => {
  const orderId = route.params.id
  try {
    await ordersStore.fetchOrderDetail(orderId)
    const newsResult = await newsStore.fetchRelatedNews(orderId)
    if (newsResult.success) relatedNews.value = newsResult.data || []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.order-detail-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.loading-state { display: flex; justify-content: center; padding: 3rem; }
.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.info-item { display: flex; flex-direction: column; gap: 0.25rem; }
.info-item.highlight { background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); grid-column: span 2; }
.info-label { font-size: 0.8125rem; color: var(--text-secondary); }
.info-value { font-size: 1rem; font-weight: 500; color: var(--text-primary); }
code { background: var(--bg-tertiary); padding: 0.125rem 0.5rem; border-radius: 4px; font-size: 0.875rem; }
.news-list { display: flex; flex-direction: column; gap: 1rem; }
.news-item { padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-md); }
.news-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.news-time { font-size: 0.75rem; color: var(--text-muted); }
.news-title { font-size: 1rem; font-weight: 500; margin-bottom: 0.5rem; }
.news-summary { font-size: 0.875rem; color: var(--text-secondary); }
.action-buttons { display: flex; gap: 1rem; }
.text-success { color: var(--success-color); }
.text-danger { color: var(--danger-color); }
@media (max-width: 768px) { .info-grid { grid-template-columns: 1fr; } .info-item.highlight { grid-column: span 1; } }
</style>