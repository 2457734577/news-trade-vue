<template>
  <div class="support-button-wrapper">
    <!-- 客服悬浮按钮 -->
    <button 
      v-if="!supportStore.chatOpen"
      @click="handleClick" 
      class="support-fab"
      :class="{ 'has-unread': hasUnread }"
    >
      <!-- 未读徽章 -->
      <span v-if="hasUnread" class="unread-badge">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
      
      <!-- 客服图标 -->
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="28" 
        height="28" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <path d="M8 10h.01"/>
        <path d="M12 10h.01"/>
        <path d="M16 10h.01"/>
      </svg>
    </button>

    <!-- 客服对话窗口 -->
    <transition name="chat-slide">
      <SupportChat v-if="supportStore.chatOpen" @close="handleClose" />
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSupportStore } from '@/stores/support'
import SupportChat from './SupportChat.vue'

const supportStore = useSupportStore()

// 计算属性
const hasUnread = computed(() => supportStore.unreadCount > 0)
const unreadCount = computed(() => supportStore.unreadCount)

// 点击按钮
function handleClick() {
  supportStore.openChat()
}

// 关闭对话
function handleClose() {
  supportStore.closeChat()
}

// 定时获取未读消息数
let unreadInterval = null

onMounted(() => {
  // 初始获取未读数
  supportStore.fetchUnreadCount()
  
  // 每30秒刷新一次未读数
  unreadInterval = setInterval(() => {
    supportStore.fetchUnreadCount()
  }, 30000)
})

onUnmounted(() => {
  if (unreadInterval) {
    clearInterval(unreadInterval)
  }
})
</script>

<style scoped>
.support-button-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.support-fab {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.support-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.support-fab:active {
  transform: scale(0.95);
}

.support-fab.has-unread {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.6);
  }
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: #ff4757;
  color: white;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(255, 71, 87, 0.3);
}

/* 对话窗口过渡动画 */
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .support-button-wrapper {
    bottom: 16px;
    right: 16px;
  }
  
  .support-fab {
    width: 56px;
    height: 56px;
  }
  
  .support-fab svg {
    width: 24px;
    height: 24px;
  }
}
</style>