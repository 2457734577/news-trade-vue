import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'

export const useBacktestStore = defineStore('backtest', () => {
  const backtests = ref([])
  const loading = ref(false)
  const currentBacktest = ref(null)
  const klineData = ref(null)
  const analysisResult = ref(null)

  async function fetchBacktests(params = {}) {
    loading.value = true
    try {
      const response = await api.get('/api/backtest/news', { params })
      backtests.value = response.data.data || response.data
      return response.data
    } catch (error) {
      console.error('获取回测列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function getBacktest(id) {
    loading.value = true
    try {
      const response = await api.get(`/api/backtest/news/${id}`)
      currentBacktest.value = response.data
      return response.data
    } catch (error) {
      console.error('获取回测详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createBacktest(data) {
    loading.value = true
    try {
      // 提交新闻信息，后端自动抓取K线数据
      const response = await api.post('/api/backtest/news', data)
      backtests.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('创建回测数据失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchKlineData(newsId) {
    loading.value = true
    try {
      const response = await api.get(`/api/backtest/news/${newsId}/kline`)
      klineData.value = response.data
      return response.data
    } catch (error) {
      console.error('获取K线数据失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function analyzeNews(newsId) {
    loading.value = true
    try {
      const response = await api.post(`/api/backtest/analyze/news/${newsId}`)
      analysisResult.value = response.data
      return response.data
    } catch (error) {
      console.error('分析单条新闻失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function analyzeStrategy(strategyId) {
    loading.value = true
    try {
      const response = await api.post(`/api/backtest/analyze/strategy/${strategyId}`)
      return response.data
    } catch (error) {
      console.error('分析策略失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function analyzeBestExit(newsId) {
    loading.value = true
    try {
      const response = await api.post(`/api/backtest/analyze/best-exit/${newsId}`)
      return response.data
    } catch (error) {
      console.error('计算最佳卖出点失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function batchAnalyze(newsIds) {
    loading.value = true
    try {
      const response = await api.post('/api/backtest/analyze/batch', { newsIds })
      return response.data
    } catch (error) {
      console.error('批量分析失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function analyzeAllStrategies() {
    loading.value = true
    try {
      const response = await api.post('/api/backtest/analyze/all-strategies')
      return response.data
    } catch (error) {
      console.error('分析所有策略失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteBacktest(id) {
    loading.value = true
    try {
      await api.delete(`/api/backtest/news/${id}`)
      backtests.value = backtests.value.filter(b => b.id !== id)
    } catch (error) {
      console.error('删除回测数据失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  function clearAnalysis() {
    analysisResult.value = null
    klineData.value = null
  }

  return {
    backtests,
    loading,
    currentBacktest,
    klineData,
    analysisResult,
    fetchBacktests,
    getBacktest,
    createBacktest,
    fetchKlineData,
    analyzeNews,
    analyzeStrategy,
    analyzeBestExit,
    batchAnalyze,
    analyzeAllStrategies,
    deleteBacktest,
    clearAnalysis
  }
})