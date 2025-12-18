import axios from 'axios'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 辅助函数：获取 token
const getToken = () => {
  return localStorage.getItem('auth_token') || localStorage.getItem('session_token')
}

// 请求拦截器 - 添加 token
apiClient.interceptors.request.use(
  config => {
    // 登录和注册请求不需要 token
    const isAuthRequest = config.url?.includes('/auth/login') || config.url?.includes('/auth/register')
    
    if (!isAuthRequest) {
      const token = getToken()
      
      if (token) {
        config.headers['Session-Token'] = token
        config.headers['Authorization'] = `Bearer ${token}`
        
        if (config.url?.includes('/orders') || config.url?.includes('/auth')) {
          console.log(`📤 API 请求: ${config.method} ${config.url}`)
          console.log(`🔑 携带 Token: ${token.substring(0, 15)}...`)
        }
      }
    } else {
      console.log(`📤 登录/注册请求: ${config.method} ${config.url} (无Token)`)
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      const { status, data } = error.response
      
      console.error(`请求错误 ${status}:`, data)
      
      if (status === 401) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('session_token')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
      
      return Promise.reject({
        status,
        message: data?.message || '请求失败',
        data
      })
    } else if (error.request) {
      return Promise.reject({
        status: 0,
        message: '网络错误，请检查网络连接'
      })
    } else {
      return Promise.reject({
        status: -1,
        message: error.message || '请求配置错误'
      })
    }
  }
)

// 创建 API 对象
const api = {
  get(url, config = {}) {
    return apiClient.get(url, config)
  },
  
  post(url, data = {}, config = {}) {
    return apiClient.post(url, data, config)
  },
  
  put(url, data = {}, config = {}) {
    return apiClient.put(url, data, config)
  },
  
  patch(url, data = {}, config = {}) {
    return apiClient.patch(url, data, config)
  },
  
  delete(url, config = {}) {
    return apiClient.delete(url, config)
  },
  
  upload(url, file, onProgress = null) {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent)
      } : undefined
    })
  }
}

export default api
export { apiClient }

export const tokenHelper = {
  getToken() {
    return getToken()
  },
  
  setToken(token) {
    if (token) {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('session_token', token)
      apiClient.defaults.headers.common['Session-Token'] = token
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  },
  
  clearToken() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('session_token')
    delete apiClient.defaults.headers.common['Session-Token']
    delete apiClient.defaults.headers.common['Authorization']
  }
}