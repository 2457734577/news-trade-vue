<template>
  <div class="assets-view">
    <div class="page-header">
      <h1 class="page-title">💰 我的资产</h1>
      <div class="header-actions">
        <button @click="refreshAssets" class="btn btn-primary" :disabled="loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          刷新资产
        </button>
        <router-link to="/user/accounts/add" class="btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          添加账户
        </router-link>
      </div>
    </div>

    <AssetSummary 
      :summary="assetSummary" 
      @refresh="refreshAssets"
    />

    <div class="content-section">
      <div class="section-header">
        <h2>资产趋势</h2>
        <div class="section-actions">
          <button 
            v-for="period in periods" 
            :key="period.value"
            @click="selectedPeriod = period.value"
            :class="['period-btn', { active: selectedPeriod === period.value }]"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
      <AssetChart :data="chartData" />
    </div>

    <div class="content-section">
      <div class="section-header">
        <h2>交易所账户</h2>
        <div class="filter-tabs">
          <button 
            @click="exchangeFilter = 'all'"
            :class="['filter-tab', { active: exchangeFilter === 'all' }]"
          >
            全部
          </button>
          <button 
            v-for="exchange in exchanges" 
            :key="exchange"
            @click="exchangeFilter = exchange"
            :class="['filter-tab', { active: exchangeFilter === exchange }]"
          >
            {{ exchange }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="filteredAccounts.length === 0" class="empty-state">
        <div class="empty-icon">💼</div>
        <h3>暂无账户</h3>
        <p>添加您的第一个交易所账户</p>
        <router-link to="/user/accounts/add" class="btn btn-primary">添加账户</router-link>
      </div>

      <div v-else class="assets-grid">
        <AssetCard
          v-for="account in filteredAccounts"
          :key="account.accountId"
          :account="account"
          :exchangeType="account.exchangeType"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAssetsStore } from '@/stores/assets'
import AssetSummary from '@/components/assets/AssetSummary.vue'
import AssetChart from '@/components/assets/AssetChart.vue'
import AssetCard from '@/components/assets/AssetCard.vue'

const assetsStore = useAssetsStore()

const loading = ref(false)
const selectedPeriod = ref('7d')
const exchangeFilter = ref('all')

const periods = [
  { label: '24小时', value: '24h' },
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' },
  { label: '90天', value: '90d' }
]

const exchanges = ['Binance', 'Bybit', 'Bitget', 'Gate.io']

const assetSummary = computed(() => ({
  totalAssets: assetsStore.totalAssets,
  totalSpot: assetsStore.totalSpotBalance,
  totalFutures: assetsStore.totalFuturesBalance,
  totalFunding: assetsStore.totalFundingBalance,
  dailyChange: 2.34
}))

const chartData = computed(() => {
  return []
})

const filteredAccounts = computed(() => {
  if (exchangeFilter.value === 'all') {
    return assetsStore.accounts
  }
  return assetsStore.accounts.filter(
    account => account.exchangeName === exchangeFilter.value
  )
})

async function refreshAssets() {
  loading.value = true
  try {
    await assetsStore.refreshAssets()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  assetsStore.fetchBalances()
})
</script>

<style scoped>
.assets-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f7fafc;
  border-color: #667eea;
}

.content-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 8px;
}

.period-btn {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #4a5568;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.period-btn:hover {
  background: #f7fafc;
}

.period-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #f7fafc;
  color: #4a5568;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab:hover {
  background: #edf2f7;
}

.filter-tab.active {
  background: #667eea;
  color: white;
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #718096;
  margin: 0 0 24px 0;
}

@media (max-width: 768px) {
  .assets-view {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .assets-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-tabs {
    flex-wrap: wrap;
  }
}
</style>