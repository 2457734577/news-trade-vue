<template>
  <aside class="user-sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-icon">📊</span>
        <span v-if="!collapsed" class="logo-text">News Trade</span>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <router-link 
        v-for="item in menuItems" 
        :key="item.path"
        :to="item.path" 
        class="nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <span class="nav-icon" v-html="item.icon"></span>
        <span v-if="!collapsed" class="nav-text">{{ item.label }}</span>
        <span v-if="!collapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
      </router-link>
    </nav>
    
    <div class="sidebar-footer">
      <button @click="$emit('toggle')" class="collapse-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline :points="collapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'"/>
        </svg>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle'])

const route = useRoute()

const menuItems = [
  {
    path: '/user/dashboard',
    label: '仪表盘',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
  },
  {
    path: '/user/assets',
    label: '我的资产',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
  },
  {
    path: '/user/accounts',
    label: '交易账户',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>'
  },
  {
    path: '/user/orders',
    label: '交易订单',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
    badge: '12'
  },
  {
    path: '/user/news',
    label: '新闻监控',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg>'
  },
  {
    path: '/user/rules',
    label: '交易策略',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>'
  },
  {
    path: '/user/analytics',
    label: '数据分析',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'
  },
  {
    path: '/user/support',
    label: '客服支持',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    badge: '2'
  }
]

function isActive(path) {
  return route.path.startsWith(path)
}
</script>

<style scoped>
.user-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  z-index: 200;
  transition: width var(--transition-normal);
}

.user-sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid #e2e8f0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-nav {
  flex: 1;
  padding: 24px 12px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  color: #4a5568;
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
}

.nav-item:hover {
  background: #f7fafc;
  color: #667eea;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.nav-badge {
  padding: 2px 8px;
  background: #667eea;
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
}

.collapse-btn {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #4a5568;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: #f7fafc;
  border-color: #667eea;
  color: #667eea;
}

.user-sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 0;
}

.user-sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 12px;
}

@media (max-width: 768px) {
  .user-sidebar {
    transform: translateX(-100%);
  }
  
  .user-sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}
</style>