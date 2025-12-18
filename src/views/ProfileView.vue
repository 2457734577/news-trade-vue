<template>
  <div class="profile-page">
    <div class="page-header">
      <h1 class="page-title">个人中心</h1>
      <p class="page-subtitle">管理您的账户信息</p>
    </div>
    
    <div class="profile-grid">
      <!-- 个人信息 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">个人信息</h3>
        </div>
        <div class="card-body">
          <div class="profile-avatar">
            <div class="avatar">{{ userInitial }}</div>
            <button class="btn btn-sm btn-secondary">更换头像</button>
          </div>
          
          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-group">
              <label class="form-label">用户名</label>
              <input type="text" v-model="profile.userName" class="form-input" :class="{ error: errors.userName }">
              <span class="form-error" v-if="errors.userName">{{ errors.userName }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">邮箱地址</label>
              <input type="email" v-model="profile.email" class="form-input" disabled>
              <span class="form-hint">邮箱地址不可修改</span>
            </div>
            <div class="form-group">
              <label class="form-label">手机号码</label>
              <input type="tel" v-model="profile.phone" class="form-input" placeholder="选填">
            </div>
            <button type="submit" class="btn btn-primary" :disabled="savingProfile">
              <span v-if="savingProfile" class="spinner"></span>
              <span v-else>保存修改</span>
            </button>
          </form>
        </div>
      </div>
      
      <!-- 修改密码 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">修改密码</h3>
        </div>
        <div class="card-body">
          <form @submit.prevent="changePassword" class="password-form">
            <div class="form-group">
              <label class="form-label">当前密码</label>
              <input type="password" v-model="passwordForm.oldPassword" class="form-input" :class="{ error: passwordErrors.oldPassword }">
              <span class="form-error" v-if="passwordErrors.oldPassword">{{ passwordErrors.oldPassword }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">新密码</label>
              <input type="password" v-model="passwordForm.newPassword" class="form-input" :class="{ error: passwordErrors.newPassword }">
              <span class="form-error" v-if="passwordErrors.newPassword">{{ passwordErrors.newPassword }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">确认新密码</label>
              <input type="password" v-model="passwordForm.confirmPassword" class="form-input" :class="{ error: passwordErrors.confirmPassword }">
              <span class="form-error" v-if="passwordErrors.confirmPassword">{{ passwordErrors.confirmPassword }}</span>
            </div>
            <button type="submit" class="btn btn-primary" :disabled="savingPassword">
              <span v-if="savingPassword" class="spinner"></span>
              <span v-else>修改密码</span>
            </button>
          </form>
        </div>
      </div>
      
      <!-- 安全设置 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">安全设置</h3>
        </div>
        <div class="card-body">
          <div class="security-item">
            <div class="security-info">
              <h4>双因素认证 (2FA)</h4>
              <p>使用 TOTP 应用增强账户安全</p>
            </div>
            <button class="btn btn-secondary" @click="toggle2FA">
              {{ is2FAEnabled ? '禁用' : '启用' }}
            </button>
          </div>
          <div class="security-item">
            <div class="security-info">
              <h4>登录记录</h4>
              <p>查看最近的登录活动</p>
            </div>
            <button class="btn btn-secondary" @click="viewLoginHistory">查看</button>
          </div>
          <div class="security-item">
            <div class="security-info">
              <h4>活跃会话</h4>
              <p>管理您的登录会话</p>
            </div>
            <button class="btn btn-secondary" @click="viewSessions">管理</button>
          </div>
        </div>
      </div>
      
      <!-- 账户统计 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">账户统计</h3>
        </div>
        <div class="card-body">
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ stats.totalOrders }}</span>
              <span class="stat-label">总订单数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.successRate }}%</span>
              <span class="stat-label">成功率</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.totalProfit }}</span>
              <span class="stat-label">总盈亏</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.memberDays }}</span>
              <span class="stat-label">会员天数</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 危险区域 -->
    <div class="card danger-zone">
      <div class="card-header">
        <h3 class="card-title">危险区域</h3>
      </div>
      <div class="card-body">
        <div class="danger-item">
          <div class="danger-info">
            <h4>退出所有设备</h4>
            <p>这将使所有设备上的登录失效</p>
          </div>
          <button class="btn btn-secondary" @click="logoutAll">退出所有</button>
        </div>
        <div class="danger-item">
          <div class="danger-info">
            <h4>删除账户</h4>
            <p>永久删除您的账户和所有数据，此操作不可恢复</p>
          </div>
          <button class="btn btn-danger" @click="deleteAccount">删除账户</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAlertStore } from '@/stores/alert'
