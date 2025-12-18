import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref([])
  const loading = ref(false)
  const currentAccount = ref(null)

  async function fetchAccounts() {
    loading.value = true
    try {
      const response = await api.get('/api/accounts')
      accounts.value = response.data
    } catch (error) {
      console.error('获取账户列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function getAccount(id) {
    loading.value = true
    try {
      const response = await api.get(`/api/accounts/${id}`)
      currentAccount.value = response.data
      return response.data
    } catch (error) {
      console.error('获取账户详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createAccount(data) {
    loading.value = true
    try {
      const response = await api.post('/api/accounts', data)
      accounts.value.push(response.data)
      return response.data
    } catch (error) {
      console.error('创建账户失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateAccount(id, data) {
    loading.value = true
    try {
      const response = await api.put(`/api/accounts/${id}`, data)
      const index = accounts.value.findIndex(acc => acc.id === id)
      if (index !== -1) {
        accounts.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('更新账户失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteAccount(id) {
    loading.value = true
    try {
      await api.delete(`/api/accounts/${id}`)
      accounts.value = accounts.value.filter(acc => acc.id !== id)
    } catch (error) {
      console.error('删除账户失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function testConnection(id) {
    try {
      const response = await api.post(`/api/accounts/${id}/test`)
      return response.data
    } catch (error) {
      console.error('测试连接失败:', error)
      throw error
    }
  }

  return {
    accounts,
    loading,
    currentAccount,
    fetchAccounts,
    getAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    testConnection
  }
})