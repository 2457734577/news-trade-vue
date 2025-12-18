import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'

export const useSupportStore = defineStore('support', () => {
  // 状态
  const tickets = ref([])
  const currentTicket = ref(null)
  const messages = ref([])
  const unreadCount = ref(0)
  const chatOpen = ref(false)
  const loading = ref(false)
  const error = ref(null)
  
  // 在线客服状态
  const supportOnline = ref(true)
  const supportAgents = ref([
    { id: 1, name: '客服小助手', avatar: '👨‍💼', online: true }
  ])

  // 计算属性
  
  /**
   * 未读消息数
   */
  const unreadMessages = computed(() => {
    return messages.value.filter(msg => 
      msg.senderType === 'support' && !msg.read
    ).length
  })
  
  /**
   * 当前激活的工单
   */
  const activeTickets = computed(() => {
    return tickets.value.filter(ticket => 
      ticket.status === 'open' || ticket.status === 'pending'
    )
  })
  
  /**
   * 已关闭的工单
   */
  const closedTickets = computed(() => {
    return tickets.value.filter(ticket => 
      ticket.status === 'resolved' || ticket.status === 'closed'
    )
  })

  // 方法
  
  /**
   * 创建工单
   */
  async function createTicket(ticketData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/support/tickets', ticketData)
      
      if (response.success && response.data) {
        tickets.value.unshift(response.data)
        currentTicket.value = response.data
        return { success: true, data: response.data }
      } else {
        error.value = response.message || '创建工单失败'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.message || '网络错误'
      console.error('创建工单失败:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取工单列表
   */
  async function fetchTickets() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/support/tickets')
      
      if (response.success && response.data) {
        tickets.value = response.data
        return { success: true, data: response.data }
      } else {
        error.value = response.message || '获取工单失败'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.message || '网络错误'
      console.error('获取工单失败:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取工单详情
   */
  async function fetchTicket(ticketId) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/support/tickets/${ticketId}`)
      
      if (response.success && response.data) {
        currentTicket.value = response.data
        return { success: true, data: response.data }
      } else {
        error.value = response.message || '获取工单详情失败'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.message || '网络错误'
      console.error('获取工单详情失败:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 发送消息
   */
  async function sendMessage(ticketId, content, attachments = []) {
    try {
      const messageData = {
        ticketId,
        content,
        attachments
      }
      
      const response = await api.post('/support/messages', messageData)
      
      if (response.success && response.data) {
        messages.value.push(response.data)
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '发送消息失败' }
      }
    } catch (err) {
      console.error('发送消息失败:', err)
      return { success: false, message: err.message || '网络错误' }
    }
  }
  
  /**
   * 获取对话记录
   */
  async function fetchMessages(ticketId) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/support/messages/${ticketId}`)
      
      if (response.success && response.data) {
        messages.value = response.data
        // 标记为已读
        markMessagesAsRead(ticketId)
        return { success: true, data: response.data }
      } else {
        error.value = response.message || '获取消息失败'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.message || '网络错误'
      console.error('获取消息失败:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 标记消息为已读
   */
  function markMessagesAsRead(ticketId) {
    messages.value.forEach(msg => {
      if (msg.ticketId === ticketId && msg.senderType === 'support') {
        msg.read = true
      }
    })
    updateUnreadCount()
  }
  
  /**
   * 更新未读数量
   */
  function updateUnreadCount() {
    unreadCount.value = messages.value.filter(msg => 
      msg.senderType === 'support' && !msg.read
    ).length
  }
  
  /**
   * 打开客服对话
   */
  function openChat(ticketId = null) {
    chatOpen.value = true
    if (ticketId) {
      fetchTicket(ticketId)
      fetchMessages(ticketId)
    }
  }
  
  /**
   * 关闭客服对话
   */
  function closeChat() {
    chatOpen.value = false
  }
  
  /**
   * 切换对话窗口
   */
  function toggleChat() {
    chatOpen.value = !chatOpen.value
  }
  
  /**
   * 快速发送消息（如果没有激活工单则创建新工单）
   */
  async function quickSend(content) {
    if (!currentTicket.value) {
      // 创建新工单
      const result = await createTicket({
        subject: '在线咨询',
        category: 'other',
        priority: 'medium'
      })
      
      if (!result.success) {
        return result
      }
    }
    
    return await sendMessage(currentTicket.value.id, content)
  }
  
  /**
   * 获取未读消息数（用于显示徽章）
   */
  async function fetchUnreadCount() {
    try {
      const response = await api.get('/support/unread-count')
      if (response.success && response.data) {
        unreadCount.value = response.data.count
      }
    } catch (err) {
      console.error('获取未读数量失败:', err)
    }
  }
  
  /**
   * 关闭工单
   */
  async function closeTicket(ticketId) {
    try {
      const response = await api.put(`/support/tickets/${ticketId}/close`)
      
      if (response.success) {
        const ticket = tickets.value.find(t => t.id === ticketId)
        if (ticket) {
          ticket.status = 'closed'
        }
        if (currentTicket.value?.id === ticketId) {
          currentTicket.value.status = 'closed'
        }
        return { success: true }
      } else {
        return { success: false, message: response.message || '关闭工单失败' }
      }
    } catch (err) {
      console.error('关闭工单失败:', err)
      return { success: false, message: err.message || '网络错误' }
    }
  }

  return {
    // 状态
    tickets,
    currentTicket,
    messages,
    unreadCount,
    chatOpen,
    loading,
    error,
    supportOnline,
    supportAgents,
    
    // 计算属性
    unreadMessages,
    activeTickets,
    closedTickets,
    
    // 方法
    createTicket,
    fetchTickets,
    fetchTicket,
    sendMessage,
    fetchMessages,
    markMessagesAsRead,
    updateUnreadCount,
    openChat,
    closeChat,
    toggleChat,
    quickSend,
    fetchUnreadCount,
    closeTicket
  }
})