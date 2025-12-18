<template>
  <div class="asset-summary">
    <div class="summary-header">
      <h3>资产汇总</h3>
      <button @click="$emit('refresh')" class="refresh-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
      </button>
    </div>
    
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-label">总资产 (USDT)</div>
        <div class="summary-value">${{ formatNumber(summary.totalAssets) }}</div>
        <div class="summary-change" :class="changeClass(summary.dailyChange)">
          {{ summary.dailyChange >= 0 ? '+' : '' }}{{ summary.dailyChange }}%
        </div>
      </div>
      
      <div class="summary-item">
        <div class="summary-label">现货总额</div>
        <div class="summary-value">${{ formatNumber(summary.totalSpot) }}</div>
        <div class="summary-percent">{{ getPercent(summary.totalSpot, summary.totalAssets) }}%</div>
      </div>
      
      <div class="summary-item">
        <div class="summary-label">合约总额</div>
        <div class="summary-value">${{ formatNumber(summary.totalFutures) }}</div>
        <div class="summary-percent">{{ getPercent(summary.totalFutures, summary.totalAssets) }}%</div>
      </div>
      
      <div class="summary-item">
        <div class="summary-label">资金账户</div>
        <div class="summary-value">${{ formatNumber(summary.totalFunding) }}</div>
        <div class="summary-percent">{{ getPercent(summary.totalFunding, summary.totalAssets) }}%</div>
      </div>
    </div>
    
    <div class="exchange-breakdown">
      <h4>交易所分布</h4>
      <div class="breakdown-list">
        <div v-for="item in exchangeBreakdown" :key="item.exchange" class="breakdown-item">
          <div class="breakdown-header">
            <span class="exchange-name">{{ item.exchange }}</span>
            <span class="exchange-value">${{ formatNumber(item.value) }}</span>
          </div>
          <div class="breakdown-bar">
            <div 
              class="breakdown-fill" 
              :style="{ width: getPercent(item.value, summary.totalAssets) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  summary: {
    type: Object,
    required: true
  }
})

defineEmits(['refresh'])

const exchangeBreakdown = computed(() => {
  return [
    { exchange: 'Binance', value: props.summary.totalAssets * 0.45 },
    { exchange: 'Bybit', value: props.summary.totalAssets * 0.30 },
    { exchange: 'Bitget', value: props.summary.totalAssets * 0.15 },
    { exchange: 'Gate.io', value: props.summary.totalAssets * 0.10 }
  ]
})

function formatNumber(value) {
  if (!value) return '0.00'
  return Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function getPercent(part, total) {
  if (!total) return 0
  return ((part / total) * 100).toFixed(1)
}

function changeClass(change) {
  return change >= 0 ? 'positive' : 'negative'
}
</script>

<style scoped>
.asset-summary {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.summary-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.refresh-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #667eea;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: #f7fafc;
  border-color: #667eea;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.summary-item {
  padding: 16px;
  background: #f7fafc;
  border-radius: 12px;
}

.summary-label {
  font-size: 13px;
  color: #718096;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
}

.summary-change {
  font-size: 13px;
  font-weight: 600;
}

.summary-change.positive {
  color: #48bb78;
}

.summary-change.negative {
  color: #f56565;
}

.summary-percent {
  font-size: 13px;
  color: #a0aec0;
}

.exchange-breakdown {
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.exchange-breakdown h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exchange-name {
  font-size: 14px;
  color: #2d3748;
  font-weight: 500;
}

.exchange-value {
  font-size: 14px;
  color: #4a5568;
  font-weight: 600;
}

.breakdown-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.breakdown-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

@media (max-width: 1024px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>