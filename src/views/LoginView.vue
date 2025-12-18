<template>
  <div class="auth-page gradient-bg-animated">
    <div class="auth-container">
      <div class="auth-logo">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
          </svg>
        </div>
        <h1 class="logo-text">News Trade</h1>
      </div>
      
      <div class="auth-card glass">
        <h2 class="auth-title">欢迎回来</h2>
        <p class="auth-subtitle">登录您的账户以继续</p>
        
        <form @submit.prevent="handleLogin" class="auth-form">
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
              <input :type="showPassword ? 'text' : 'password'" v-model="form.password" placeholder="输入密码" class="form-input with-icon" :class="{ 'error': errors.password }">
              <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
              </button>
            </div>
            <span class="form-error" v-if="errors.password">{{ errors.password }}</span>
          </div>
          
          <div class="form-group" v-if="showTotp">
            <label class="form-label">双因素验证码</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              <input type="text" v-model="form.totpCode" placeholder="6位验证码" maxlength="6" class="form-input with-icon">
            </div>
          </div>
          
          <div class="form-row">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.remember">
              <span class="checkbox-custom"></span>
              记住我
            </label>
            <router-link to="/forgot-password" class="link">忘记密码？</router-link>
          </div>
          
          <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>登录</span>
          </button>
        </form>
        
        <div class="auth-divider"><span>或</span></div>
        <p class="auth-footer">还没有账户？<router-link to="/register" class="link">立即注册</router-link></p>
      </div>
      
      <p class="auth-copyright">© 2025 News Trade. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAlertStore } from '@/stores/alert'
import { validateEmail } from '@/utils/validate'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const alertStore = useAlertStore()

const form = reactive({ email: '', password: '', totpCode: '', remember: false })
const loading = ref(false)
const showPassword = ref(false)
const showTotp = ref(false)
const errors = reactive({ email: '', password: '' })

async function handleLogin() {
  errors.email = validateEmail(form.email).valid ? '' : '请输入有效邮箱'
  errors.password = form.password.length >= 6 ? '' : '密码至少6位'
  if (errors.email || errors.password) return
  
  loading.value = true
  try {
    const result = await authStore.login(form.email, form.password, form.totpCode || null)
    
    if (result.success) {
      alertStore.success('登录成功')
      const redirect = route.query.redirect || '/user/dashboard'
      router.push(redirect)
    } else {
      if (result.requireTotp) {
        showTotp.value = true
      }
      alertStore.error(result.message || '登录失败')
    }
  } catch (error) {
    alertStore.error('登录失败，请重试')
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
.password-toggle:hover { color: var(--text-primary); }
.form-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
.checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); cursor: pointer; }
.checkbox-label input { display: none; }
.checkbox-custom { width: 18px; height: 18px; border: 2px solid var(--border-color); border-radius: 4px; position: relative; }
.checkbox-label input:checked + .checkbox-custom { background: var(--primary-gradient); border-color: transparent; }
.checkbox-label input:checked + .checkbox-custom::after { content: ''; position: absolute; left: 5px; top: 2px; width: 5px; height: 9px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
.link { font-size: 0.875rem; color: var(--primary-color); font-weight: 500; }
.auth-divider { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; color: var(--text-muted); font-size: 0.875rem; }
.auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--border-color); }
.auth-footer { text-align: center; font-size: 0.9375rem; color: var(--text-secondary); }
.auth-copyright { text-align: center; margin-top: 2rem; font-size: 0.8125rem; color: rgba(255,255,255,0.7); }
</style>