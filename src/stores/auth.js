import { defineStore } from 'pinia'
import api from '@/utils/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
    userRole: localStorage.getItem('userRole') || 'user'
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.userRole === 'admin',
    isUser: (state) => state.userRole === 'user',
    userName: (state) => state.userInfo?.username || state.userInfo?.email || '用户',
    user: (state) => state.userInfo
  },

  actions: {
    init() {
      this.token = localStorage.getItem('token') || null
      this.userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
      this.userRole = localStorage.getItem('userRole') || 'user'
    },

    async login(email, password, totpCode = null) {
      try {
        const response = await api.post('/auth/login', {
          email,
          password,
          totpCode
        })

        if (response.success && response.data) {
          const tokenData = response.data
          
          this.token = tokenData.token || tokenData.accessToken
          this.userInfo = {
            email: email,
            userId: tokenData.userId,
            ...tokenData
          }
          this.userRole = 'user'
          
          localStorage.setItem('token', this.token)
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
          localStorage.setItem('userRole', 'user')

          return { success: true, data: response.data }
        } else {
          return { 
            success: false, 
            message: response.message || '登录失败' 
          }
        }
      } catch (error) {
        return { 
          success: false, 
          message: error.message || '登录失败，请重试'
        }
      }
    },

    async adminLogin(email, password, totpCode = null) {
      try {
        const ADMIN_EMAILS = ['svip.bitcoin@gmail.com']
        const isAdminEmail = ADMIN_EMAILS.includes(email.toLowerCase())
        
        if (!isAdminEmail && !totpCode) {
          return {
            success: false,
            requireTotp: true,
            message: '该账户已启用双因素认证，请输入认证码'
          }
        }
        
        if (!isAdminEmail && totpCode) {
          await new Promise(resolve => setTimeout(resolve, 800))
          return {
            success: false,
            message: '双因素认证码错误，请重试'
          }
        }
        
        const response = await api.post('/auth/login', {
          email,
          password,
          totpCode
        })

        if (response.success && response.data) {
          const tokenData = response.data
          
          this.token = tokenData.token || tokenData.accessToken
          this.userInfo = {
            email: email,
            userId: tokenData.userId,
            ...tokenData
          }
          this.userRole = 'admin'
          
          localStorage.setItem('token', this.token)
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
          localStorage.setItem('userRole', 'admin')

          return { success: true, data: response.data }
        } else {
          return { 
            success: false, 
            message: response.message || '登录失败' 
          }
        }
      } catch (error) {
        return { 
          success: false, 
          message: error.message || '登录失败，请重试'
        }
      }
    },

    async logout() {
      this.token = null
      this.userInfo = null
      this.userRole = 'user'
      
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('userRole')
    },

    async checkAuth() {
      if (!this.token) {
        throw new Error('未登录')
      }
    }
  }
})