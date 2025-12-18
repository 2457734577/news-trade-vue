<template>
  <div class="add-account-page">
    <div class="page-header">
      <h1 class="page-title">添加交易账户</h1>
      <p class="page-subtitle">连接您的交易所账户以开始自动交易</p>
    </div>
    
    <!-- 交易所选择 -->
    <div class="exchange-grid">
      <div 
        v-for="exchange in exchanges" 
        :key="exchange.id" 
        class="exchange-card card"
        :class="{ selected: selectedExchange === exchange.id }"
        @click="selectExchange(exchange.id)"
      >
        <div class="exchange-logo" :style="{ background: exchange.color }">
          {{ exchange.name.charAt(0) }}
        </div>
        <h3 class="exchange-name">{{ exchange.name }}</h3>
        <p class="exchange-desc">{{ exchange.description }}</p>
        <div class="exchange-check" v-if="selectedExchange === exchange.id">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
      </div>
    </div>
    
    <!-- API 配置表单 -->
    <div class="card mt-6" v-if="selectedExchange">
      <div class="card-header">
        <h3 class="card-title">API 配置</h3>
      </div>
      <div class="card-body">
        <div class="api-notice">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <div>
            <p><strong>安全提示：</strong></p>
            <ul>
              <li>请确保 API Key 仅具有交易权限，不要开启提现权限</li>
              <li>建议设置 IP 白名单以增强安全性</li>
              <li>您的 API 密钥将使用加密存储</li>
            </ul>
          </div>
        </div>
        
        <form @submit.prevent="addAccount" class="api-form">
          <div class="form-group">
            <label class="form-label">账户名称</label>
            <input type="text" v-model="form.name" class="form-input" placeholder="给这个账户起个名字" :class="{ error: errors.name }">
            <span class="form-error" v-if="errors.name">{{ errors.name }}</span>
          </div>
          
          <div class="form-group">
            <label class="form-label">API Key</label>
            <input type="text" v-model="form.apiKey" class="form-input" placeholder="输入您的 API Key" :class="{ error: errors.apiKey }">
            <span class="form-error" v-if="errors.apiKey">{{ errors.apiKey }}</span>
          </div>
          
          <div class="form-group">
            <label class="form-label">API Secret</label>
            <input type="password" v-model="form.apiSecret" class="form-input" placeholder="输入您的 API Secret" :class="{ error: errors.apiSecret }">
            <span class="form-error" v-if="errors.apiSecret">{{ errors.apiSecret }}</span>
          </div>
          
          <div class="form-group" v-if="selectedExchange === 'okx'">
            <label class="form-label">Passphrase</label>
            <input type="password" v-model="form.passphrase" class="form-input" placeholder="OKX API Passphrase">
          </div>
          
          <div class="form-group">
            <label class="toggle-label">
              <span>设为默认账户</span>
              <input type="checkbox" v-model="form.isDefault">
              <span class="toggle"></span>
            </label>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="testConnection" :disabled="testing">
              <span v-if="testing" class="spinner"></span>
              <span v-else>测试连接</span>
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner"></span>
              <span v-else>添加账户</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 已添加的账户 -->
    <div class="card mt-6">
      <div class="card-header">
        <h3 class="card-title">已添加的账户</h3>
      </div>
      <div class="card-body">
        <div v-if="accounts.length === 0" class="empty-state">
          <p class="empty-state-text">暂无交易账户</p>
        </div>
        <div v-else class="accounts-list">
          <div v-for="account in accounts" :key="account.id" class="account-item">
            <div class="account-info">
              <div class="account-logo" :style="{ background: getExchangeColor(account.exchange) }">
                {{ account.exchange.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h4 class="account-name">{{ account.name }}</h4>
                <p class="account-exchange">{{ account.exchange }}</p>
              </div>
            </div>
            <div class="account-status">
              <span :class="['badge', account.connected ? 'badge-success' : 'badge-danger']">
                {{ account.connected ? '已连接' : '断开' }}
              </span>
              <span class="badge badge-primary" v-if="account.isDefault">默认</span>
            </div>
            <div class="account-actions">
              <button class="btn btn-sm btn-secondary" @click="editAccount(account)">编辑</button>
              <button class="btn btn-sm btn-danger" @click="deleteAccount(account.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/utils/api'
import { useAlertStore } from '@/stores/alert'

const alertStore = useAlertStore()

const exchanges = [
  { id: 'binance', name: 'Binance', description: '全球最大的加密货币交易所', color: '#F0B90B' },
  { id: 'okx', name: 'OKX', description: '领先的数字资产交易平台', color: '#121212' },
  { id: 'huobi', name: 'Huobi', description: '安全可信赖的数字资产交易所', color: '#2D72D2' },
  { id: 'bybit', name: 'Bybit', description: '专业的衍生品交易平台', color: '#F7A600' }
]

const selectedExchange = ref('')
const accounts = ref([])
const testing = ref(false)
const saving = ref(false)

const form = reactive({ name: '', apiKey: '', apiSecret: '', passphrase: '', isDefault: false })
const errors = reactive({ name: '', apiKey: '', apiSecret: '' })

function selectExchange(id) {
  selectedExchange.value = id
  Object.assign(form, { name: '', apiKey: '', apiSecret: '', passphrase: '', isDefault: false })
}

function getExchangeColor(exchangeId) {
  const exchange = exchanges.find(e => e.id === exchangeId)
  return exchange?.color || '#6b7280'
}

async function testConnection() {
  if (!form.apiKey || !form.apiSecret) {
    alertStore.warning('请先填写 API 信息')
    return
  }
  
  testing.value = true
  try {
    const response = await api.post('/account/test', {
      exchange: selectedExchange.value,
      apiKey: form.apiKey,
      apiSecret: form.apiSecret,
      passphrase: form.passphrase
    })
    if (response.success) alertStore.success('连接测试成功')
    else alertStore.error(response.message || '连接测试失败')
  } catch (error) {
    alertStore.error('连接测试失败')
  } finally {
    testing.value = false
  }
}

async function addAccount() {
  errors.name = form.name ? '' : '请输入账户名称'
  errors.apiKey = form.apiKey ? '' : '请输入 API Key'
  errors.apiSecret = form.apiSecret ? '' : '请输入 API Secret'
  
  if (Object.values(errors).some(e => e)) return
  
  saving.value = true
  try {
    const response = await api.post('/account/create', {
      exchange: selectedExchange.value,
      ...form
    })
    if (response.success) {
      alertStore.success('账户添加成功')
      await loadAccounts()
      selectedExchange.value = ''
    } else {
      alertStore.error(response.message || '添加失败')
    }
  } catch (error) {
    alertStore.error('添加失败')
  } finally {
    saving.value = false
  }
}

async function loadAccounts() {
  try {
    const response = await api.get('/account/list')
    if (response.success) accounts.value = response.data || []
  } catch (error) {
    console.error('加载账户失败:', error)
  }
}

function editAccount(account) {
  alertStore.info('编辑功能开发中')
}

async function deleteAccount(id) {
  if (!confirm('确定要删除这个账户吗？')) return
  try {
    const response = await api.delete(`/account/delete/${id}`)
    if (response.success) {
      alertStore.success('账户已删除')
      await loadAccounts()
    } else {
      alertStore.error(response.message || '删除失败')
    }
  } catch (error) {
    alertStore.error('删除失败')
  }
}

onMounted(loadAccounts)
</script>

<style scoped>
.add-account-page { max-width: 1200px; margin: 0 auto; }
.exchange-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.exchange-card { position: relative; cursor: pointer; text-align: center; padding: 1.5rem; transition: all var(--transition-fast); }
.exchange-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.exchange-card.selected { border: 2px solid var(--primary-color); }
.exchange-logo { width: 56px; height: 56px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; color: white; margin: 0 auto 1rem; }
.exchange-name { font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem; }
.exchange-desc { font-size: 0.8125rem; color: var(--text-secondary); }
.exchange-check { position: absolute; top: 0.75rem; right: 0.75rem; color: var(--success-color); }
.api-notice { display: flex; gap: 1rem; padding: 1rem; background: var(--info-bg); border-radius: var(--radius-md); margin-bottom: 1.5rem; color: var(--info-color); }
.api-notice ul { margin: 0.5rem 0 0 1rem; font-size: 0.875rem; }
.api-form { display: flex; flex-direction: column; gap: 1rem; }
.form-actions { display: flex; gap: 1rem; margin-top: 0.5rem; }
.toggle-label { display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
.toggle-label input { display: none; }
.toggle { width: 44px; height: 24px; background: var(--border-color); border-radius: 12px; position: relative; transition: background var(--transition-fast); }
.toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: white; border-radius: 50%; transition: transform var(--transition-fast); }
.toggle-label input:checked + .toggle { background: var(--primary-color); }
.toggle-label input:checked + .toggle::after { transform: translateX(20px); }
.accounts-list { display: flex; flex-direction: column; gap: 0.75rem; }
.account-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-md); }
.account-info { display: flex; align-items: center; gap: 0.75rem; flex: 1; }
.account-logo { width: 40px; height: 40px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; }
.account-name { font-weight: 600; }
.account-exchange { font-size: 0.8125rem; color: var(--text-secondary); text-transform: capitalize; }
.account-status { display: flex; gap: 0.5rem; }
.account-actions { display: flex; gap: 0.5rem; }
@media (max-width: 768px) { .exchange-grid { grid-template-columns: repeat(2, 1fr); } .account-item { flex-wrap: wrap; } }
</style>