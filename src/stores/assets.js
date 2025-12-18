import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'

export const useAssetsStore = defineStore('assets', () => {
  // 状态
  const balancesData = ref(null) // 存储完整的balances响应数据
  const accounts = ref([]) // 账户余额列表
  const loading = ref(false)
  const error = ref(null)
  const lastUpdate = ref(null)
  
  // 计算属性
  
  /**
   * 总资产（USDT）
   */
  const totalAssets = computed(() => {
    return balancesData.value?.totalAssets || 0
  })
  
  /**
   * 现货总余额
   */
  const totalSpotBalance = computed(() => {
    return balancesData.value?.totalSpot || 0
  })
  
  /**
   * 合约总余额
   */
  const totalFuturesBalance = computed(() => {
    return balancesData.value?.totalFutures || 0
  })
  
  /**
   * 资金账户总余额
   */
  const totalFundingBalance = computed(() => {
    return balancesData.value?.totalFunding || 0
  })
  
  /**
   * 未实现盈亏总额
   */
  const totalUnrealizedPnl = computed(() => {
    return accounts.value.reduce((sum, account) => {
      return sum + (account.unrealizedPnl || 0)
    }, 0)
  })
  
  /**
   * 可用保证金总额
   */
  const totalAvailableMargin = computed(() => {
    return accounts.value.reduce((sum, account) => {
      return sum + (account.futuresAvailable || 0)
    }, 0)
  })
  
  /**
   * 按交易所分组的资产
   */
  const assetsByExchange = computed(() => {
    const grouped = {}
    accounts.value.forEach(account => {
      const exchange = account.exchangeType || 'UNKNOWN'
      if (!grouped[exchange]) {
        grouped[exchange] = []
      }
      grouped[exchange].push(account)
    })
    return grouped
  })
  
  /**
   * 资产汇总统计
   */
  const assetSummary = computed(() => {
    return {
      total: totalAssets.value,
      spot: totalSpotBalance.value,
      futures: totalFuturesBalance.value,
      funding: totalFundingBalance.value,
      unrealizedPnl: totalUnrealizedPnl.value,
      availableMargin: totalAvailableMargin.value,
      accountCount: accounts.value.length,
      exchanges: Object.keys(assetsByExchange.value).length
    }
  })

  // 方法
  
  /**
   * 获取所有账户余额汇总
   */
  async function fetchBalances() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/account/balances')
      
      if (response.success && response.data) {
        balancesData.value = response.data
        accounts.value = response.data.accounts || []
        
        // 处理spotAssets，转换为assets数组格式
        accounts.value.forEach(account => {
          if (account.spotAssets) {
            account.assets = Object.entries(account.spotAssets).map(([coin, amount]) => ({
              coin,
              free: amount,
              locked: 0,
              usdtValue: amount // 简化处理，实际需要价格转换
            }))
          }
        })
        
        lastUpdate.value = response.data.updateTime 
          ? new Date(response.data.updateTime) 
          : new Date()
          
        return { success: true, data: response.data }
      } else {
        error.value = response.message || '获取资产失败'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.message || '网络错误'
      console.error('获取资产失败:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取单个账户余额
   */
  async function fetchAccountBalance(accountId) {
    try {
      const response = await api.get(`/account/${accountId}/balance`)
      
      if (response.success && response.data) {
        // 更新本地状态中的该账户
        const index = accounts.value.findIndex(a => a.accountId === accountId)
        if (index !== -1) {
          // 处理spotAssets
          if (response.data.spotAssets) {
            response.data.assets = Object.entries(response.data.spotAssets).map(([coin, amount]) => ({
              coin,
              free: amount,
              locked: 0,
              usdtValue: amount
            }))
          }
          accounts.value[index] = response.data
        } else {
          accounts.value.push(response.data)
        }
        
        // 更新汇总数据
        recalculateTotals()
        
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '获取账户余额失败' }
      }
    } catch (err) {
      console.error('获取账户余额失败:', err)
      return { success: false, message: err.message || '网络错误' }
    }
  }
  
  /**
   * 刷新单个账户余额
   */
  async function refreshAccountBalance(accountId) {
    try {
      const response = await api.post(`/account/${accountId}/refresh-balance`)
      
      if (response.success) {
        // 刷新成功后，重新获取余额
        await fetchAccountBalance(accountId)
        return { success: true }
      } else {
        return { success: false, message: response.message || '刷新失败' }
      }
    } catch (err) {
      console.error('刷新账户余额失败:', err)
      return { success: false, message: err.message || '网络错误' }
    }
  }
  
  /**
   * 刷新所有资产（强制从服务器获取最新数据）
   */
  async function refreshAssets() {
    return await fetchBalances()
  }
  
  /**
   * 重新计算汇总数据（当单个账户更新后）
   */
  function recalculateTotals() {
    if (balancesData.value) {
      balancesData.value.totalAssets = accounts.value.reduce((sum, acc) => sum + (acc.totalBalance || 0), 0)
      balancesData.value.totalSpot = accounts.value.reduce((sum, acc) => sum + (acc.spotBalance || 0), 0)
      balancesData.value.totalFutures = accounts.value.reduce((sum, acc) => sum + (acc.futuresBalance || 0), 0)
      balancesData.value.totalFunding = accounts.value.reduce((sum, acc) => sum + (acc.fundingBalance || 0), 0)
      balancesData.value.updateTime = Date.now()
    }
  }
  
  /**
   * 清空资产数据
   */
  function clearAssets() {
    balancesData.value = null
    accounts.value = []
    error.value = null
    lastUpdate.value = null
  }
  
  /**
   * 根据交易所类型获取资产
   */
  function getAssetsByExchange(exchangeType) {
    return accounts.value.filter(account => account.exchangeType === exchangeType)
  }
  
  /**
   * 根据账户ID获取资产
   */
  function getAssetByAccountId(accountId) {
    return accounts.value.find(account => account.accountId === accountId)
  }

  return {
    // 状态
    balancesData,
    accounts,
    loading,
    error,
    lastUpdate,
    
    // 计算属性
    totalAssets,
    totalSpotBalance,
    totalFuturesBalance,
    totalFundingBalance,
    totalUnrealizedPnl,
    totalAvailableMargin,
    assetsByExchange,
    assetSummary,
    
    // 方法
    fetchBalances,
    fetchAccountBalance,
    refreshAccountBalance,
    refreshAssets,
    clearAssets,
    getAssetsByExchange,
    getAssetByAccountId
  }
})