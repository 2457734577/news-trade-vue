<template>
  <div class="admin-login">
    <div class="login-container">
      <div class="login-header">
        <div class="logo">🔐</div>
        <h1>管理后台</h1>
        <p>News Trade Management System</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">管理员邮箱</label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            placeholder="admin@example.com"
            required
            autocomplete="username"
            :disabled="loading"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            placeholder="••••••••"
            required
            autocomplete="current-password"
            :disabled="loading"
          />
        </div>
        
        <!-- ✅ 2FA输入框（根据 showTotp 动态显示） -->
        <div class="form-group" v-if="showTotp">
          <label for="totp">双因素认证码</label>
          <input 
            id="totp"
            v-model="totpCode" 
            type="text" 
            placeholder="000000"
            maxlength="6"
            pattern="[0-9]{6}"
            :disabled="loading"
            ref="totpInput"
          />
          <p class="help-text">
            📱 请打开身份验证器应用获取6位数字验证码
          </p>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="!loading">登录</span>
          <span v-else class="loading-text">
            <div class="spinner"></div>
            验证中...
          </span>
        </button>
      </form>
      
      <div class="login-footer">
        <router-link to="/login" class="back-link">
          ← 返回用户登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const totpCode = ref('')
const showTotp = ref(false)  // ✅ 控制是否显示2FA输入框
const loading = ref(false)
const error = ref('')
const totpInput = ref(null)

async function handleLogin() {
  if (loading.value) return
  
  error.value = ''
  loading.value = true
  
  try {
    // ✅ 调用 adminLogin，传入2FA码（如果有）
    const result = await authStore.adminLogin(
      email.value,
      password.value,
      showTotp.value ? totpCode.value : null
    )
    
    if (result.success) {
      // ✅ 登录成功 → 跳转管理后台
      router.push('/admin/dashboard')
    } else if (result.requireTotp) {
      // ✅ 需要2FA → 显示2FA输入框
      showTotp.value = true
      error.value = result.message
      
      // 聚焦到2FA输入框
      await nextTick()
      totpInput.value?.focus()
    } else {
      // ✅ 其他错误
      error.value = result.message || '登录失败，请检查邮箱和密码'
    }
  } catch (err) {
    error.value = '登录失败，请检查网络连接'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 48px;
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 28px;
  margin: 0 0 8px 0;
  color: #2d3748;
  font-weight: 700;
}

.login-header p {
  color: #718096;
  margin: 0;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #2d3748;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.help-text {
  margin: 0;
  font-size: 12px;
  color: #718096;
  padding: 8px 12px;
  background: #f7fafc;
  border-radius: 6px;
  border-left: 3px solid #667eea;
}

.error-message {
  padding: 12px 16px;
  background: #fed7d7;
  color: #742a2a;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 24px;
  text-align: center;
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.back-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-container {
    padding: 30px 20px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
}
</style>