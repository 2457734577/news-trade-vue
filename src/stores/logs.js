import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'

export const useLogsStore = defineStore('logs', () => {
  const logs = ref([])
  const loading = ref(false)
  const pagination = ref({
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0
  })
  const filters = ref({
    level: '',
    type: '',
    keyword: '',
    startDate: '',
    endDate: ''
  })

  async function fetchLogs(page = 1) {
    loading.value = true
    try {
      const params = {
        page,
        pageSize: pagination.value.pageSize,
        ...filters.value
      }
      const response = await api.get('/api/logs', { params })
      logs.value = response.data.data
      pagination.value = {
        page: response.data.page,
        pageSize: response.data.pageSize,
        total: response.data.total,
        totalPages: response.data.totalPages
      }
    } catch (error) {
      console.error('获取日志失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function getLogDetail(id) {
    try {
      const response = await api.get(`/api/logs/${id}`)
      return response.data
    } catch (error) {
      console.error('获取日志详情失败:', error)
      throw error
    }
  }

  async function clearLogs(type = null) {
    try {
      const params = type ? { type } : {}
      await api.delete('/api/logs', { params })
      await fetchLogs(1)
    } catch (error) {
      console.error('清空日志失败:', error)
      throw error
    }
  }

  async function exportLogs() {
    try {
      const params = { ...filters.value }
      const response = await api.get('/api/logs/export', { 
        params,
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('导出日志失败:', error)
      throw error
    }
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function resetFilters() {
    filters.value = {
      level: '',
      type: '',
      keyword: '',
      startDate: '',
      endDate: ''
    }
  }

  function setPage(page) {
    pagination.value.page = page
  }

  return {
    logs,
    loading,
    pagination,
    filters,
    fetchLogs,
    getLogDetail,
    clearLogs,
    exportLogs,
    setFilters,
    resetFilters,
    setPage
  }
})