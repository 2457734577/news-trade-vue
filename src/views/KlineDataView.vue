<template>
  <div class="kline-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">K线数据管理</h1>
        <p class="page-subtitle">查看历史K线数据，导入新闻时自动同步</p>
      </div>
      <button class="btn btn-secondary" @click="loadData">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        刷新
      </button>
    </div>
    
    <!-- 统计 -->
    <div class="grid grid-cols-4 mb-6">
      <div class="stat-card">
        <div class="stat-icon stat-icon-primary">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.totalRecords) }}</div>
          <div class="stat-label">总记录数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-success">💹</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.symbols }}</div>
          <div class="stat-label">交易对数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-warning">📰</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.newsLinked }}</div>
          <div class="stat-label">已关联新闻</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-danger">💾</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.storageSize }}</div>
          <div class="stat-label">存储空间</div>
        </div>
      </div>
    </div>
    
    <!-- 数据概览 -->
    <div class="grid grid-cols-2 mb-6">
      <!-- 交易对列表 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">交易对数据</h3>
          <input type="text" v-model="symbolSearch" class="form-input form-input-sm" placeholder="搜索交易对...">
        </div>
        <div class="card-body">
          <div v-if="loading" class="loading-state"><div class="spinner"></div></div>
          <div v-else-if="symbolList.length === 0" class="empty-state">
            <p class="empty-state-text">暂无K线数据，导入新闻后自动生成</p>
          </div>
          <div v-else class="symbol-list">
            <div v-for="item in filteredSymbols" :key="item.symbol" class="symbol-item" :class="{ active: selectedSymbol === item.symbol }" @click="selectSymbol(item.symbol)">
              <div class="symbol-info">
                <span class="symbol-name">{{ item.symbol }}</span>
                <span class="symbol-count">{{ formatNumber(item.records) }} 条</span>
              </div>
              <div class="symbol-range">{{ item.startDate }} ~ {{ item.endDate }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- K线预览 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">K线预览</h3>
          <select v-model="previewInterval" class="form-input form-input-sm" @change="loadPreview">
            <option value="1s">1秒</option>
            <option value="1m">1分钟</option>
          </select>
        </div>
        <div class="card-body">
          <div v-if="!selectedSymbol" class="empty-state">
            <p class="empty-state-text">选择左侧交易对查看K线</p>
          </div>
          <div v-else-if="previewData.length === 0" class="empty-state">
            <p class="empty-state-text">暂无K线数据</p>
          </div>
          <div v-else class="kline-preview">
            <div class="kline-chart">
              <div v-for="(candle, i) in previewData" :key="i" class="candle" :class="candle.close >= candle.open ? 'green' : 'red'">
                <div class="wick" :style="{ height: getWickHeight(candle) + '%', top: getWickTop(candle) + '%' }"></div>
                <div class="body" :style="{ height: getBodyHeight(candle) + '%', top: getBodyTop(candle) + '%' }"></div>
              </div>
            </div>
            <div class="kline-info">
              <span>最新: {{ previewData[previewData.length - 1]?.close }}</span>
              <span>最高: {{ previewHigh }}</span>
              <span>最低: {{ previewLow }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 数据明细 -->
    <div class="card" v-if="selectedSymbol && previewData.length">
      <div class="card-header">
        <h3 class="card-title">{{ selectedSymbol }} 数据明细</h3>
      </div>
      <div class="card-body">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>时间</th>
                <th>开盘</th>
                <th>最高</th>
                <th>最低</th>
                <th>收盘</th>
                <th>成交量</th>
                <th>涨跌幅</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in previewData.slice(0, 20)" :key="i">
                <td>{{ formatDateTime(item.time) }}</td>
                <td>{{ formatNumber(item.open) }}</td>
                <td>{{ formatNumber(item.high) }}</td>
                <td>{{ formatNumber(item.low) }}</td>
                <td>{{ formatNumber(item.close) }}</td>
                <td>{{ formatNumber(item.volume) }}</td>
                <td :class="item.close >= item.open ? 'text-success' : 'text-danger'">
                  {{ ((item.close - item.open) / item.open * 100).toFixed(2) }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/utils/api'
import { formatDateTime, formatNumber } from '@/utils/format'

const loading = ref(true)
const selectedSymbol = ref('')
const symbolSearch = ref('')
const previewInterval = ref('1s')
const previewData = ref([])
const symbolList = ref([])

const stats = reactive({ totalRecords: 0, symbols: 0, newsLinked: 0, storageSize: '0 MB' })

const filteredSymbols = computed(() => {
  if (!symbolSearch.value) return symbolList.value
  return symbolList.value.filter(s => s.symbol.toLowerCase().includes(symbolSearch.value.toLowerCase()))
})

const previewHigh = computed(() => previewData.value.length ? Math.max(...previewData.value.map(c => c.high)) : 0)
const previewLow = computed(() => previewData.value.length ? Math.min(...previewData.value.map(c => c.low)) : 0)

function getWickHeight(candle) {
  const range = previewHigh.value - previewLow.value
  return range ? ((candle.high - candle.low) / range) * 100 : 0
}

function getWickTop(candle) {
  const range = previewHigh.value - previewLow.value
  return range ? ((previewHigh.value - candle.high) / range) * 100 : 0
}

function getBodyHeight(candle) {
  const range = previewHigh.value - previewLow.value
  return range ? (Math.abs(candle.close - candle.open) / range) * 100 || 1 : 1
}

function getBodyTop(candle) {
  const range = previewHigh.value - previewLow.value
  return range ? ((previewHigh.value - Math.max(candle.open, candle.close)) / range) * 100 : 0
}

async function loadData() {
  loading.value = true
  try {
    const [symbolsRes, statsRes] = await Promise.all([
      api.get('/kline/symbols'),
      api.get('/kline/stats')
    ])
    if (symbolsRes.success) symbolList.value = symbolsRes.data || []
    if (statsRes.success) Object.assign(stats, statsRes.data)
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

function selectSymbol(symbol) {
  selectedSymbol.value = symbol
  loadPreview()
}

async function loadPreview() {
  if (!selectedSymbol.value) return
  try {
    const response = await api.get('/kline/data', { 
      params: { symbol: selectedSymbol.value, interval: previewInterval.value, limit: 50 } 
    })
    if (response.success) previewData.value = response.data || []
  } catch (error) {
    console.error('加载K线失败:', error)
  }
}

onMounted(loadData)
</script>

<style scoped>
.kline-page { max-width: 1400px; margin: 0 auto; }
.form-input-sm { padding: 0.375rem 0.5rem; font-size: 0.8125rem; width: 140px; }
.symbol-list { max-height: 300px; overflow-y: auto; }
.symbol-item { padding: 0.75rem; border-bottom: 1px solid var(--border-light); cursor: pointer; transition: background var(--transition-fast); }
.symbol-item:hover { background: var(--bg-tertiary); }
.symbol-item.active { background: var(--primary-color); color: white; border-radius: var(--radius-md); }
.symbol-info { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
.symbol-name { font-weight: 600; }
.symbol-count { font-size: 0.8125rem; opacity: 0.8; }
.symbol-range { font-size: 0.75rem; opacity: 0.6; }
.kline-chart { display: flex; align-items: flex-end; height: 200px; gap: 2px; padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-md); }
.candle { flex: 1; position: relative; min-width: 4px; height: 100%; }
.wick { position: absolute; left: 50%; width: 1px; transform: translateX(-50%); }
.body { position: absolute; left: 10%; width: 80%; min-height: 1px; }
.candle.green .wick, .candle.green .body { background: var(--success-color); }
.candle.red .wick, .candle.red .body { background: var(--danger-color); }
.kline-info { display: flex; justify-content: space-around; margin-top: 0.5rem; font-size: 0.8125rem; color: var(--text-secondary); }
.text-success { color: var(--success-color); }
.text-danger { color: var(--danger-color); }
</style>