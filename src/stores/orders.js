import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/utils/api'

export const useOrdersStore = defineStore('orders', () => {
  // 状态
  const orders = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  })
  const filters = ref({
    status: '',
    symbol: '',
    dateFrom: '',
    dateTo: ''
  })
  
  // 计算属性
  const hasOrders = computed(() => orders.value.length > 0)
  const activeOrders = computed(() => 
    orders.value.filter(o => o.status === 'OPEN' || o.status === 'PENDING')
  )
  const completedOrders = computed(() => 
    orders.value.filter(o => o.status === 'CLOSED' || o.status === 'CANCELLED')
  )
  
  // 获取订单列表
  async function fetchOrders(params = {}) {
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
      
      const response = await api.get('/orders', { params: queryParams })
      
      if (response.success) {
        orders.value = response.data.list || response.data || []
        if (response.data.pagination) {
          pagination.value = response.data.pagination
        }
        return { success: true }
      } else {
        error.value = response.message || '获取订单失败'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.message || '网络错误'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }
  
  // 获取订单详情
  async function fetchOrderDetail(orderId) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/orders/${orderId}`)
      
      if (response.success) {
        currentOrder.value = response.data
        return { success: true, data: response.data }
      } else {
        error.value = response.message || '获取订单详情失败'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.message || '网络错误'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }
  
  // 关闭订单
  async function closeOrder(orderId) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post(`/orders/${orderId}/close`)
      
      if (response.success) {
        // 更新本地订单状态
        const index = orders.value.findIndex(o => o.id === orderId)
        if (index !== -1) {
          orders.value[index] = { ...orders.value[index], status: 'CLOSED' }
        }
        if (currentOrder.value?.id === orderId) {
          currentOrder.value = { ...currentOrder.value, status: 'CLOSED' }
        }
        return { success: true }
      } else {
        error.value = response.message || '关闭订单失败'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.message || '网络错误'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }
  
  // 取消订单
  async function cancelOrder(orderId) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post(`/orders/${orderId}/cancel`)
      
      if (response.success) {
        // 更新本地订单状态
        const index = orders.value.findIndex(o => o.id === orderId)
        if (index !== -1) {
          orders.value[index] = { ...orders.value[index], status: 'CANCELLED' }
        }
        if (currentOrder.value?.id === orderId) {
          currentOrder.value = { ...currentOrder.value, status: 'CANCELLED' }
        }
        return { success: true }
      } else {
        error.value = response.message || '取消订单失败'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.message || '网络错误'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
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
      status: '',
      symbol: '',
      dateFrom: '',
      dateTo: ''
    }
    pagination.value.page = 1
  }
  
  // 清空当前订单
  function clearCurrentOrder() {
    currentOrder.value = null
  }
  
  return {
    // 状态
    orders,
    currentOrder,
    loading,
    error,
    pagination,
    filters,
    // 计算属性
    hasOrders,
    activeOrders,
    completedOrders,
    // 方法
    fetchOrders,
    fetchOrderDetail,
    closeOrder,
    cancelOrder,
    setFilters,
    setPage,
    resetFilters,
    clearCurrentOrder
  }
})