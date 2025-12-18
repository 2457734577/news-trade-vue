<template>
  <div class="settings-page">
    <div class="page-header">
      <h1 class="page-title">系统配置</h1>
      <p class="page-subtitle">管理您的交易系统配置</p>
    </div>
    
    <div class="settings-grid">
      <!-- 交易设置 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">交易设置</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">默认交易量</label>
            <input type="number" v-model="settings.defaultQuantity" class="form-input" step="0.01" min="0">
            <span class="form-hint">每次交易的默认数量</span>
          </div>
          <div class="form-group">
            <label class="form-label">默认止损比例 (%)</label>
            <input type="number" v-model="settings.defaultStopLoss" class="form-input" step="0.1" min="0" max="100">
            <span class="form-hint">自动设置止损价格的比例</span>
          </div>
          <div class="form-group">
            <label class="form-label">默认止盈比例 (%)</label>
            <input type="number" v-model="settings.defaultTakeProfit" class="form-input" step="0.1" min="0" max="100">
            <span class="form-hint">自动设置止盈价格的比例</span>
          </div>
          <div class="form-group">
            <label class="toggle-label">
              <span>自动执行交易</span>
              <input type="checkbox" v-model="settings.autoTrade">
              <span class="toggle"></span>
            </label>
            <span class="form-hint">启用后，系统将根据新闻自动执行交易</span>
          </div>
        </div>
      </div>
      
      <!-- 新闻监控设置 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">新闻监控</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">监控间隔 (秒)</label>
            <input type="number" v-model="settings.newsInterval" class="form-input" min="10" max="3600">
            <span class="form-hint">新闻检查的时间间隔</span>
          </div>
          <div class="form-group">
            <label class="form-label">关注的交易对</label>
            <input type="text" v-model="settings.watchSymbols" class="form-input" placeholder="BTCUSDT, ETHUSDT">
            <span class="form-hint">用逗号分隔多个交易对</span>
          </div>
          <div class="form-group">
            <label class="form-label">最小影响等级</label>
            <select v-model="settings.minImpact" class="form-input">
              <option value="LOW">低影响及以上</option>
              <option value="MEDIUM">中影响及以上</option>
              <option value="HIGH">仅高影响</option>
            </select>
            <span class="form-hint">只触发达到此等级的新闻</span>
          </div>
          <div class="form-group">
            <label class="toggle-label">
              <span>启用新闻监控</span>
              <input type="checkbox" v-model="settings.newsMonitorEnabled">
              <span class="toggle"></span>
            </label>
          </div>
        </div>
      </div>
      
      <!-- 通知设置 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">通知设置</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="toggle-label">
              <span>邮件通知</span>
              <input type="checkbox" v-model="settings.emailNotification">
              <span class="toggle"></span>
            </label>
          </div>
          <div class="form-group">
            <label class="toggle-label">
              <span>交易执行通知</span>
              <input type="checkbox" v-model="settings.tradeNotification">
              <span class="toggle"></span>
            </label>
          </div>
          <div class="form-group">
            <label class="toggle-label">
              <span>重要新闻通知</span>
              <input type="checkbox" v-model="settings.newsNotification">
              <span class="toggle"></span>
            </label>
          </div>
          <div class="form-group">
            <label class="toggle-label">
              <span>盈亏提醒</span>
              <input type="checkbox" v-model="settings.profitNotification">
              <span class="toggle"></span>
            </label>
          </div>
        </div>
      </div>
      
      <!-- API 设置 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">API 配置</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">交易所</label>
            <select v-model="settings.exchange" class="form-input">
              <option value="binance">Binance</option>
              <option value="okx">OKX</option>
              <option value="huobi">Huobi</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">API Key</label>
            <input type="password" v-model="settings.apiKey" class="form-input" placeholder="••••••••">
          </div>
          <div class="form-group">
            <label class="form-label">API Secret</label>
            <input type="password" v-model="settings.apiSecret" class="form-input" placeholder="••••••••">
          </div>
          <button class="btn btn-secondary" @click="testConnection">测试连接</button>
        </div>
      </div>
    </div>
    
    <!-- 保存按钮 -->
    <div class="settings-actions">
      <button class="btn btn-secondary" @click="resetSettings">重置默认</button>
      <button class="btn btn-primary" @click="saveSettings" :disabled="saving">
        <span v-if="saving" class="spinner"></span>
        <span v-else>保存设置</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/utils/api'
import { useAlertStore } from '@/stores/alert'

const alertStore = useAlertStore()
const saving = ref(false)

const settings = reactive({
  defaultQuantity: 0.01,
  defaultStopLoss: 2,
  defaultTakeProfit: 5,
  autoTrade: false,
  newsInterval: 60,
  watchSymbols: 'BTCUSDT, ETHUSDT',
  minImpact: 'MEDIUM',
  newsMonitorEnabled: true,
  emailNotification: true,
  tradeNotification: true,
  newsNotification: true,
  profitNotification: false,
  exchange: 'binance',
  apiKey: '',
  apiSecret: ''
})

const defaultSettings = { ...settings }

async function loadSettings() {
  try {
    const response = await api.get('/settings')
    if (response.success) {
      Object.assign(settings, response.data)
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

async function saveSettings() {
  saving.value = true
  try {
    const response = await api.put('/settings', settings)
    if (response.success) {
      alertStore.success('设置已保存')
    } else {
      alertStore.error(response.message || '保存失败')
    }
  } catch (error) {
    alertStore.error('保存失败')
  } finally {
    saving.value = false
  }
}

function resetSettings() {
  Object.assign(settings, defaultSettings)
  alertStore.info('已重置为默认设置')
}

async function testConnection() {
  try {
    const response = await api.post('/settings/test-connection', {
      exchange: settings.exchange,
      apiKey: settings.apiKey,
      apiSecret: settings.apiSecret
    })
    if (response.success) {
      alertStore.success('连接成功')
    } else {
      alertStore.error(response.message || '连接失败')
    }
  } catch (error) {
    alertStore.error('连接测试失败')
  }
}

onMounted(loadSettings)
</script>

<style scoped>
.settings-page { max-width: 1200px; margin: 0 auto; }
.settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
.toggle-label { display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
.toggle-label input { display: none; }
.toggle { width: 44px; height: 24px; background: var(--border-color); border-radius: 12px; position: relative; transition: background var(--transition-fast); }
.toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: white; border-radius: 50%; transition: transform var(--transition-fast); }
.toggle-label input:checked + .toggle { background: var(--primary-color); }
.toggle-label input:checked + .toggle::after { transform: translateX(20px); }
.settings-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-light); }
@media (max-width: 768px) { .settings-grid { grid-template-columns: 1fr; } }
</style>