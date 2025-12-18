<template>
  <div class="support-view">
    <div class="page-header">
      <h1 class="page-title">💬 客服支持</h1>
      <button @click="showTicketForm = true" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        创建工单
      </button>
    </div>

    <div class="status-tabs">
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

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="filteredTickets.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>暂无工单</h3>
      <p>{{ getEmptyMessage() }}</p>
      <button @click="showTicketForm = true" class="btn btn-primary">创建工单</button>
    </div>

    <div v-else class="tickets-list">
      <div 
        v-for="ticket in filteredTickets" 
        :key="ticket.id"
        @click="openTicket(ticket)"
        class="ticket-card"
      >
        <div class="ticket-header">
          <div class="ticket-title">
            <span :class="['priority-dot', `priority-${ticket.priority}`]"></span>
            {{ ticket.subject }}
          </div>
          <span :class="['status-badge', `status-${ticket.status}`]">
            {{ getStatusText(ticket.status) }}
          </span>
        </div>
        
        <div class="ticket-content">
          {{ ticket.content }}
        </div>
        
        <div class="ticket-footer">
          <div class="ticket-meta">
            <span class="ticket-category">{{ getCategoryText(ticket.category) }}</span>
            <span class="ticket-time">{{ formatTime(ticket.createdAt) }}</span>
          </div>
          <div v-if="ticket.unreadCount > 0" class="unread-badge">
            {{ ticket.unreadCount }} 条新消息
          </div>
        </div>
      </div>
    </div>

    <teleport to="body">
      <div v-if="showTicketForm" class="modal-overlay" @click.self="showTicketForm = false">
        <TicketForm @close="showTicketForm = false" @submit="handleTicketSubmit" />
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupportStore } from '@/stores/support'
import TicketForm from '@/components/support/TicketForm.vue'

const router = useRouter()
const supportStore = useSupportStore()

const loading = ref(false)
const currentTab = ref('all')
const showTicketForm = ref(false)

const tabs = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'open' },
  { label: '已解决', value: 'closed' }
]

const filteredTickets = computed(() => {
  if (currentTab.value === 'all') {
    return supportStore.tickets
  }
  return supportStore.tickets.filter(
    ticket => ticket.status === currentTab.value
  )
})

function getTabCount(tab) {
  if (tab === 'all') return supportStore.tickets.length
  return supportStore.tickets.filter(t => t.status === tab).length
}

function getEmptyMessage() {
  if (currentTab.value === 'closed') {
    return '您还没有已解决的工单'
  } else if (currentTab.value === 'open') {
    return '您没有进行中的工单'
  }
  return '创建您的第一个工单'
}

function getStatusText(status) {
  const texts = {
    'open': '进行中',
    'closed': '已解决',
    'pending': '等待回复'
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

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString('zh-CN')
}

function openTicket(ticket) {
  supportStore.currentTicket = ticket
  supportStore.openChat()
}

async function handleTicketSubmit(ticket) {
  await supportStore.fetchTickets()
}

onMounted(async () => {
  loading.value = true
  try {
    await supportStore.fetchTickets()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.support-view {
  padding: 24px;
  max-width: 1200px;
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

.status-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e2e8f0;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: #718096;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  color: #667eea;
}

.tab-btn.active {
  color: #667eea;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.tab-badge {
  padding: 2px 8px;
  background: #e2e8f0;
  color: #4a5568;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.tab-btn.active .tab-badge {
  background: #667eea;
  color: white;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #718096;
  margin: 0 0 24px 0;
}

.tickets-list {
  display: grid;
  gap: 16px;
}

.ticket-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s;
}

.ticket-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.ticket-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  flex: 1;
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

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.status-open {
  background: #bee3f8;
  color: #2c5282;
}

.status-badge.status-closed {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.status-pending {
  background: #feebc8;
  color: #7c2d12;
}

.ticket-content {
  color: #4a5568;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ticket-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #a0aec0;
}

.ticket-category {
  font-weight: 500;
}

.unread-badge {
  padding: 4px 12px;
  background: #f56565;
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

@media (max-width: 768px) {
  .support-view {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .status-tabs {
    overflow-x: auto;
  }
}
</style>