import { validatePassword } from '@/utils/validate'

const authStore = useAuthStore()
const alertStore = useAlertStore()

const profile = reactive({ userName: '', email: '', phone: '' })
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const errors = reactive({ userName: '' })
const passwordErrors = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const savingProfile = ref(false)
const savingPassword = ref(false)
const is2FAEnabled = ref(false)
const stats = reactive({ totalOrders: 0, successRate: 0, totalProfit: '$0', memberDays: 0 })

const userInitial = computed(() => (profile.userName || 'U').charAt(0).toUpperCase())

async function updateProfile() {
  errors.userName = profile.userName.length >= 2 ? '' : '用户名至少2个字符'
  if (errors.userName) return
  
  savingProfile.value = true
  try {
    const result = await authStore.updateProfile({ userName: profile.userName, phone: profile.phone })
    if (result.success) alertStore.success('个人信息已更新')
    else alertStore.error(result.message || '更新失败')
  } finally {
    savingProfile.value = false
  }
}

async function changePassword() {
  passwordErrors.oldPassword = passwordForm.oldPassword ? '' : '请输入当前密码'
  passwordErrors.newPassword = validatePassword(passwordForm.newPassword).valid ? '' : '密码强度不足'
  passwordErrors.confirmPassword = passwordForm.newPassword === passwordForm.confirmPassword ? '' : '两次密码不一致'
  
  if (Object.values(passwordErrors).some(e => e)) return
  
  savingPassword.value = true
  try {
    const result = await authStore.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    if (result.success) {
      alertStore.success('密码已修改')
      Object.assign(passwordForm, { oldPassword: '', newPassword: '', confirmPassword: '' })
    } else {
      alertStore.error(result.message || '修改失败')
    }
  } finally {
    savingPassword.value = false
  }
}

function toggle2FA() { alertStore.info('2FA 功能开发中') }
function viewLoginHistory() { alertStore.info('登录记录功能开发中') }
function viewSessions() { alertStore.info('会话管理功能开发中') }
function logoutAll() {
  if (confirm('确定要退出所有设备吗？')) alertStore.info('功能开发中')
}
function deleteAccount() {
  if (confirm('确定要删除账户吗？此操作不可恢复！')) alertStore.info('功能开发中')
}

onMounted(() => {
  profile.userName = authStore.userName
  profile.email = authStore.userEmail
})
</script>

<style scoped>
.profile-page { max-width: 1200px; margin: 0 auto; }
.profile-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
.profile-avatar { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-light); }
.avatar { width: 80px; height: 80px; background: var(--primary-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; color: white; }
.profile-form, .password-form { display: flex; flex-direction: column; gap: 1rem; }
.security-item, .danger-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--border-light); }
.security-item:last-child, .danger-item:last-child { border-bottom: none; }
.security-info h4, .danger-info h4 { font-size: 0.9375rem; font-weight: 600; margin-bottom: 0.25rem; }
.security-info p, .danger-info p { font-size: 0.8125rem; color: var(--text-secondary); }
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.stat-item { text-align: center; padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-md); }
.stat-item .stat-value { display: block; font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
.stat-item .stat-label { font-size: 0.8125rem; color: var(--text-secondary); }
.danger-zone { margin-top: 2rem; border: 1px solid var(--danger-color); }
.danger-zone .card-header { border-bottom-color: var(--danger-color); }
.danger-zone .card-title { color: var(--danger-color); }
@media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } }
</style>