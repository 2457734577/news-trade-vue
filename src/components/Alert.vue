<template>
  <teleport to="body">
    <transition name="alert">
      <div v-if="alertStore.visible" class="alert-container">
        <div class="alert" :class="`alert-${alertStore.type}`">
          <svg v-if="alertStore.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <svg v-else-if="alertStore.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <svg v-else-if="alertStore.type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>{{ alertStore.message }}</span>
          <button class="alert-close" @click="alertStore.hide()">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { useAlertStore } from '@/stores/alert'

const alertStore = useAlertStore()
</script>

<style scoped>
.alert-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
}

.alert {
  min-width: 300px;
  max-width: 500px;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideIn 0.3s ease;
}

.alert svg:first-child {
  flex-shrink: 0;
}

.alert span {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.alert-close {
  flex-shrink: 0;
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: currentColor;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.alert-close:hover {
  opacity: 1;
}

.alert-success {
  color: #059669;
  background: #ecfdf5;
  border-left: 4px solid #10b981;
}

.alert-error {
  color: #dc2626;
  background: #fef2f2;
  border-left: 4px solid #ef4444;
}

.alert-warning {
  color: #d97706;
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
}

.alert-info {
  color: #2563eb;
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
}

.alert-enter-active,
.alert-leave-active {
  transition: all 0.3s ease;
}

.alert-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.alert-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>