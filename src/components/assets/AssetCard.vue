<template>
  <div class="asset-card" :class="`asset-card-${exchangeType.toLowerCase()}`">
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="exchange-info">
        <div class="exchange-icon">
          {{ getExchangeIcon(exchangeType) }}
        </div>
        <div class="exchange-details">
          <h3 class="exchange-name">{{ getExchangeName(exchangeType) }}</h3>
          <span class="account-label">账户ID: {{ formatAccountId(account.accountId) }}</span>
        </div>
      </div>
      
      <button @click="refreshAsset" class="refresh-btn" :disabled="refreshing">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
          :class="{ 'spinning': refreshing }"
        >
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
      </button>
    </div>

    <!-- 总资产 -->
    <div class="total-asset">
      <div class="asset-label">总资产</div>
      <div class="asset-value">
        <span class="currency">$</span>
        <span class="amount">{{ formatCurrency(account.totalAsset) }}</span>
      </div>
      <div 
        v-if="account.unrealizedPnl" 
        class="unrealized-pnl"
        :class="account.unrealizedPnl >= 0 ? 'positive' : 'negative'"
      >
        <span>{{ account.unrealizedPnl >= 0 ? '+' : '' }}{{ formatCurrency(account.unrealizedPnl) }}</span>
        <span class="pnl-label">未实现盈亏</span>
      </div>
    </div>

    <!-- 账户分类 -->
    <div class="account-types">
      <!-- 现货 -->
      <div class="account-type">
        <div class="type-icon spot">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        <div class="type-info">
          <div class="type-label">现货</div>
          <div class="type-value">${{ formatCurrency(account.spotBalance) }}</div>
        </div>
      </div>

      <!-- 合约 -->
      <div class="account-type">
        <div class="type-icon futures">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="type-info">
          <div class="type-label">合约</div>
          <div class="type-value">${{ formatCurrency(account.futuresBalance) }}</div>
        </div>
      </div>

      <!-- 资金 -->
      <div class="account-type">
        <div class="type-icon funding">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M7 15h0M2 9.5h20"/>
          </svg>
        </div>
        <div class="type-info">
          <div class="type-label">资金</div>
          <div class="type-value">${{ formatCurrency(account.fundingBalance) }}</div>
        </div>
      </div>
    </div>

    <!-- 保证金信息（仅合约） -->
    <div v-if="account.marginUsed || account.availableMargin" class="margin-info">
      <div class="margin-item">
        <span class="margin-label">占用保证金</span>
        <span class="margin-value">${{ formatCurrency(account.marginUsed) }}</span>
      </div>
      <div class="margin-item">
        <span class="margin-label">可用保证金</span>
        <span class="margin-value available">${{ formatCurrency(account.availableMargin) }}</span>
      </div>
    </div>

    <!-- 详细资产列表 -->
    <div v-if="expanded && account.assets && account.assets.length > 0" class="asset-details">
      <div class="details-header">
        <span>币种</span>
        <span>可用</span>
        <span>冻结</span>
        <span>估值(USDT)</span>
      </div>
      <div class="details-list">
        <div v-for="asset in account.assets" :key="asset.coin" class="asset-item">
          <span class="asset-coin">{{ asset.coin }}</span>
          <span class="asset-free">{{ formatAmount(asset.free) }}</span>
          <span class="asset-locked">{{ formatAmount(asset.locked) }}</span>
          <span class="asset-value">${{ formatCurrency(asset.usdtValue) }}</span>
        </div>
      </div>
    </div>

    <!-- 展开/收起按钮 -->
    <button 
      v-if="account.assets && account.assets.length > 0"
      @click="toggleExpand" 
      class="expand-btn"
    >
      {{ expanded ? '收起详情' : '查看详情' }}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
        :class="{ 'rotated': expanded }"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAssetsStore } from '@/stores/assets'

const props = defineProps({
  account: {
    type: Object,
    required: true
  },
  exchangeType: {
    type: String,
    required: true
  }
})

const assetsStore = useAssetsStore()

// 状态
const expanded = ref(false)
const refreshing = ref(false)

// 方法

/**
 * 获取交易所图标
 */
function getExchangeIcon(exchange) {
  const icons = {
    'BINANCE': '🟡',
    'BYBIT': '🟠',
    'BITGET': '🔵',
    'GATE': '🟢'
  }
  return icons[exchange] || '💱'
}

