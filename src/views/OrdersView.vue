 
<template>
  <div class="orders-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">订单列表</h1>
        <p class="page-subtitle">管理您的所有交易订单</p>
      </div>
    </div>
    
    <!-- 筛选栏 -->
    <div class="card mb-6">
      <div class="filters">
        <div class="filter-group">
          <label class="form-label">状态</label>
          <select v-model="filters.status" class="form-input" @change="handleFilter">
            <option value="">全部状态</option>
            <option value="PENDING">待执行</option>
            <option value="OPEN">持仓中</option>
            <option value="CLOSED">已平仓</option>
            <option value="CANCELLED">已取消</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="form-label">交易对</label>
          <input type="text" v-model="filters.symbol" placeholder="如：BTCUSDT" class="form-input" @keyup.enter="handleFilter">
        </div>
        <div class="filter-group">
          <label class="form-label">开始日期</label>
          <input type="date" v-model="filters.dateFrom" class="form-input" @change="handleFilter">
        </div>
        <div class="filter-group">
          <label class="form-label">结束日期</label>
          <input type="date" v-model="filters.dateTo" class="form-input" @change="handleFilter">
        </div>
        <div class="filter-actions">
          <button class="btn btn-secondary" @click="resetFilters">重置</button>
          <button class="btn btn-primary" @click="handleFilter">搜索</button>
        </div>
      </div>
    </div>
    
    <!-- 订单表格 -->
    <div class="table-container">
      <div v-if="loading" class="loading-state"><div class="spinner"></div></div>
      <div v-else-if="orders.length === 0" class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p class="empty-state-title">暂无订单</p>
        <p class="empty-state-text">当前筛选条件下没有订单</p>
      </div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>订单ID</th>
            <th>交易对</th>
            <th>方向</th>
            <th>数量</th>
            <th>开仓价</th>
            <th>当前价</th>
            <th>盈亏</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id" @click="goToDetail(order.id)" class="clickable-row">
            <td><code>{{ order.id?.substring(0, 8) }}...</code></td>
            <td><strong>{{ order.symbol }}</strong></td>
            <td><span :class="order.direction === 'BUY' ? 'text-success' : 'text-danger'">{{ order.direction === 'BUY' ? '买入' : '卖出' }}</span></td>
            <td>{{ formatNumber(order.quantity) }}</td>
            <td>{{ formatCurrency(order.openPrice) }}</td>
            <td>{{ formatCurrency(order.currentPrice || order.closePrice) }}</td>
            <td :class="getValueColorClass(order.profit)">{{ formatCurrency(order.profit) }}</td>
            <td><span :class="['badge', getStatusBadge(order.status)]">{{ getStatusText(order.status) }}</span></td>
            <td>{{ formatDateTime(order.createdAt) }}</td>
            <td @click.stop>
              <div class="action-btns">
                <button v-if="order.status === 'OPEN'" class="btn btn-sm btn-danger" @click="handleClose(order.id)">平仓</button>
                <button v-if="order.status === 'PENDING'" class="btn btn-sm btn-secondary" @click="handleCancel(order.id)">取消</button>
                <button class="btn btn-sm btn-secondary" @click="goToDetail(order.id)">详情</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 分页 -->
    <div class="pagination" v-if="pagination.totalPages > 1">
      <button class="pagination-btn" :disabled="pagination.page <= 1" @click="changePage(pagination.page - 1)">上一页</button>
      <button v-for="p in displayedPages" :key="p" class="pagination-btn" :class="{ active: p === pagination.page }" @click="changePage(p)">{{ p }}</button>
      <button class="pagination-btn" :disabled="pagination.page >= pagination.totalPages" @click="changePage(pagination.page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useAlertStore } from '@/stores/alert'
import { formatNumber, formatCurrency, formatDateTime, getValueColorClass } from '@/utils/format'

const router = useRouter()
const ordersStore = useOrdersStore()
const alertStore = useAlertStore()

const loading = ref(true)
const filters = reactive({ status: '', symbol: '', dateFrom: '', dateTo: '' })

const orders = computed(() => ordersStore.orders)
const pagination = computed(() => ordersStore.pagination)

const displayedPages = computed(() => {
  const pages = []
  const total = pagination.value.totalPages
  const current = pagination.value.page
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function getStatusBadge(status) {
  const map = { PENDING: 'badge-warning', OPEN: 'badge-info', CLOSED: 'badge-success', CANCELLED: 'badge-secondary' }
  return map[status] || 'badge-secondary'
}

function getStatusText(status) {
  const map = { PENDING: '待执行', OPEN: '持仓中', CLOSED: '已平仓', CANCELLED: '已取消' }
  return map[status] || status
}

async function fetchOrders() {
  loading.value = true
  await ordersStore.fetchOrders()
  loading.value = false
}

function handleFilter() {
  ordersStore.setFilters(filters)
  fetchOrders()
}

function resetFilters() {
  Object.assign(filters, { status: '', symbol: '', dateFrom: '', dateTo: '' })
  ordersStore.resetFilters()
  fetchOrders()
}

function changePage(page) {
  ordersStore.setPage(page)
  fetchOrders()
}

function goToDetail(id) {
  router.push(`/orders/${id}`)
}

async function handleClose(id) {
  if (!confirm('确定要平仓此订单吗？')) return
  const result = await ordersStore.closeOrder(id)
  if (result.success) alertStore.success('平仓成功')
  else alertStore.error(result.message || '平仓失败')
}

async function handleCancel(id) {
  if (!confirm('确定要取消此订单吗？')) return
  const result = await ordersStore.cancelOrder(id)
  if (result.success) alertStore.success('取消成功')
  else alertStore.error(result.message || '取消失败')
}

onMounted(fetchOrders)
</script>

<style scoped>
.orders-page { max-width: 1400px; margin: 0 auto; }
.filters { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; }
.filter-group { flex: 1; min-width: 150px; }
.filter-group .form-input { width: 100%; }
.filter-actions { display: flex; gap: 0.5rem; }
.loading-state { display: flex; justify-content: center; padding: 3rem; }
.clickable-row { cursor: pointer; }
.clickable-row:hover { background: var(--bg-tertiary); }
.action-btns { display: flex; gap: 0.5rem; }
.text-success { color: var(--success-color); }
.text-danger { color: var(--danger-color); }
code { background: var(--bg-tertiary); padding: 0.125rem 0.375rem; border-radius: 4px; font-size: 0.8125rem; }
@media (max-width: 768px) {
  .filters { flex-direction: column; }
  .filter-group { width: 100%; }
  .table-container { overflow-x: auto; }
}
</style>