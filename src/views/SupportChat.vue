<template>
  <div class="support-chat">
    <div class="chat-container">
      <!-- 头部 -->
      <div class="chat-header">
        <div class="header-info">
          <div class="agent-avatar">👨‍💼</div>
          <div class="agent-details">
            <h3 class="agent-name">客服小助手</h3>
            <span class="agent-status" :class="{ online: supportStore.supportOnline }">
              {{ supportStore.supportOnline ? '在线' : '离线' }}
            </span>
          </div>
        </div>
        <button @click="$emit('close')" class="close-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- 消息列表 -->
      <div ref="messagesContainer" class="chat-messages">
        <div v-if="supportStore.loading" class="loading-indicator">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="supportStore.messages.length === 0" class="empty-messages">
          <div class="welcome-icon">👋</div>
          <h3>您好！有什么可以帮您？</h3>
          <p>请随时向我们提问，我们会尽快回复您。</p>
          
          <!-- 快捷问题 -->
          <div class="quick-questions">
            <button 
              v-for="q in quickQuestions" 
              :key="q.id"
              @click="selectQuickQuestion(q)"
              class="quick-question-btn"
            >
              {{ q.text }}
            </button>
          </div>
        </div>

        <div v-else class="messages-list">
          <div 
            v-for="message in supportStore.messages" 
            :key="message.id"
            :class="['message', message.senderType === 'user' ? 'message-user' : 'message-support']"
          >
            <div class="message-avatar">
              {{ message.senderType === 'user' ? '👤' : '👨‍💼' }}
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <p>{{ message.content }}</p>
                
                <!-- 附件 -->
                <div v-if="message.attachments && message.attachments.length > 0" class="message-attachments">
                  <a 
                    v-for="(attachment, index) in message.attachments" 
                    :key="index"
                    :href="attachment.url"
                    target="_blank"
                    class="attachment-link"
                  >
                    📎 {{ attachment.name }}
                  </a>
                </div>
              </div>
              <span class="message-time">{{ formatTime(message.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="chat-input">
        <div class="input-wrapper">
          <textarea
            v-model="messageText"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.enter.shift.exact.prevent="messageText += '\n'"
            placeholder="输入消息... (Enter发送, Shift+Enter换行)"
            class="message-textarea"
            rows="1"
          ></textarea>
          
          <!-- 工具栏 -->
          <div class="input-toolbar">
            <button @click="openTicketForm" class="toolbar-btn" title="创建工单">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </button>
            
            <button 
              @click="sendMessage" 
              :disabled="!messageText.trim() || sending"
              class="send-button"
            >
              <svg v-if="!sending" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              <div v-else class="spinner-small"></div>
            </button>
          </div>
        </div>
      </div>

      <!-- 底部链接 -->
      <div class="chat-footer">
        <router-link to="/user/support" class="footer-link">查看历史工单</router-link>
        <span class="separator">•</span>
        <a href="#" @click.prevent="showFAQ" class="footer-link">常见问题</a>
      </div>
    </div>

    <!-- 工单表单弹窗 -->
    <transition name="modal-fade">
      <div v-if="showTicketForm" class="modal-overlay" @click="showTicketForm = false">
        <div class="modal-content" @click.stop>
          <TicketForm @close="showTicketForm = false" @submit="handleTicketSubmit" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useSupportStore } from '@/stores/support'
import TicketForm from './TicketForm.vue'

const emit = defineEmits(['close'])

const supportStore = useSupportStore()

// 状态
const messageText = ref('')
const sending = ref(false)
const messagesContainer = ref(null)
const showTicketForm = ref(false)

// 快捷问题
const quickQuestions = ref([
  { id: 1, text: '如何添加交易所账户？', category: 'account' },
  { id: 2, text: '策略设置说明', category: 'trading' },
  { id: 3, text: '订单为什么失败？', category: 'technical' },
  { id: 4, text: '如何充值/提现？', category: 'account' }
])

// 方法

/**
 * 发送消息
 */
async function sendMessage() {
  if (!messageText.value.trim() || sending.value) return
  
  const content = messageText.value.trim()
  messageText.value = ''
  sending.value = true
  
  try {
    const result = await supportStore.quickSend(content)
    
    if (result.success) {
      // 滚动到底部
      await nextTick()
      scrollToBottom()
    } else {
      // 恢复消息文本
      messageText.value = content
      alert(result.message || '发送失败，请重试')
    }
  } catch (error) {
    messageText.value = content
    alert('发送失败，请检查网络连接')
  } finally {
    sending.value = false
  }
}

/**
 * 选择快捷问题
 */
function selectQuickQuestion(question) {
  messageText.value = question.text
  sendMessage()
}

/**
 * 滚动到底部
 */
function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

/**
 * 格式化时间
 */
function formatTime(timestamp) {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  
  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  
  // 今天
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  
  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  }
  
  // 其他
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' +
         date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

/**
 * 打开工单表单
 */
function openTicketForm() {
  showTicketForm.value = true
}

/**
 * 处理工单提交
 */
function handleTicketSubmit(ticketData) {
  showTicketForm.value = false
  // 刷新消息列表
  if (supportStore.currentTicket) {
    supportStore.fetchMessages(supportStore.currentTicket.id)
  }
}

/**
 * 显示FAQ
 */
function showFAQ() {
  // 跳转到FAQ页面或打开FAQ对话框
  window.open('/faq', '_blank')
}

// 监听消息变化，自动滚动到底部
watch(
  () => supportStore.messages.length,
  async () => {
    await nextTick()
    scrollToBottom()
  }
)
</script>

<style scoped>
.support-chat {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 999;
}

.chat-container {
  width: 380px;
  height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 头部 */
.chat-header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.agent-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.agent-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.agent-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.agent-status {
  font-size: 12px;
  opacity: 0.9;
}

.agent-status.online::before {
  content: '●';
  color: #2ecc71;
  margin-right: 4px;
}

.close-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 消息区域 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f7f8fa;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 20px;
}

.welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-messages h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
}

.empty-messages p {
  margin: 0 0 24px 0;
  color: #666;
  font-size: 14px;
}

.quick-questions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 280px;
}

.quick-question-btn {
  padding: 12px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  text-align: left;
  color: #333;
}

.quick-question-btn:hover {
  background: #f5f5f5;
  border-color: #667eea;
  transform: translateY(-1px);
}

/* 消息列表 */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 8px;
}

.message-user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 70%;
}

.message-user .message-content {
  align-items: flex-end;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.message-user .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-bubble p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-time {
  font-size: 11px;
  color: #999;
  padding: 0 4px;
}

.message-attachments {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attachment-link {
  font-size: 12px;
  color: inherit;
  text-decoration: none;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.attachment-link:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* 输入框 */
.chat-input {
  padding: 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-textarea {
  width: 100%;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  transition: border-color 0.2s;
}

.message-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.input-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.toolbar-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #f5f5f5;
  color: #667eea;
}

.send-button {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 底部 */
.chat-footer {
  padding: 12px 20px;
  background: #f7f8fa;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
}

.footer-link {
  color: #667eea;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}

.separator {
  color: #ccc;
}

/* 加载动画 */
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .support-chat {
    bottom: 0;
    right: 0;
    left: 0;
  }
  
  .chat-container {
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }
}
</style>