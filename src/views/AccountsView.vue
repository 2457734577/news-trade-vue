<template>
  <div class="accounts-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">账户管理</h1>
        <p class="page-subtitle">管理您的交易所账户和 API 配置</p>
      </div>
      <router-link to="/accounts/add" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        添加账户
      </router-link>
    </div>
    
    <!-- 账户概览 -->
    <div class="grid grid-cols-4 mb-6">
      <div class="stat-card">
        <div class="stat-icon stat-icon-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ accounts.length }}</div>
          <div class="stat-label">总账户数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-success">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ connectedCount }}</div>
          <div class="stat-label">已连接</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-warning">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(totalBalance) }}</div>
          <div class="stat-label">总资产</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-danger">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ disconnectedCount }}</div>
          <div class="stat-label">断开连接</div>
        </div>
      </div>
    </div>
    
    <!-- 账户列表 -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">账户列表</h3>
        <button class="btn btn-sm btn-secondary" @click="refreshAll">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          刷新状态
        </button>
      </div>
      <div class="card-body">
        <div v-if="loading" class="loading-state"><div class="spinner"></div></div>
        <div v-else-if="accounts.length === 0" class="empty-state">
          <div class="empty-state-icon">👤</div>
          <p class="empty-state-title">暂无账户</p>
          <p class="empty-state-text">添加您的第一个交易所账户开始交易</p>
          <router-link to="/accounts/add" class="btn btn-primary mt-4">添加账户</router-link>
        </div>
        <div v-else class="accounts-grid">
          <div v-for="account in accounts" :key="account.id" class="account-card" :class="{ disconnected: !account.connected }">
            <div class="account-header">
              <div class="account-logo" :style="{ background: getExchangeColor(account.exchange) }">
                {{ account.exchange.charAt(0).toUpperCase() }}
              </div>
              <div class="account-info">
                <h4 class="account-name">{{ account.name }}</h4>
                <p class="account-exchange">{{ getExchangeName(account.exchange) }}</p>
              </div>
              <div class="account-badges">
                <span :class="['badge', account.connected ? 'badge-success' : 'badge-danger']">
                  {{ account.connected ? '已连接' : '断开' }}
                </span>
                <span class="badge badge-primary" v-if="account.isDefault">默认</span>
              </div>
            </div>
            
            <div class="account-balances" v-if="account.connected && account.balances">
              <div class="balance-item" v-for="balance in account.balances.slice(0, 4)" :key="balance.asset">
                <span class="balance-asset">{{ balance.asset }}</span>
                <span class="balance-value">{{ formatNumber(balance.free) }}</span>
              </div>
              <div class="balance-more" v-if="account.balances.length > 4">
                +{{ account.balances.length - 4 }} 更多
              </div>
            </div>
            
            <div class="account-stats">
              <div class="stat-item">
                <span class="stat-label">总资产</span>
                <span class="stat-value">{{ formatCurrency(account.totalBalance || 0) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">今日盈亏</span>
                <span class="stat-value" :class="getValueColorClass(account.todayProfit)">
                  {{ formatCurrency(account.todayProfit || 0) }}
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">订单数</span>
                <span class="stat-value">{{ account.orderCount || 0 }}</span>
              </div>
            </div>
            
            <div class="account-actions">
              <button class="btn btn-sm btn-secondary" @click="viewDetail(account)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                详情
              </button>
              <button class="btn btn-sm btn-secondary" @click="editAccount(account)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                编辑
              </button>
              <button class="btn btn-sm btn-secondary" @click="testConnection(account)" :disabled="account.testing">
                <span v-if="account.testing" class="spinner spinner-sm"></span>
                <span v-else>测试</span>
              </button>
              <button class="btn btn-sm" :class="account.isDefault ? 'btn-secondary' : 'btn-primary'" @click="setDefault(account)" v-if="!account.isDefault">
                设为默认
              </button>
              <button class="btn btn-sm btn-danger" @click="deleteAccount(account.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 账户详情弹窗 -->
    <Teleport to="body">
      <div v-if="selectedAccount" class="modal-overlay" @click="selectedAccount = null">
        <div class="modal modal-lg" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ selectedAccount.name }} - 账户详情</h3>
            <button class="modal-close" @click="selectedAccount = null">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="detail-section">
              <h4>资产明细</h4>
              <table class="table">
                <thead>
                  <tr>
                    <th>币种</th>
                    <th>可用</th>
                    <th>冻结</th>
                    <th>总计</th>
                    <th>估值 (USDT)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="balance in selectedAccount.balances" :key="balance.asset">
                    <td><strong>{{ balance.asset }}</strong></td>
                    <td>{{ formatNumber(balance.free) }}</td>
                    <td>{{ formatNumber(balance.locked) }}</td>
                    <td>{{ formatNumber(balance.free + balance.locked) }}</td>
                    <td>{{ formatCurrency(balance.usdtValue || 0) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'
import { useAlertStore } from '@/stores/alert'
import { formatCurrency, formatNumber, getValueColorClass } from '@/utils/format'

const alertStore = useAlertStore()
const loading = ref(true)
const accounts = ref([])
const selectedAccount = ref(null)

const connectedCount = computed(() => accounts.value.filter(a => a.connected).length)
const disconnectedCount = computed(() => accounts.value.filter(a => !a.connected).length)
const totalBalance = computed(() => accounts.value.reduce((sum, a) => sum + (a.totalBalance || 0), 0))

const exchangeColors = {
  binance: '#F0B90B',
  okx: '#121212',
  huobi: '#2D72D2',
  bybit: '#F7A600'
}

const exchangeNames = {
  binance: 'Binance',
  okx: 'OKX',
  huobi: 'Huobi',
  bybit: 'Bybit'
}

function getExchangeColor(exchange) {
  return exchangeColors[exchange] || '#6b7280'
}

function getExchangeName(exchange) {
  return exchangeNames[exchange] || exchange
}

async function loadAccounts() {
  loading.value = true
  try {
    const response = await api.get('/account/list')
    if (response.success) accounts.value = response.data || []
  } catch (error) {
    console.error('加载账户失败:', error)
  } finally {
    loading.value = false
  }
}

async function refreshAll() {
  for (const account of accounts.value) {
    await testConnection(account)
  }
}

function viewDetail(account) {
  selectedAccount.value = account
}

function editAccount(account) {
  alertStore.info('编辑功能开发中')
}

async function testConnection(account) {
  account.testing = true
  try {
    const response = await api.post(`/account/test/${account.id}`)
    if (response.success) {
      account.connected = true
      account.balances = response.data?.balances || []
      account.totalBalance = response.data?.totalBalance || 0
      alertStore.success(`${account.name} 连接成功`)
    } else {
      account.connected = false
      alertStore.error(`${account.name} 连接失败`)
    }
  } catch (error) {
    account.connected = false
    alertStore.error(`${account.name} 连接测试失败`)
  } finally {
    account.testing = false
  }
}

async function setDefault(account) {
  try {
    const response = await api.patch(`/account/default/${account.id}`)
    if (response.success) {
      accounts.value.forEach(a => a.isDefault = a.id === account.id)
      alertStore.success('已设为默认账户')
    }
  } catch (error) {
    alertStore.error('设置失败')
  }
}

async function deleteAccount(id) {
  if (!confirm('确定要删除这个账户吗？')) return
  try {
    const response = await api.delete(`/account/delete/${id}`)
    if (response.success) {
      alertStore.success('账户已删除')
      await loadAccounts()
    }
  } catch (error) {
    alertStore.error('删除失败')
  }
}

onMounted(loadAccounts)
</script>

<style scoped>
.accounts-page { max-width: 1400px; margin: 0 auto; }
.accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 1.5rem; }
.account-card { background: var(--bg-tertiary); border-radius: var(--radius-lg); padding: 1.5rem; transition: all var(--transition-fast); }
.account-card:hover { box-shadow: var(--shadow-md); }
.account-card.disconnected { opacity: 0.7; }
.account-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.account-logo { width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; color: white; }
.account-info { flex: 1; }
.account-name { font-size: 1.125rem; font-weight: 600; }
.account-exchange { font-size: 0.8125rem; color: var(--text-secondary); }
.account-badges { display: flex; gap: 0.5rem; }
.account-balances { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; padding: 0.75rem; background: var(--bg-secondary); border-radius: var(--radius-md); }
.balance-item { display: flex; justify-content: space-between; width: calc(50% - 0.25rem); font-size: 0.875rem; }
.balance-asset { color: var(--text-secondary); }
.balance-value { font-weight: 500; }
.balance-more { font-size: 0.75rem; color: var(--text-muted); width: 100%; text-align: center; }
.account-stats { display: flex; gap: 1rem; margin-bottom: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-light); }
.stat-item { flex: 1; text-align: center; }
.stat-item .stat-label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem; }
.stat-item .stat-value { font-size: 1rem; font-weight: 600; }
.account-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.modal-lg { max-width: 800px; }
.modal-body { padding: 1.5rem; }
.detail-section h4 { font-size: 1rem; font-weight: 600; margin-bottom: 1rem; }
.spinner-sm { width: 14px; height: 14px; }
@media (max-width: 768px) { .accounts-grid { grid-template-columns: 1fr; } }
</style>