/**
 * 获取交易所名称
 */
function getExchangeName(exchange) {
  const names = {
    'BINANCE': 'Binance',
    'BYBIT': 'Bybit',
    'BITGET': 'Bitget',
    'GATE': 'Gate.io'
  }
  return names[exchange] || exchange
}

/**
 * 格式化账户ID
 */
function formatAccountId(id) {
  if (!id) return ''
  return id.length > 8 ? `${id.substring(0, 8)}...` : id
}

/**
 * 格式化货币金额
 */
function formatCurrency(value) {
  if (value === undefined || value === null) return '0.00'
  return Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化数量
 */
function formatAmount(value) {
  if (value === undefined || value === null) return '0'
  const num = Number(value)
  if (num === 0) return '0'
  if (num < 0.01) return num.toExponential(2)
  return num.toFixed(num < 1 ? 4 : 2)
}

/**
 * 刷新资产
 */
async function refreshAsset() {
  refreshing.value = true
  try {
    await assetsStore.fetchAccountAsset(props.account.accountId)
  } finally {
    refreshing.value = false
  }
}

/**
 * 切换展开状态
 */
function toggleExpand() {
  expanded.value = !expanded.value
}
</script>

<style scoped>
.asset-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.asset-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 交易所主题色 */
.asset-card-binance { border-top: 4px solid #f3ba2f; }
.asset-card-bybit { border-top: 4px solid #f7a600; }
.asset-card-bitget { border-top: 4px solid #00d4ff; }
.asset-card-gate { border-top: 4px solid #2354e6; }

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.exchange-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.exchange-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.exchange-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.exchange-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.account-label {
  font-size: 12px;
  color: #718096;
}

.refresh-btn {
  width: 36px;
  height: 36px;
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

.refresh-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #667eea;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn svg.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 总资产 */
.total-asset {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.asset-label {
  font-size: 14px;
  color: #718096;
  margin-bottom: 8px;
}

.asset-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.currency {
  font-size: 20px;
  color: #4a5568;
  font-weight: 500;
}

.amount {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
}

.unrealized-pnl {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
}

.unrealized-pnl.positive { color: #48bb78; }
.unrealized-pnl.negative { color: #f56565; }

.pnl-label {
  font-weight: 400;
  font-size: 12px;
  color: #718096;
}

/* 账户类型 */
.account-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.account-type {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 12px;
}

.type-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.type-icon.spot { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.type-icon.futures { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.type-icon.funding { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

.type-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.type-label {
  font-size: 12px;
  color: #718096;
}

.type-value {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

/* 保证金信息 */
.margin-info {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background: #edf2f7;
  border-radius: 12px;
  margin-bottom: 20px;
}

.margin-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.margin-label {
  font-size: 12px;
  color: #718096;
}

.margin-value {
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
}

.margin-value.available {
  color: #48bb78;
}

/* 资产详情 */
.asset-details {
  margin-top: 20px;
  border-top: 1px solid #e2e8f0;
  padding-top: 20px;
}

.details-header {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 2fr;
  gap: 16px;
  padding: 12px 16px;
  background: #f7fafc;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  margin-bottom: 8px;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.asset-item {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 2fr;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  transition: background 0.2s;
}

.asset-item:hover {
  background: #f7fafc;
}

.asset-coin {
  font-weight: 600;
  color: #2d3748;
}

.asset-free,
.asset-locked {
  color: #4a5568;
}

.asset-value {
  font-weight: 600;
  color: #667eea;
}

/* 展开按钮 */
.expand-btn {
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.expand-btn:hover {
  background: #f7fafc;
  border-color: #667eea;
}

.expand-btn svg {
  transition: transform 0.3s;
}

.expand-btn svg.rotated {
  transform: rotate(180deg);
}

/* 响应式 */
@media (max-width: 768px) {
  .asset-card {
    padding: 16px;
  }
  
  .amount {
    font-size: 24px;
  }
  
  .account-types {
    grid-template-columns: 1fr;
  }
  
  .margin-info {
    flex-direction: column;
    gap: 12px;
  }
  
  .details-header,
  .asset-item {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    font-size: 12px;
    gap: 8px;
    padding: 8px 12px;
  }
}
</style>
