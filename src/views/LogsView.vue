<template>
  <div class="logs-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">系统日志</h1>
        <p class="page-subtitle">查看系统运行日志和交易记录</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="refreshLogs">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          刷新
        </button>
        <button class="btn btn-secondary" @click="exportLogs">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          导出
        </button>
      </div>
    </div>
    
    <!-- 日志类型标签 -->
    <div class="log-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.value" 
        class="log-tab" 
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value; loadLogs()"
      >
        <span class="tab-icon" v-html="tab.icon"></span>
        {{ tab.label }}
        <span class="tab-count" v-if="tab.count">{{ tab.count }}</span>
      </button>
    </div>
    
    <!-- 筛选栏 -->
    <div class="card mb-6">
      <div class="filters">
        <div class="filter-group">
          <label class="form-label">日志级别</label>
          <select v-model="filters.level" class="form-input" @change="loadLogs">
            <option value="">全部</option>
            <option value="INFO">信息</option>
            <option value="WARN">警告</option>
            <option value="ERROR">错误</option>
            <option value="DEBUG">调试</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="form-label">关键词</label>
          <input type="text" v-model="filters.keyword" class="form-input" placeholder="搜索日志..." @keyup.enter="loadLogs">
        </div>
        <div class="filter-group">
          <label class="form-label">开始时间</label>
          <input type="datetime-local" v-model="filters.startTime" class="form-input" @change="loadLogs">
        </div>
        <div class="filter-group">
          <label class="form-label">结束时间</label>
          <input type="datetime-local" v-model="filters.endTime" class="form-input" @change="loadLogs">
        </div>
        <div class="filter-actions">
          <button class="btn btn-secondary" @click="resetFilters">重置</button>
        </div>
      </div>
    </div>
    
    <!-- 实时日志开关 -->
    <div class="realtime-toggle mb-4">
      <label class="toggle-label">
        <span>实时更新</span>
        <input type="checkbox" v-model="realtime" @change="toggleRealtime">
        <span class="toggle"></span>
      </label>
      <span class="realtime-status" v-if="realtime">
        <span class="pulse"></span>
        实时监听中...
      </span>
    </div>
    
    <!-- 日志列表 -->
    <div class="card">
      <div class="card-body logs-container">
        <div v-if="loading" class="loading-state"><div class="spinner"></div></div>
        <div v-else-if="logs.length === 0" class="empty-state">
          <div class="empty-state-icon">📄</div>
          <p class="empty-state-title">暂无日志</p>
          <p class="empty-state-text">当前筛选条件下没有日志记录</p>
        </div>
        <div v-else class="logs-list" ref="logsContainer">
          <div v-for="log in logs" :key="log.id" class="log-item" :class="'log-' + log.level.toLowerCase()">
            <div class="log-header">
              <span :class="['log-level', 'level-' + log.level.toLowerCase()]">{{ log.level }}</span>
              <span class="log-time">{{ formatDateTime(log.timestamp) }}</span>
              <span class="log-source">{{ log.source }}</span>
            </div>
            <div class="log-message">{{ log.message }}</div>
            <div class="log-details" v-if="log.details">
              <button class="details-toggle" @click="log.expanded = !log.expanded">
                {{ log.expanded ? '收起详情' : '展开详情' }}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ rotated: log.expanded }"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <pre v-if="log.expanded" class="details-content">{{ formatJson(log.details) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分页 -->
    <div class="pagination" v-if="pagination.totalPages > 1">
      <button class="pagination-btn" :disabled="pagination.page <= 1" @click="changePage(pagination.page - 1)">上一页</button>
      <span class="pagination-info">第 {{ pagination.page }} / {{ pagination.totalPages }} 页，共 {{ pagination.total }} 条</span>
      <button class="pagination-btn" :disabled="pagination.page >= pagination.totalPages" @click="changePage(pagination.page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import api from '@/utils/api'
import { formatDateTime } from '@/utils/format'

