import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/utils/api'

export const useNewsStore = defineStore('news', () => {
  // 状态
  const newsList = ref([])
  const currentNews = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  })
  const filters = ref({
    keyword: '',
    source: '',
    impact: '',
    dateFrom: '',
    dateTo: ''
  })
  
  // 计算属性
  const hasNews = computed(() => newsList.value.length > 0)
  const highImpactNews = computed(() => 
    newsList.value.filter(n => n.impact === 'HIGH')
  )
  const recentNews = computed(() => 
    newsList.value.slice(0, 10)
  )
  
  // 获取新闻列表
  async function fetchNews(params = {}) {
    loading.value = true
    error.value = null
    
    try {
      const queryParams = {
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        ...filters.value,
        ...params
      }
      
      // 移除空值
      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key]) delete queryParams[key]
      })
      
      const response = await api.get('/news', { params: queryParams })
      
      if (response.success) {
        newsList.value = response.data.list || response.data || []
        if (response.data.pagination) {
          pagination.value = response.data.pagination
        }
        return { success: true }
      } else {
        error.value = response.message || '获取新闻失败'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.message || '网络错误'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }
  
  // 获取新闻详情
  async function fetchNewsDetail(newsId) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/news/${newsId}`)
      
      if (response.success) {
        currentNews.value = response.data
        return { success: true, data: response.data }
      } else {
        error.value = response.message || '获取新闻详情失败'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.message || '网络错误'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }
  
  // 获取关联新闻
  async function fetchRelatedNews(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}/news`)
      
      if (response.success) {
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message }
      }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }
  
  // 设置筛选条件
  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1
  }
  
  // 设置页码
  function setPage(page) {
    pagination.value.page = page
  }
  
  // 重置筛选
  function resetFilters() {
    filters.value = {
      keyword: '',
      source: '',
      impact: '',
      dateFrom: '',
      dateTo: ''
    }
    pagination.value.page = 1
  }
  
  // 清空当前新闻
  function clearCurrentNews() {
    currentNews.value = null
  }
  
  return {
    // 状态
    newsList,
    currentNews,
    loading,
    error,
    pagination,
    filters,
    // 计算属性
    hasNews,
    highImpactNews,
    recentNews,
    // 方法
    fetchNews,
    fetchNewsDetail,
    fetchRelatedNews,
    setFilters,
    setPage,
    resetFilters,
    clearCurrentNews
  }
})