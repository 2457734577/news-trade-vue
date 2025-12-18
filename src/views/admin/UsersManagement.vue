<template>
  <div class="users-management">
    <div class="page-header">
      <h1 class="page-title">👥 用户管理</h1>
      <div class="header-actions">
        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input v-model="searchQuery" type="text" placeholder="搜索用户..." />
        </div>
        <button @click="refreshUsers" class="btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          刷新
        </button>
      </div>
    </div>

    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background: #667eea;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">总用户数</div>
          <div class="stat-value">{{ stats.total }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #48bb78;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">活跃用户</div>
          <div class="stat-value">{{ stats.active }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #ed8936;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">已禁用</div>
          <div class="stat-value">{{ stats.disabled }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #9f7aea;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <polyline points="17 11 19 13 23 9"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">本月新增</div>
          <div class="stat-value">{{ stats.newThisMonth }}</div>
        </div>
      </div>
    </div>

    <div class="users-table-container">
      <div class="table-header">
        <div class="filter-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            @click="currentTab = tab.value"
            :class="['tab-btn', { active: currentTab === tab.value }]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>用户</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>状态</th>
              <th>注册时间</th>
              <th>最后登录</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>
                <div class="user-cell">
                  <div class="user-avatar">{{ getInitial(user.name) }}</div>
                  <div class="user-info">
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-id">ID: {{ user.id }}</div>
                  </div>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="['role-badge', `role-${user.role}`]">
                  {{ getRoleText(user.role) }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', user.enabled ? 'status-active' : 'status-disabled']">
                  {{ user.enabled ? '活跃' : '已禁用' }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>{{ formatTime(user.lastLogin) }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="viewUser(user)" class="action-btn" title="查看详情">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button @click="toggleUserStatus(user)" class="action-btn" :title="user.enabled ? '禁用' : '启用'">
                    <svg v-if="user.enabled" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </button>
                  <button @click="editUser(user)" class="action-btn" title="编辑">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1" class="page-btn">
          上一页
        </button>
        <div class="page-numbers">
          <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
        </div>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="page-btn">
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const currentTab = ref('all')
const currentPage = ref(1)
const pageSize = 20

const tabs = [
  { label: '全部用户', value: 'all' },
  { label: '活跃', value: 'active' },
  { label: '已禁用', value: 'disabled' }
]

const stats = ref({
  total: 156,
  active: 142,
  disabled: 14,
  newThisMonth: 23
})

const users = ref([
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    enabled: true,
    createdAt: '2024-01-15T10:30:00',
    lastLogin: '2024-12-17T09:15:00'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    enabled: true,
    createdAt: '2024-02-20T14:20:00',
    lastLogin: '2024-12-17T08:45:00'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'admin',
    enabled: true,
    createdAt: '2024-03-10T11:00:00',
    lastLogin: '2024-12-16T18:30:00'
  }
])

const filteredUsers = computed(() => {
  let filtered = users.value

  if (currentTab.value !== 'all') {
    filtered = filtered.filter(user => {
      if (currentTab.value === 'active') return user.enabled
      if (currentTab.value === 'disabled') return !user.enabled
      return true
    })
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / pageSize))

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : 'U'
}

function getRoleText(role) {
  return role === 'admin' ? '管理员' : '用户'
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('zh-CN')
}

function formatTime(date) {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return d.toLocaleDateString('zh-CN')
}

function refreshUsers() {
  console.log('刷新用户列表')
}

function viewUser(user) {
  console.log('查看用户:', user)
}

function toggleUserStatus(user) {
  user.enabled = !user.enabled
  console.log('切换用户状态:', user)
}

function editUser(user) {
  console.log('编辑用户:', user)
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
</script>

<style scoped>
.users-management {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  min-width: 300px;
}

.search-box svg {
  color: #a0aec0;
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
}

.btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f7fafc;
  border-color: #667eea;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
}

.users-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.table-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #f7fafc;
  color: #4a5568;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #edf2f7;
}

.tab-btn.active {
  background: #667eea;
  color: white;
}

.table-wrapper {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: #f7fafc;
}

.users-table th {
  padding: 12px 24px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.users-table td {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  font-size: 14px;
  color: #2d3748;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 500;
  color: #2d3748;
}

.user-id {
  font-size: 12px;
  color: #a0aec0;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.role-badge.role-admin {
  background: #fed7d7;
  color: #742a2a;
}

.role-badge.role-user {
  background: #bee3f8;
  color: #2c5282;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.status-active {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.status-disabled {
  background: #e2e8f0;
  color: #4a5568;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f7fafc;
  border-color: #667eea;
  color: #667eea;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #4a5568;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #667eea;
  color: #667eea;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #4a5568;
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .users-management {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .search-box {
    min-width: auto;
    width: 100%;
  }
}
</style>