<template>
  <div class="analytics-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">数据分析</h1>
        <p class="page-subtitle">交易数据和新闻影响分析</p>
      </div>
      <div class="header-actions">
        <select v-model="timeRange" class="form-input" @change="loadAnalytics">
          <option value="7d">最近7天</option>
          <option value="30d">最近30天</option>
          <option value="90d">最近90天</option>
          <option value="all">全部时间</option>
        </select>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="card mb-6">
      <div class="card-body loading-state"><div class="spinner"></div><p>加载分析数据中...</p></div>
    </div>
    
    <!-- 无数据状态 -->
    <div v-else-if="!analytics.totalTrades" class="card mb-6">
      <div class="card-body empty-state">
        <div class="empty-state-icon">📊</div>
        <p class="empty-state-title">暂无分析数据</p>
        <p class="empty-state-text">系统需要先收集交易数据才能生成分析报告</p>
      </div>
    </div>
    
    <template v-else>
    <!-- 核心指标 -->
    <div class="grid grid-cols-4 mb-6">
      <div class="stat-card">
        <div class="stat-icon stat-icon-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value" :class="getValueColorClass(analytics.totalProfit)">
            {{ formatCurrency(analytics.totalProfit) }}
          </div>
          <div class="stat-label">总盈亏</div>
          <div class="stat-change" :class="analytics.profitChange > 0 ? 'positive' : 'negative'">
            {{ analytics.profitChange > 0 ? '+' : '' }}{{ analytics.profitChange }}% vs 上期
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-success">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ analytics.winRate }}%</div>
          <div class="stat-label">胜率</div>
          <div class="stat-change" :class="analytics.winRateChange > 0 ? 'positive' : 'negative'">
            {{ analytics.winRateChange > 0 ? '+' : '' }}{{ analytics.winRateChange }}% vs 上期
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-warning">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ analytics.totalTrades }}</div>
          <div class="stat-label">交易次数</div>
          <div class="stat-change neutral">
            日均 {{ analytics.avgTradesPerDay }} 次
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-danger">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ analytics.newsProcessed }}</div>
          <div class="stat-label">处理新闻</div>
          <div class="stat-change neutral">
            触发率 {{ analytics.triggerRate }}%
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="grid grid-cols-2 mb-6">
      <!-- 收益曲线 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">收益曲线</h3>
        </div>
        <div class="card-body">
          <div class="chart-container">
            <div class="chart-placeholder" v-if="!analytics.profitChart">
              <p>暂无数据</p>
            </div>
            <div v-else class="simple-chart">
              <div class="chart-line">
                <div 
                  v-for="(point, index) in analytics.profitChart" 
                  :key="index" 
                  class="chart-point"
                  :style="{ 
                    left: (index / (analytics.profitChart.length - 1) * 100) + '%',
                    bottom: ((point.value - chartMin) / (chartMax - chartMin) * 100) + '%'
                  }"
                  :title="`${point.date}: ${formatCurrency(point.value)}`"
                ></div>
              </div>
              <div class="chart-labels">
                <span>{{ analytics.profitChart[0]?.date }}</span>
                <span>{{ analytics.profitChart[analytics.profitChart.length - 1]?.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 交易分布 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">交易结果分布</h3>
        </div>
        <div class="card-body">
          <div class="distribution-chart">
            <div class="dist-bar">
              <div class="dist-win" :style="{ width: analytics.winRate + '%' }">
                <span class="dist-label">盈利 {{ analytics.winCount }}</span>
              </div>
              <div class="dist-loss" :style="{ width: (100 - analytics.winRate) + '%' }">
                <span class="dist-label">亏损 {{ analytics.lossCount }}</span>
              </div>
            </div>
            <div class="dist-details">
              <div class="dist-item">
                <span class="dist-dot win"></span>
                <span>盈利交易</span>
                <span class="dist-value">{{ analytics.winCount }} ({{ analytics.winRate }}%)</span>
              </div>
              <div class="dist-item">
                <span class="dist-dot loss"></span>
                <span>亏损交易</span>
                <span class="dist-value">{{ analytics.lossCount }} ({{ 100 - analytics.winRate }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 新闻类型分析 -->
    <div class="card mb-6">
      <div class="card-header">
        <h3 class="card-title">新闻类型表现</h3>
      </div>
      <div class="card-body">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>新闻类型</th>
                <th>触发次数</th>
                <th>成功次数</th>
                <th>胜率</th>
                <th>总盈亏</th>
                <th>平均盈亏</th>
                <th>最佳持仓时间</th>
                <th>建议</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in analytics.newsTypeAnalysis" :key="item.type">
                <td><strong>{{ getNewsTypeName(item.type) }}</strong></td>
                <td>{{ item.triggerCount }}</td>
                <td>{{ item.successCount }}</td>
                <td>
                  <span :class="item.winRate >= 50 ? 'text-success' : 'text-danger'">
                    {{ item.winRate }}%
                  </span>
                </td>
                <td :class="getValueColorClass(item.totalProfit)">{{ formatCurrency(item.totalProfit) }}</td>
                <td :class="getValueColorClass(item.avgProfit)">{{ formatCurrency(item.avgProfit) }}</td>
                <td>{{ item.optimalHoldingTime }}秒</td>
                <td>
                  <span :class="['badge', item.recommendation === 'KEEP' ? 'badge-success' : item.recommendation === 'ADJUST' ? 'badge-warning' : 'badge-danger']">
                    {{ getRecommendationText(item.recommendation) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- 交易对分析 -->
    <div class="grid grid-cols-2 mb-6">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">表现最佳交易对</h3>
        </div>
        <div class="card-body">
          <div class="symbol-list">
            <div v-for="(item, index) in analytics.topSymbols" :key="item.symbol" class="symbol-item">
              <div class="symbol-rank">{{ index + 1 }}</div>
              <div class="symbol-info">
                <span class="symbol-name">{{ item.symbol }}</span>
                <span class="symbol-trades">{{ item.trades }}次交易</span>
              </div>
              <div class="symbol-profit text-success">+{{ formatCurrency(item.profit) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">表现最差交易对</h3>
        </div>
        <div class="card-body">
          <div class="symbol-list">
            <div v-for="(item, index) in analytics.worstSymbols" :key="item.symbol" class="symbol-item">
              <div class="symbol-rank worst">{{ index + 1 }}</div>
              <div class="symbol-info">
                <span class="symbol-name">{{ item.symbol }}</span>
                <span class="symbol-trades">{{ item.trades }}次交易</span>
              </div>
              <div class="symbol-profit text-danger">{{ formatCurrency(item.profit) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 时间段分析 -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">交易时段分析</h3>
      </div>
      <div class="card-body">
        <div class="time-analysis">
          <div v-for="hour in analytics.hourlyAnalysis" :key="hour.hour" class="hour-item">
            <div class="hour-label">{{ hour.hour }}:00</div>
            <div class="hour-bar-container">
              <div 
                class="hour-bar" 
                :class="hour.profit > 0 ? 'positive' : 'negative'"
                :style="{ height: Math.abs(hour.profit) / maxHourProfit * 60 + 'px' }"
              ></div>
            </div>
            <div class="hour-trades">{{ hour.trades }}</div>
          </div>
        </div>
        <div class="time-legend">
          <span><span class="legend-dot positive"></span> 盈利时段</span>
          <span><span class="legend-dot negative"></span> 亏损时段</span>
          <span class="legend-note">数字表示交易次数</span>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/utils/api'
import { useAlertStore } from '@/stores/alert'
import { formatCurrency, getValueColorClass } from '@/utils/format'

const alertStore = useAlertStore()

const timeRange = ref('30d')
const loading = ref(true)

const analytics = reactive({
  totalProfit: 0,
  profitChange: 0,
  winRate: 0,
  winRateChange: 0,
  totalTrades: 0,
  avgTradesPerDay: 0,
  newsProcessed: 0,
  triggerRate: 0,
  winCount: 0,
  lossCount: 0,
  profitChart: [],
  newsTypeAnalysis: [],
  topSymbols: [],
  worstSymbols: [],
  hourlyAnalysis: []
})

const chartMin = computed(() => {
  if (!analytics.profitChart?.length) return 0
  return Math.min(...analytics.profitChart.map(p => p.value))
})

const chartMax = computed(() => {
  if (!analytics.profitChart?.length) return 0
  return Math.max(...analytics.profitChart.map(p => p.value))
})

const maxHourProfit = computed(() => {
  if (!analytics.hourlyAnalysis?.length) return 1
  return Math.max(...analytics.hourlyAnalysis.map(h => Math.abs(h.profit))) || 1
})

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

function getRecommendationText(rec) {
  const map = { KEEP: '保持', ADJUST: '调整', DISABLE: '禁用' }
  return map[rec] || rec
}

async function loadAnalytics() {
  loading.value = true
  try {
    // 获取策略统计分析
    const response = await api.get('/analysis/strategies', { params: { range: timeRange.value } })
    if (response.success && response.data) {
      Object.assign(analytics, response.data)
    }
    // 获取最佳卖出点数据
    const optimalRes = await api.get('/analysis/optimal-sell')
    if (optimalRes.success && optimalRes.data) {
      analytics.optimalSellData = optimalRes.data
    }
  } catch (error) {
    console.error('加载分析数据失败:', error)
    alertStore.error('加载分析数据失败，请检查后端API')
  } finally {
    loading.value = false
  }
}

onMounted(loadAnalytics)
</script>

<style scoped>
.analytics-page { max-width: 1400px; margin: 0 auto; }
.header-actions .form-input { width: auto; }
.stat-change { font-size: 0.75rem; margin-top: 0.25rem; }
.stat-change.positive { color: var(--success-color); }
.stat-change.negative { color: var(--danger-color); }
.stat-change.neutral { color: var(--text-muted); }
.chart-container { height: 200px; }
.chart-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
.simple-chart { height: 100%; position: relative; padding-bottom: 24px; }
.chart-line { position: relative; height: calc(100% - 24px); border-bottom: 1px solid var(--border-color); }
.chart-point { position: absolute; width: 8px; height: 8px; background: var(--primary-color); border-radius: 50%; transform: translate(-50%, 50%); cursor: pointer; }
.chart-point:hover { transform: translate(-50%, 50%) scale(1.5); }
.chart-labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; }

.dist-bar { display: flex; height: 32px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 1rem; }
.dist-win { background: var(--success-color); display: flex; align-items: center; justify-content: center; min-width: 60px; }
.dist-loss { background: var(--danger-color); display: flex; align-items: center; justify-content: center; min-width: 60px; }
.dist-label { color: white; font-size: 0.8125rem; font-weight: 500; }
.dist-details { display: flex; flex-direction: column; gap: 0.5rem; }
.dist-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
.dist-dot { width: 12px; height: 12px; border-radius: 50%; }
.dist-dot.win { background: var(--success-color); }
.dist-dot.loss { background: var(--danger-color); }
.dist-value { margin-left: auto; font-weight: 500; }
.symbol-list { display: flex; flex-direction: column; gap: 0.75rem; }
.symbol-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: var(--bg-tertiary); border-radius: var(--radius-md); }
.symbol-rank { width: 28px; height: 28px; background: var(--success-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; }
.symbol-rank.worst { background: var(--danger-color); }
.symbol-info { flex: 1; }
.symbol-name { display: block; font-weight: 600; }
.symbol-trades { font-size: 0.75rem; color: var(--text-muted); }
.symbol-profit { font-weight: 600; }
.time-analysis { display: flex; gap: 4px; padding: 1rem 0; overflow-x: auto; }
.hour-item { display: flex; flex-direction: column; align-items: center; min-width: 32px; }
.hour-label { font-size: 0.625rem; color: var(--text-muted); margin-bottom: 4px; }
.hour-bar-container { height: 60px; display: flex; align-items: flex-end; }
.hour-bar { width: 20px; border-radius: 2px 2px 0 0; min-height: 2px; }
.hour-bar.positive { background: var(--success-color); }
.hour-bar.negative { background: var(--danger-color); }
.hour-trades { font-size: 0.625rem; color: var(--text-muted); margin-top: 4px; }
.time-legend { display: flex; gap: 1.5rem; margin-top: 1rem; font-size: 0.8125rem; color: var(--text-secondary); }
.legend-dot { display: inline-block; width: 12px; height: 12px; border-radius: 2px; margin-right: 0.25rem; vertical-align: middle; }
.legend-dot.positive { background: var(--success-color); }
.legend-dot.negative { background: var(--danger-color); }
.legend-note { margin-left: auto; color: var(--text-muted); }
.text-success { color: var(--success-color); }
.text-danger { color: var(--danger-color); }
@media (max-width: 768px) { .time-analysis { justify-content: flex-start; } }
</style>