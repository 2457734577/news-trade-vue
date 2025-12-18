<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="not-found-icon">404</div>
      <h1 class="not-found-title">页面未找到</h1>
      <p class="not-found-text">抱歉，您访问的页面不存在或已被移除</p>
      <div class="not-found-actions">
        <router-link to="/user/dashboard" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          返回首页
        </router-link>
        <button class="btn btn-secondary" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          返回上页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--bg-primary);
}

.not-found-content {
  text-align: center;
  max-width: 500px;
}

.not-found-icon {
  font-size: 8rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 1rem;
}

.not-found-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.not-found-text {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.not-found-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

@media (max-width: 480px) {
  .not-found-icon {
    font-size: 5rem;
  }
  
  .not-found-title {
    font-size: 1.5rem;
  }
  
  .not-found-actions {
    flex-direction: column;
  }
}
</style>