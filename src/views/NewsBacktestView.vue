<template>
  <div class="backtest-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">新闻回测</h1>
        <p class="page-subtitle">基于历史新闻数据测试交易策略</p>
      </div>
    </div>
    
    <!-- 回测配置 -->
    <div class="card mb-6">
      <div class="card-header">
        <h3 class="card-title">回测配置</h3>
      </div>
      <div class="card-body">
        <form @submit.prevent="runBacktest" class="backtest-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">选择策略</label>
              <select v-model="config.ruleId" class="form-input" required>
                <option value="">选择策略...</option>
                <option v-for="rule in rules" :key="rule.id" :value="rule.id">{{ rule.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">开始日期</label>
              <input type="date" v-model="config.startDate" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">结束日期</label>
              <input type="date" v-model="config.endDate" class="form-input" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">初始资金 (USDT)</label>
              <input type="number" v-model="config.initialCapital" class="form-input" min="100" step="100">
            </div>
            <div class="form-group">
              <label class="form-label">新闻类型筛选</label>
              <select v-model="config.newsTypes" class="form-input" multiple>
                <option value="LISTING">上币公告</option>
                <option value="DELISTING">下币公告</option>
                <option value="AIRDROP">空投</option>
                <option value="LAUNCHPOOL">Launchpool</option>
                <option value="FUTURES">合约上线</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">交易对筛选</label>
              <input type="text" v-model="config.symbols" class="form-input" placeholder="留空测试全部">
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="running">
              <span v-if="running" class="spinner"></span>
              <span v-else>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                开始回测
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 回测进度 -->
    <div class="card mb-6" v-if="running || progress > 0">
      <div class="card-body">
        <div class="progress-info">
          <span>回测进度</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="progress-status">{{ statusText }}</p>
      </div>
    </div>
    
    <!-- 回测结果 -->
    <template v-if="result">
      <!-- 概览统计 -->
      <div class="grid grid-cols-4 mb-6">
        <div class="stat-card">
          <div class="stat-icon stat-icon-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="stat-content">
            <div class="stat-value" :class="getValueColorClass(result.totalProfit)">
              {{ formatCurrency(result.totalProfit) }}
            </div>
            <div class="stat-label">总盈亏</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ result.winRate }}%</div>
            <div class="stat-label">胜率</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-warning">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ result.totalTrades }}</div>
            <div class="stat-label">交易次数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-danger">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatPercent(result.returnRate) }}</div>
            <div class="stat-label">收益率</div>
          </div>
        </div>
      </div>
      
      <!-- 详细统计 -->
      <div class="grid grid-cols-2 mb-6">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">交易统计</h3>
          </div>
          <div class="card-body">
            <div class="stats-list">
              <div class="stats-item">
                <span class="stats-label">盈利次数</span>
                <span class="stats-value text-success">{{ result.winCount }}</span>
              </div>
              <div class="stats-item">
                <span class="stats-label">亏损次数</span>
                <span class="stats-value text-danger">{{ result.lossCount }}</span>
              </div>
              <div class="stats-item">
                <span class="stats-label">最大单笔盈利</span>
                <span class="stats-value text-success">{{ formatCurrency(result.maxWin) }}</span>
              </div>
              <div class="stats-item">
                <span class="stats-label">最大单笔亏损</span>
                <span class="stats-value text-danger">{{ formatCurrency(result.maxLoss) }}</span>
              </div>
              <div class="stats-item">
                <span class="stats-label">平均持仓时间</span>
                <span class="stats-value">{{ result.avgHoldingTime }}秒</span>
              </div>
              <div class="stats-item">
                <span class="stats-label">最大回撤</span>
                <span class="stats-value text-danger">{{ formatPercent(result.maxDrawdown) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">新闻类型分析</h3>
          </div>
          <div class="card-body">
            <div class="news-type-stats">
              <div v-for="(stat, type) in result.newsTypeStats" :key="type" class="news-type-item">
                <div class="news-type-header">
                  <span class="news-type-name">{{ getNewsTypeName(type) }}</span>
                  <span class="news-type-count">{{ stat.count }}次</span>
                </div>
                <div class="news-type-bar">
                  <div class="news-type-fill" :style="{ width: stat.winRate + '%' }" :class="stat.profit > 0 ? 'positive' : 'negative'"></div>
                </div>
                <div class="news-type-info">
                  <span>胜率: {{ stat.winRate }}%</span>
                  <span :class="getValueColorClass(stat.profit)">盈亏: {{ formatCurrency(stat.profit) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 交易明细 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">交易明细</h3>
          <button class="btn btn-sm btn-secondary" @click="exportTrades">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            导出
          </button>
        </div>
        <div class="card-body">
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>新闻</th>
                  <th>交易对</th>
                  <th>方向</th>
                  <th>开仓价</th>
                  <th>平仓价</th>
                  <th>盈亏</th>
                  <th>持仓时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="trade in result.trades" :key="trade.id">
                  <td>{{ formatDateTime(trade.openTime) }}</td>
                  <td class="news-cell">
                    <span class="news-title-mini">{{ truncateText(trade.newsTitle, 30) }}</span>
                  </td>
                  <td><strong>{{ trade.symbol }}</strong></td>
                  <td :class="trade.direction === 'BUY' ? 'text-success' : 'text-danger'">
                    {{ trade.direction === 'BUY' ? '买入' : '卖出' }}
                  </td>
                  <td>{{ formatNumber(trade.openPrice) }}</td>
                  <td>{{ formatNumber(trade.closePrice) }}</td>
                  <td :class="getValueColorClass(trade.profit)">{{ formatCurrency(trade.profit) }}</td>
                  <td>{{ trade.holdingTime }}秒</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/utils/api'
import { useAlertStore } from '@/stores/alert'
import { formatCurrency, formatNumber, formatDateTime, formatPercent, truncateText, getValueColorClass } from '@/utils/format'

const alertStore = useAlertStore()

const rules = ref([])
const running = ref(false)
const progress = ref(0)
const statusText = ref('')
const result = ref(null)

const config = reactive({
  ruleId: '',
  startDate: '',
  endDate: '',
  initialCapital: 10000,
  newsTypes: [],
  symbols: ''
})

// 设置默认日期
const today = new Date()
const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
config.endDate = today.toISOString().split('T')[0]
config.startDate = monthAgo.toISOString().split('T')[0]

const newsTypeNames = {
  LISTING: '上币公告',
  DELISTING: '下币公告',
  AIRDROP: '空投',
  LAUNCHPOOL: 'Launchpool',
  FUTURES: '合约上线',
  LEVERAGE: '杠杆调整',
  MAINTENANCE: '维护公告'
}

function getNewsTypeName(type) {
  return newsTypeNames[type] || type
}

async function loadRules() {
  try {
    const response = await api.get('/strategy/list')
    if (response.success) rules.value = response.data || []
  } catch (error) {
    console.error('加载策略失败:', error)
  }
}

async function runBacktest() {
  if (!config.ruleId) {
    alertStore.warning('请选择策略')
    return
  }
  
  running.value = true
  progress.value = 0
  result.value = null
  statusText.value = '正在加载历史数据...'
  
  try {
    // 模拟进度
    const progressInterval = setInterval(() => {
      if (progress.value < 90) {
        progress.value += Math.random() * 10
        if (progress.value > 30 && progress.value < 60) statusText.value = '正在匹配新闻...'
        if (progress.value > 60) statusText.value = '正在计算收益...'
      }
    }, 500)
    
    const response = await api.post('/backtest', {
      ...config,
      symbols: config.symbols ? config.symbols.split(',').map(s => s.trim()) : []
    })
    
    clearInterval(progressInterval)
    progress.value = 100
    statusText.value = '回测完成'
    
    if (response.success) {
      result.value = response.data
      alertStore.success('回测完成')
    } else {
      alertStore.error(response.message || '回测失败')
    }
  } catch (error) {
    alertStore.error('回测失败')
  } finally {
    running.value = false
  }
}

function exportTrades() {
  if (!result.value?.trades) return
  
  const csv = [
    ['时间', '新闻', '交易对', '方向', '开仓价', '平仓价', '盈亏', '持仓时间'].join(','),
    ...result.value.trades.map(t => [
      t.openTime,
      `"${t.newsTitle}"`,
      t.symbol,
      t.direction,
      t.openPrice,
      t.closePrice,
      t.profit,
      t.holdingTime
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `backtest_${config.startDate}_${config.endDate}.csv`
  link.click()
}

onMounted(loadRules)
</script>

<style scoped>
.backtest-page { max-width: 1400px; margin: 0 auto; }
.backtest-form .form-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
.backtest-form .form-row .form-group { flex: 1; }
.form-actions { margin-top: 1rem; }
.progress-info { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem; }
.progress-bar { height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--primary-gradient); transition: width 0.3s; }
.progress-status { margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); }
.stats-list { display: flex; flex-direction: column; gap: 0.75rem; }
.stats-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-light); }
.stats-item:last-child { border-bottom: none; }
.stats-label { color: var(--text-secondary); }
.stats-value { font-weight: 600; }
.news-type-stats { display: flex; flex-direction: column; gap: 1rem; }

.news-type-header { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
.news-type-name { font-weight: 500; }
.news-type-count { font-size: 0.8125rem; color: var(--text-muted); }
.news-type-bar { height: 6px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden; }
.news-type-fill { height: 100%; }
.news-type-fill.positive { background: var(--success-color); }
.news-type-fill.negative { background: var(--danger-color); }
.news-type-info { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; }
.news-cell { max-width: 200px; }
.news-title-mini { font-size: 0.8125rem; color: var(--text-secondary); }
.text-success { color: var(--success-color); }
.text-danger { color: var(--danger-color); }
@media (max-width: 768px) { .backtest-form .form-row { flex-direction: column; } }
</style>