const tabs = [
  { value: 'all', label: '全部日志', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
  { value: 'trade', label: '交易日志', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>' },
  { value: 'news', label: '新闻日志', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>' },
  { value: 'system', label: '系统日志', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg>' },
  { value: 'error', label: '错误日志', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>', count: 0 }
]

const activeTab = ref('all')
const loading = ref(true)
const realtime = ref(false)
const logs = ref([])
const logsContainer = ref(null)
let realtimeInterval = null

const filters = reactive({
  level: '',
  keyword: '',
  startTime: '',
  endTime: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 50,
  total: 0,
  totalPages: 0
})

async function loadLogs() {
  loading.value = true
  try {
    const params = {
      type: activeTab.value !== 'all' ? activeTab.value : undefined,
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters
    }
    Object.keys(params).forEach(key => !params[key] && delete params[key])
    
    const response = await api.get('/logs', { params })
    if (response.success) {
      logs.value = (response.data.list || response.data || []).map(log => ({ ...log, expanded: false }))
      if (response.data.pagination) {
        Object.assign(pagination, response.data.pagination)
      }
    }
  } catch (error) {
    console.error('加载日志失败:', error)
  } finally {
    loading.value = false
  }
}

function refreshLogs() {
  loadLogs()
}

function resetFilters() {
  Object.assign(filters, { level: '', keyword: '', startTime: '', endTime: '' })
  pagination.page = 1
  loadLogs()
}

function changePage(page) {
  pagination.page = page
  loadLogs()
}

function toggleRealtime() {
  if (realtime.value) {
    realtimeInterval = setInterval(loadLogs, 5000)
  } else {
    clearInterval(realtimeInterval)
  }
}

function formatJson(obj) {
  try {
    return JSON.stringify(typeof obj === 'string' ? JSON.parse(obj) : obj, null, 2)
  } catch {
    return obj
  }
}

function exportLogs() {
  const csv = logs.value.map(log => 
    `${log.timestamp},${log.level},${log.source},"${log.message.replace(/"/g, '""')}"`
  ).join('\n')
  
  const blob = new Blob([`时间,级别,来源,消息\n${csv}`], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `logs_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

onMounted(loadLogs)
onUnmounted(() => clearInterval(realtimeInterval))
</script>

<style scoped>
.logs-page { max-width: 1400px; margin: 0 auto; }
.header-actions { display: flex; gap: 0.5rem; }
.log-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.log-tab { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); transition: all var(--transition-fast); }
.log-tab:hover { border-color: var(--primary-color); color: var(--primary-color); }
.log-tab.active { background: var(--primary-color); border-color: var(--primary-color); color: white; }
.tab-icon { display: flex; }
.tab-count { background: var(--danger-color); color: white; padding: 0.125rem 0.5rem; border-radius: var(--radius-full); font-size: 0.75rem; }
.filters { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; }
.filter-group { flex: 1; min-width: 150px; }
.filter-group .form-input { width: 100%; }
.filter-actions { display: flex; gap: 0.5rem; }
.realtime-toggle { display: flex; align-items: center; gap: 1rem; }
.toggle-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.875rem; }
.toggle-label input { display: none; }
.toggle { width: 44px; height: 24px; background: var(--border-color); border-radius: 12px; position: relative; transition: background var(--transition-fast); }
.toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: white; border-radius: 50%; transition: transform var(--transition-fast); }
.toggle-label input:checked + .toggle { background: var(--success-color); }
.toggle-label input:checked + .toggle::after { transform: translateX(20px); }
.realtime-status { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--success-color); }
.pulse { width: 8px; height: 8px; background: var(--success-color); border-radius: 50%; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.logs-container { max-height: 600px; overflow-y: auto; }
.logs-list { display: flex; flex-direction: column; gap: 0.5rem; }
.log-item { padding: 0.75rem 1rem; background: var(--bg-tertiary); border-radius: var(--radius-md); border-left: 3px solid var(--border-color); }
.log-item.log-error { border-left-color: var(--danger-color); background: rgba(239, 68, 68, 0.05); }
.log-item.log-warn { border-left-color: var(--warning-color); background: rgba(245, 158, 11, 0.05); }
.log-item.log-info { border-left-color: var(--info-color); }
.log-item.log-debug { border-left-color: var(--text-muted); }
.log-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; font-size: 0.8125rem; }
.log-level { padding: 0.125rem 0.5rem; border-radius: var(--radius-sm); font-weight: 600; font-size: 0.6875rem; text-transform: uppercase; }
.level-error { background: var(--danger-bg); color: var(--danger-color); }
.level-warn { background: var(--warning-bg); color: var(--warning-color); }
.level-info { background: var(--info-bg); color: var(--info-color); }
.level-debug { background: var(--bg-secondary); color: var(--text-muted); }
.log-time { color: var(--text-muted); font-family: var(--font-mono); }
.log-source { color: var(--text-secondary); }
.log-message { font-size: 0.9375rem; line-height: 1.5; word-break: break-word; }
.log-details { margin-top: 0.5rem; }
.details-toggle { display: flex; align-items: center; gap: 0.25rem; font-size: 0.8125rem; color: var(--primary-color); }
.details-toggle svg { transition: transform var(--transition-fast); }
.details-toggle svg.rotated { transform: rotate(180deg); }
.details-content { margin-top: 0.5rem; padding: 0.75rem; background: var(--bg-secondary); border-radius: var(--radius-sm); font-size: 0.8125rem; overflow-x: auto; font-family: var(--font-mono); }
.pagination-info { font-size: 0.875rem; color: var(--text-secondary); }
@media (max-width: 768px) { .filters { flex-direction: column; } .filter-group { width: 100%; } }
</style>