<template>
  <div class="admin-dashboard">
    <div class="page-header">
      <div>
        <h1 class="page-title">🔐 管理后台</h1>
        <p class="page-subtitle">欢迎回来，管理员！</p>
      </div>
      <div class="header-actions">
        <button @click="refreshData" class="btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          刷新数据
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card stat-card-users">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">总用户数</div>
          <div class="stat-value">{{ stats.totalUsers }}</div>
          <div class="stat-change positive">+12 本周新增</div>
        </div>
      </div>

      <div class="stat-card stat-card-orders">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">总订单数</div>
          <div class="stat-value">{{ stats.totalOrders }}</div>
          <div class="stat-change positive">+45 今日新增</div>
        </div>
      </div>

      <div class="stat-card stat-card-news">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">今日新闻</div>
          <div class="stat-value">{{ stats.todayNews }}</div>
          <div class="stat-change">来自 5 个数据源</div>
        </div>
      </div>

      <div class="stat-card stat-card-strategies">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="20" x2="12" y2="10"/>
            <line x1="18" y1="20" x2="18" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="16"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">活跃策略</div>
          <div class="stat-value">{{ stats.activeStrategies }}</div>
          <div class="stat-change">{{ stats.totalStrategies }} 个策略</div>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📊 系统概览</h3>
        </div>
        <div class="card-body">
          <div class="overview-item">
            <span class="overview-label">服务器状态</span>
            <span class="badge badge-success">运行中</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">数据库状态</span>
            <span class="badge badge-success">正常</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">API状态</span>
            <span class="badge badge-success">在线</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">WebSocket</span>
            <span class="badge badge-success">连接中</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">新闻源状态</span>
            <span class="badge badge-success">5/5 活跃</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">⚡ 快速操作</h3>
        </div>
        <div class="card-body">
          <div class="quick-actions">
            <router-link to="/admin/users" class="action-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              用户管理
            </router-link>
            
            <router-link to="/admin/system" class="action-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
              </svg>
              系统配置
            </router-link>
            
            <router-link to="/admin/logs" class="action-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              系统日志
            </router-link>
            
            <router-link to="/admin/analytics" class="action-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              数据分析
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">📝 最近活动</h3>
      </div>
      <div class="card-body">
        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon" :class="`activity-${activity.type}`">
              {{ activity.icon }}
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({
  totalUsers: 156,
  totalOrders: 2847,
  todayNews: 128,
  activeStrategies: 23,
  totalStrategies: 45
})

const recentActivities = ref([
  { id: 1, type: 'user', icon: '👤', title: '新用户注册: user@example.com', time: '5分钟前' },
  { id: 2, type: 'order', icon: '📋', title: '新订单创建: BTC/USDT', time: '12分钟前' },
  { id: 3, type: 'news', icon: '📰', title: '新闻导入: 15条市场新闻', time: '25分钟前' },
  { id: 4, type: 'system', icon: '⚙️', title: '系统配置更新', time: '1小时前' },
  { id: 5, type: 'user', icon: '👤', title: '用户登录: admin@example.com', time: '2小时前' }
])

function refreshData() {
  console.log('刷新数据')
}

onMounted(() => {
  console.log('管理员仪表盘已加载')
})
</script>

<style scoped>
.admin-dashboard {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #718096;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-card-users .stat-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-card-orders .stat-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-card-news .stat-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stat-card-strategies .stat-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  color: #718096;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
}

.stat-change {
  font-size: 12px;
  color: #a0aec0;
}

.stat-change.positive {
  color: #48bb78;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.card-body {
  padding: 20px;
}

.overview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f7fafc;
}

.overview-item:last-child {
  border-bottom: none;
}

.overview-label {
  font-size: 14px;
  color: #4a5568;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: #c6f6d5;
  color: #22543d;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 12px;
  text-decoration: none;
  color: #2d3748;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #edf2f7;
  transform: translateX(4px);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: white;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  color: #2d3748;
  font-weight: 500;
}

.activity-time {
  font-size: 12px;
  color: #a0aec0;
  margin-top: 2px;
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

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>