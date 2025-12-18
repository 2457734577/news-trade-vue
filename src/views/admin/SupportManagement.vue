<template>
  <div class="support-management">
    <div class="page-header">
      <h1 class="page-title">💬 客服管理</h1>
      <div class="header-actions">
        <button @click="refreshTickets" class="btn btn-secondary">
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">总工单</div>
          <div class="stat-value">{{ stats.total }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #ed8936;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">待处理</div>
          <div class="stat-value">{{ stats.pending }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #4facfe;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">处理中</div>
          <div class="stat-value">{{ stats.inProgress }}</div>
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
          <div class="stat-label">已解决</div>
          <div class="stat-value">{{ stats.resolved }}</div>
        </div>
      </div>
    </div>

    <div class="content-layout">
      <div class="tickets-panel">
        <div class="panel-header">
          <div class="filter-tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.value"
              @click="currentTab = tab.value"
              :class="['tab-btn', { active: currentTab === tab.value }]"
            >
              {{ tab.label }}
              <span v-if="getTabCount(tab.value) > 0" class="tab-badge">
                {{ getTabCount(tab.value) }}
              </span>
            </button>
          </div>
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input v-model="searchQuery" type="text" placeholder="搜索工单..." />
          </div>
        </div>

        <div class="tickets-list">
          <div 
            v-for="ticket in filteredTickets" 
            :key="ticket.id"
            @click="selectTicket(ticket)"
            :class="['ticket-item', { active: selectedTicket?.id === ticket.id }]"
          >
            <div class="ticket-item-header">
              <span :class="['priority-dot', `priority-${ticket.priority}`]"></span>
              <span class="ticket-item-title">{{ ticket.subject }}</span>
            </div>
            <div class="ticket-item-meta">
              <span class="ticket-item-user">{{ ticket.userName }}</span>
              <span class="ticket-item-time">{{ formatTime(ticket.createdAt) }}</span>
            </div>
            <div class="ticket-item-footer">
              <span :class="['ticket-item-status', `status-${ticket.status}`]">
                {{ getStatusText(ticket.status) }}
              </span>
              <span v-if="ticket.unreadCount > 0" class="unread-dot"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-panel">
        <div v-if="!selectedTicket" class="empty-detail">
          <div class="empty-icon">💬</div>
          <p>选择一个工单查看详情</p>
        </div>

        <div v-else class="ticket-detail">
          <div class="detail-header">
            <div class="detail-title">
              <h2>{{ selectedTicket.subject }}</h2>
              <div class="detail-meta">
                <span class="meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {{ selectedTicket.userName }}
                </span>
                <span class="meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {{ formatDateTime(selectedTicket.createdAt) }}
                </span>
              </div>
            </div>
            <div class="detail-actions">
              <select v-model="selectedTicket.status" class="status-select">
                <option value="pending">待处理</option>
                <option value="in_progress">处理中</option>
                <option value="resolved">已解决</option>
              </select>
              <button @click="closeTicket" class="btn btn-primary">
                关闭工单
              </button>
            </div>
          </div>

          <div class="ticket-content">
            <div class="content-section">
              <h3>问题描述</h3>
              <p>{{ selectedTicket.content }}</p>
            </div>

            <div class="content-section">
              <h3>工单信息</h3>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">工单ID</div>
                  <div class="info-value">#{{ selectedTicket.id }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">分类</div>
                  <div class="info-value">{{ getCategoryText(selectedTicket.category) }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">优先级</div>
                  <div class="info-value">
                    <span :class="['priority-badge', `priority-${selectedTicket.priority}`]">
                      {{ getPriorityText(selectedTicket.priority) }}
                    </span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">状态</div>
                  <div class="info-value">
                    <span :class="['status-badge', `status-${selectedTicket.status}`]">
                      {{ getStatusText(selectedTicket.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="content-section">
              <h3>对话记录</h3>
              <div class="messages-list">
                <div 
                  v-for="message in messages" 
                  :key="message.id"
                  :class="['message-item', message.isSupport ? 'message-support' : 'message-user']"
                >
                  <div class="message-header">
                    <span class="message-sender">{{ message.sender }}</span>
                    <span class="message-time">{{ formatTime(message.createdAt) }}</span>
                  </div>
                  <div class="message-content">{{ message.content }}</div>
                </div>
              </div>

              <div class="reply-box">
                <textarea 
                  v-model="replyContent"
                  placeholder="输入回复内容..."
                  rows="4"
                ></textarea>
                <button @click="sendReply" class="btn btn-primary">
                  发送回复
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const currentTab = ref('all')
const selectedTicket = ref(null)
const replyContent = ref('')

const stats = ref({
  total: 156,
  pending: 23,
  inProgress: 45,
  resolved: 88
})

const tabs = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: 'pending' },
  { label: '处理中', value: 'in_progress' },
  { label: '已解决', value: 'resolved' }
]

const tickets = ref([
  {
    id: 1,
    subject: '无法登录账户',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    category: 'account',
    priority: 'high',
    status: 'pending',
    content: '我无法登录我的账户，输入密码后显示错误。',
    createdAt: '2024-12-17T09:30:00',
    unreadCount: 2
  },
  {
    id: 2,
    subject: '提现延迟问题',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    category: 'trading',
    priority: 'medium',
    status: 'in_progress',
    content: '我昨天申请的提现到现在还没有到账。',
    createdAt: '2024-12-17T08:15:00',
    unreadCount: 0
  }
])

const messages = ref([
  {
    id: 1,
    sender: 'John Doe',
    content: '我无法登录我的账户，输入密码后显示错误。',
    isSupport: false,
    createdAt: '2024-12-17T09:30:00'
  },
  {
    id: 2,
    sender: '客服小张',
    content: '您好，请问您是否尝试过重置密码？',
    isSupport: true,
    createdAt: '2024-12-17T09:35:00'
  }
])

const filteredTickets = computed(() => {
  let filtered = tickets.value

  if (currentTab.value !== 'all') {
    filtered = filtered.filter(t => t.status === currentTab.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t =>
      t.subject.toLowerCase().includes(query) ||
      t.userName.toLowerCase().includes(query)
    )
  }

  return filtered
})

function getTabCount(tab) {
  if (tab === 'all') return tickets.value.length
  return tickets.value.filter(t => t.status === tab).length
}

function getStatusText(status) {
  const texts = {
    'pending': '待处理',
    'in_progress': '处理中',
    'resolved': '已解决'
  }
  return texts[status] || status
}

function getCategoryText(category) {
  const texts = {
    'technical': '技术问题',
    'account': '账户问题',
    'trading': '交易问题',
    'other': '其他'
  }
  return texts[category] || category
}

function getPriorityText(priority) {
  const texts = {
    'low': '低',
    'medium': '中',
    'high': '高'
  }
  return texts[priority] || priority
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString('zh-CN')
}

function formatDateTime(timestamp) {
  return new Date(timestamp).toLocaleString('zh-CN')
}

function selectTicket(ticket) {
  selectedTicket.value = ticket
}

function refreshTickets() {
  console.log('刷新工单列表')
}

function closeTicket() {
  if (selectedTicket.value) {
    selectedTicket.value.status = 'resolved'
    console.log('关闭工单:', selectedTicket.value)
  }
}

function sendReply() {
  if (replyContent.value.trim()) {
    const message = {
      id: messages.value.length + 1,
      sender: '客服小张',
      content: replyContent.value,
      isSupport: true,
      createdAt: new Date().toISOString()
    }
    messages.value.push(message)
    replyContent.value = ''
  }
}
</script>

<style scoped>
.support-management {
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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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

.content-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
  height: calc(100vh - 300px);
}

.tickets-panel,
.detail-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: #f7fafc;
  color: #4a5568;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-btn:hover {
  background: #edf2f7;
}

.tab-btn.active {
  background: #667eea;
  color: white;
}

.tab-badge {
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f7fafc;
  border-radius: 6px;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
}

.tickets-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.ticket-item {
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.ticket-item:hover {
  background: #f7fafc;
}

.ticket-item.active {
  background: #edf2f7;
  border-color: #667eea;
}

.ticket-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.priority-dot.priority-low { background: #48bb78; }
.priority-dot.priority-medium { background: #ed8936; }
.priority-dot.priority-high { background: #f56565; }

.ticket-item-title {
  font-weight: 500;
  color: #2d3748;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ticket-item-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #a0aec0;
  margin-bottom: 8px;
}

.ticket-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-item-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.ticket-item-status.status-pending {
  background: #feebc8;
  color: #7c2d12;
}

.ticket-item-status.status-in_progress {
  background: #bee3f8;
  color: #2c5282;
}

.ticket-item-status.status-resolved {
  background: #c6f6d5;
  color: #22543d;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #f56565;
  border-radius: 50%;
}

.empty-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #a0aec0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.ticket-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.detail-title h2 {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
}

.detail-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #718096;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-actions {
  display: flex;
  gap: 12px;
}

.status-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.ticket-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.content-section {
  margin-bottom: 32px;
}

.content-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.content-section p {
  margin: 0;
  color: #4a5568;
  line-height: 1.6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
}

.info-label {
  font-size: 12px;
  color: #718096;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
}

.priority-badge,
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.priority-badge.priority-low { background: #c6f6d5; color: #22543d; }
.priority-badge.priority-medium { background: #feebc8; color: #7c2d12; }
.priority-badge.priority-high { background: #fed7d7; color: #742a2a; }

.status-badge.status-pending { background: #feebc8; color: #7c2d12; }
.status-badge.status-in_progress { background: #bee3f8; color: #2c5282; }
.status-badge.status-resolved { background: #c6f6d5; color: #22543d; }

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.message-item {
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 80%;
}

.message-user {
  background: #f7fafc;
  align-self: flex-start;
}

.message-support {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  align-self: flex-end;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.message-sender {
  font-weight: 600;
  color: #2d3748;
}

.message-time {
  color: #a0aec0;
}

.message-content {
  color: #4a5568;
  line-height: 1.5;
}

.reply-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-box textarea {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
}

.reply-box textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

@media (max-width: 1200px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .support-management {
    padding: 16px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>