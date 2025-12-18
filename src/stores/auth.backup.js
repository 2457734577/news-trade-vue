import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(null)
  const userName = ref(localStorage.getItem('userName') || '')
  
  const isAuthenticated = computed(() => !!token.value)
  const isLoggedIn = computed(() => !!token.value)

  async function login(email, password, totpCode = null) {
    try {
      // 后端 LoginRequest 格式
      const payload = {
        email: email,
        password: password,
        totpCode: totpCode || null
      }
      
      console.log('发送登录:', payload)
      
      const response = await api.post('/auth/login', payload)
      
      console.log('后端响应:', response)
      
      // 后端返回 SessionToken 对象
      if (response.success && response.data) {
        const sessionToken = response.data
        
        token.value = sessionToken.sessionId
        user.value = { userId: sessionToken.userId }
        userName.value = email.split('@')[0]
        
        localStorage.setItem('token', sessionToken.sessionId)
        localStorage.setItem('auth_token', sessionToken.sessionId)
        localStorage.setItem('session_token', sessionToken.sessionId)
        localStorage.setItem('userId', sessionToken.userId)
        localStorage.setItem('userName', userName.value)
        
        return { success: true }
      } else {
        return { success: false, message: response.message || '登录失败' }
      }
    } catch (error) {
      console.error('登录错误:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || '登录失败' 
      }
    }
  }

  async function register(userData) {
    try {
      const response = await api.post('/auth/register', userData)
      return { success: response.success, data: response.data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async function checkAuth() {
    if (!token.value) return false
    try {
      const response = await api.get('/auth/me')
      user.value = response.data
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    userName.value = ''
    localStorage.clear()
  }

  function init() {}

  return { token, user, userName, isAuthenticated, isLoggedIn, login, register, checkAuth, logout, init }
})