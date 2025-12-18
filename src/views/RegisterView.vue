<template>
  <div class="auth-page gradient-bg-animated">
    <div class="auth-container">
      <div class="auth-logo">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        </div>
        <h1 class="logo-text">News Trade</h1>
      </div>
      
      <div class="auth-card glass">
        <h2 class="auth-title">创建账户</h2>
        <p class="auth-subtitle">开始您的智能交易之旅</p>
        
        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input type="text" v-model="form.userName" placeholder="输入用户名" class="form-input with-icon" :class="{ 'error': errors.userName }">
            </div>
            <span class="form-error" v-if="errors.userName">{{ errors.userName }}</span>
          </div>
          
          <div class="form-group">
            <label class="form-label">邮箱地址</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <input type="email" v-model="form.email" placeholder="your@email.com" class="form-input with-icon" :class="{ 'error': errors.email }">
            </div>
            <span class="form-error" v-if="errors.email">{{ errors.email }}</span>
          </div>
          
          <div class="form-group">
            <label class="form-label">密码</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input :type="showPassword ? 'text' : 'password'" v-model="form.password" placeholder="设置密码" class="form-input with-icon" :class="{ 'error': errors.password }">
              <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
              </button>
            </div>
            <div class="password-strength" v-if="form.password">
              <div class="strength-bar" :class="strengthClass" :style="{ width: strengthPercent + '%' }"></div>
            </div>
            <span class="form-error" v-if="errors.password">{{ errors.password }}</span>
          </div>
          
          <div class="form-group">
            <label class="form-label">确认密码</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" v-model="form.confirmPassword" placeholder="再次输入密码" class="form-input with-icon" :class="{ 'error': errors.confirmPassword }">
            </div>
            <span class="form-error" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</span>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.agreeTerms">
              <span class="checkbox-custom"></span>
              我已阅读并同意 <a href="#" class="link">服务条款</a> 和 <a href="#" class="link">隐私政策</a>
            </label>
            <span class="form-error" v-if="errors.agreeTerms">{{ errors.agreeTerms }}</span>
          </div>
          
          <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>注册</span>
          </button>
        </form>
        
        <div class="auth-divider"><span>或</span></div>
        <p class="auth-footer">已有账户？<router-link to="/login" class="link">立即登录</router-link></p>
      </div>
      
      <p class="auth-copyright">© 2025 News Trade. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAlertStore } from '@/stores/alert'
import { validateEmail, validatePassword } from '@/utils/validate'

const router = useRouter()
const authStore = useAuthStore()
const alertStore = useAlertStore()

const form = reactive({ userName: '', email: '', password: '', confirmPassword: '', agreeTerms: false })
const loading = ref(false)
const showPassword = ref(false)
const errors = reactive({ userName: '', email: '', password: '', confirmPassword: '', agreeTerms: '' })

const passwordStrength = computed(() => validatePassword(form.password).strength || 0)
const strengthPercent = computed(() => Math.min(passwordStrength.value * 20, 100))
const strengthClass = computed(() => {
  if (passwordStrength.value <= 1) return 'weak'
  if (passwordStrength.value <= 2) return 'fair'
  if (passwordStrength.value <= 3) return 'good'
  return 'strong'
})

async function handleRegister() {
  errors.userName = form.userName.length >= 2 ? '' : '用户名至少2个字符'
  errors.email = validateEmail(form.email).valid ? '' : '请输入有效邮箱'
  errors.password = validatePassword(form.password).valid ? '' : '密码强度不足'
  errors.confirmPassword = form.password === form.confirmPassword ? '' : '两次密码不一致'
  errors.agreeTerms = form.agreeTerms ? '' : '请同意服务条款'
  
  if (Object.values(errors).some(e => e)) return
  
  loading.value = true
  try {
    const result = await authStore.register({ userName: form.userName, email: form.email, password: form.password })
    if (result.success) {
      alertStore.success('注册成功，请登录')
      router.push('/login')
    } else {
      alertStore.error(result.message || '注册失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
.auth-container { width: 100%; max-width: 420px; }
.auth-logo { text-align: center; margin-bottom: 2rem; }
.auth-logo .logo-icon { width: 64px; height: 64px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: var(--radius-lg); display: inline-flex; align-items: center; justify-content: center; color: white; margin-bottom: 1rem; }
.auth-logo .logo-text { font-size: 1.75rem; font-weight: 700; color: white; }
.auth-card { padding: 2.5rem; border-radius: var(--radius-xl); }
.auth-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
.auth-subtitle { font-size: 0.9375rem; color: var(--text-secondary); margin-bottom: 2rem; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 1rem; color: var(--text-muted); pointer-events: none; }
.form-input.with-icon { padding-left: 2.75rem; }
.form-input.error { border-color: var(--danger-color); }
.password-toggle { position: absolute; right: 0.75rem; padding: 0.25rem; color: var(--text-muted); }
.password-strength { height: 4px; background: var(--bg-tertiary); border-radius: 2px; margin-top: 0.5rem; overflow: hidden; }
.strength-bar { height: 100%; transition: all 0.3s; }
.strength-bar.weak { background: var(--danger-color); }
.strength-bar.fair { background: var(--warning-color); }
.strength-bar.good { background: var(--info-color); }
.strength-bar.strong { background: var(--success-color); }
.checkbox-label { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); cursor: pointer; }
.checkbox-label input { display: none; }
.checkbox-custom { width: 18px; height: 18px; border: 2px solid var(--border-color); border-radius: 4px; position: relative; flex-shrink: 0; margin-top: 2px; }
.checkbox-label input:checked + .checkbox-custom { background: var(--primary-gradient); border-color: transparent; }
.checkbox-label input:checked + .checkbox-custom::after { content: ''; position: absolute; left: 5px; top: 2px; width: 5px; height: 9px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
.link { color: var(--primary-color); font-weight: 500; }
.auth-divider { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; color: var(--text-muted); font-size: 0.875rem; }
.auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--border-color); }
.auth-footer { text-align: center; font-size: 0.9375rem; color: var(--text-secondary); }
.auth-copyright { text-align: center; margin-top: 2rem; font-size: 0.8125rem; color: rgba(255,255,255,0.7); }
</style>