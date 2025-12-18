import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'

export const useAnalyticsStore = defineStore('analytics', () => {
  const loading = ref(false)
  const overview = ref(null)
  const profitTrend = ref(null)
  const strategyComparison = ref(null)
  const coinPerformance = ref(null)
  const winRateAnalysis = ref(null)
  const timeRange = ref('7d') // 7d, 30d, 90d, all

  async function fetchOverview() {
    loading.value = true
    try {
      const response = await api.get('/api/analytics/overview', {
        params: { timeRange: timeRange.value }
      })
      overview.value = response.data
      return response.data
    } catch (error) {
      console.error('获取概览数据失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchProfitTrend() {
    loading.value = true
    try {
      const response = await api.get('/api/analytics/profit-trend', {
        params: { timeRange: timeRange.value }
      })
      profitTrend.value = response.data
      return response.data
    } catch (error) {
      console.error('获取收益趋势失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchStrategyComparison() {
    loading.value = true
    try {
      const response = await api.get('/api/analytics/strategy-comparison', {
        params: { timeRange: timeRange.value }
      })
      strategyComparison.value = response.data
      return response.data
    } catch (error) {
      console.error('获取策略对比失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchCoinPerformance(limit = 20) {
    loading.value = true
    try {
      const response = await api.get('/api/analytics/coin-performance', {
        params: { 
          timeRange: timeRange.value,
          limit
        }
      })
      coinPerformance.value = response.data
      return response.data
    } catch (error) {
      console.error('获取币种表现失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchWinRateAnalysis() {
    loading.value = true
    try {
      const response = await api.get('/api/analytics/win-rate', {
        params: { timeRange: timeRange.value }
      })
      winRateAnalysis.value = response.data
      return response.data
    } catch (error) {
      console.error('获取胜率分析失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchAllAnalytics() {
    await Promise.all([
      fetchOverview(),
      fetchProfitTrend(),
      fetchStrategyComparison(),
      fetchCoinPerformance(),
      fetchWinRateAnalysis()
    ])
  }

  function setTimeRange(range) {
    timeRange.value = range
  }

  return {
    loading,
    overview,
    profitTrend,
    strategyComparison,
    coinPerformance,
    winRateAnalysis,
    timeRange,
    fetchOverview,
    fetchProfitTrend,
    fetchStrategyComparison,
    fetchCoinPerformance,
    fetchWinRateAnalysis,
    fetchAllAnalytics,
    setTimeRange
  }
})