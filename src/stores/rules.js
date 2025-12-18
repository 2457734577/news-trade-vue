import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'

export const useRulesStore = defineStore('rules', () => {
  const rules = ref([])
  const loading = ref(false)
  const currentRule = ref(null)
  const statistics = ref({})

  const enabledRules = computed(() => rules.value.filter(r => r.enabled))
  const disabledRules = computed(() => rules.value.filter(r => !r.enabled))

  async function fetchRules() {
    loading.value = true
    try {
      const response = await api.get('/api/strategies')
      rules.value = response.data
    } catch (error) {
      console.error('获取策略列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function getRule(id) {
    loading.value = true
    try {
      const response = await api.get(`/api/strategies/${id}`)
      currentRule.value = response.data
      return response.data
    } catch (error) {
      console.error('获取策略详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createRule(data) {
    loading.value = true
    try {
      const response = await api.post('/api/strategies', data)
      rules.value.push(response.data)
      return response.data
    } catch (error) {
      console.error('创建策略失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateRule(id, data) {
    loading.value = true
    try {
      const response = await api.put(`/api/strategies/${id}`, data)
      const index = rules.value.findIndex(r => r.id === id)
      if (index !== -1) {
        rules.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('更新策略失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteRule(id) {
    loading.value = true
    try {
      await api.delete(`/api/strategies/${id}`)
      rules.value = rules.value.filter(r => r.id !== id)
    } catch (error) {
      console.error('删除策略失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function toggleRule(id, enabled) {
    try {
      const response = await api.patch(`/api/strategies/${id}/toggle`, { enabled })
      const index = rules.value.findIndex(r => r.id === id)
      if (index !== -1) {
        rules.value[index].enabled = enabled
      }
      return response.data
    } catch (error) {
      console.error('切换策略状态失败:', error)
      throw error
    }
  }

  async function testRule(ruleData, newsText) {
    try {
      const response = await api.post('/api/strategies/test', { rule: ruleData, news: newsText })
      return response.data
    } catch (error) {
      console.error('测试策略失败:', error)
      throw error
    }
  }

  async function fetchRuleStatistics(id) {
    try {
      const response = await api.get(`/api/strategies/${id}/statistics`)
      statistics.value[id] = response.data
      return response.data
    } catch (error) {
      console.error('获取策略统计失败:', error)
      throw error
    }
  }

  async function refreshCache() {
    try {
      await api.post('/api/strategies/refresh-cache')
    } catch (error) {
      console.error('刷新缓存失败:', error)
      throw error
    }
  }

  return {
    rules,
    loading,
    currentRule,
    statistics,
    enabledRules,
    disabledRules,
    fetchRules,
    getRule,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    testRule,
    fetchRuleStatistics,
    refreshCache
  }
})