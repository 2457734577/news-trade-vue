<template>
  <div class="news-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">新闻监控</h1>
        <p class="page-subtitle">实时追踪市场新闻动态</p>
      </div>
      <button class="btn btn-primary" @click="refreshNews">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
        刷新
      </button>
    </div>
    
    <!-- 筛选栏 -->
    <div class="card mb-6">
      <div class="filters">
        <div class="filter-group">
          <label class="form-label">关键词</label>
          <input type="text" v-model="filters.keyword" placeholder="搜索新闻..." class="form-input" @keyup.enter="handleFilter">
        </div>
        <div class="filter-group">
          <label class="form-label">影响程度</label>
          <select v-model="filters.impact" class="form-input" @change="handleFilter">
            <option value="">全部</option>
            <option value="HIGH">高影响</option>
            <option value="MEDIUM">中影响</option>
            <option value="LOW">低影响</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="form-label">来源</label>
          <input type="text" v-model="filters.source" placeholder="新闻来源" class="form-input" @keyup.enter="handleFilter">
        </div>
        <div class="filter-actions">
          <button class="btn btn-secondary" @click="resetFilters">重置</button>
          <button class="btn btn-primary" @click="handleFilter">搜索</button>
        </div>
      </div>
    </div>
    
    <!-- 新闻列表 -->
    <div v-if="loading" class="loading-state"><div class="spinner"></div></div>
    
    <div v-else-if="newsList.length === 0" class="empty-state card">
      <div class="empty-state-icon">📰</div>
      <p class="empty-state-title">暂无新闻</p>
      <p class="empty-state-text">当前筛选条件下没有新闻</p>
    </div>
    
    <div v-else class="news-grid">
      <div v-for="news in newsList" :key="news.id" class="news-card card" @click="showDetail(news)">
        <div class="news-header">
          <span :class="['badge', getImpactBadge(news.impact)]">
            {{ getImpactText(news.impact) }}
          </span>
          <span class="news-source">{{ news.source }}</span>
        </div>
        <h3 class="news-title">{{ news.title }}</h3>
        <p class="news-summary">{{ truncateText(news.summary, 120) }}</p>
        <div class="news-footer">
          <span class="news-time">{{ formatRelativeTime(news.publishedAt) }}</span>
          <div class="news-symbols" v-if="news.relatedSymbols?.length">
            <span v-for="symbol in news.relatedSymbols.slice(0, 3)" :key="symbol" class="symbol-tag">{{ symbol }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分页 -->
    <div class="pagination" v-if="pagination.totalPages > 1">
      <button class="pagination-btn" :disabled="pagination.page <= 1" @click="changePage(pagination.page - 1)">上一页</button>
      <span class="pagination-info">第 {{ pagination.page }} / {{ pagination.totalPages }} 页</span>
      <button class="pagination-btn" :disabled="pagination.page >= pagination.totalPages" @click="changePage(pagination.page + 1)">下一页</button>
    </div>
    
    <!-- 详情弹窗 -->
    <Teleport to="body">
      <div v-if="selectedNews" class="modal-overlay" @click="closeDetail">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <span :class="['badge', getImpactBadge(selectedNews.impact)]">{{ getImpactText(selectedNews.impact) }}</span>
            <button class="modal-close" @click="closeDetail">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <h2 class="modal-title">{{ selectedNews.title }}</h2>
          <div class="modal-meta">
            <span>{{ selectedNews.source }}</span>
            <span>{{ formatDateTime(selectedNews.publishedAt) }}</span>
          </div>
          <div class="modal-content">{{ selectedNews.content || selectedNews.summary }}</div>
          <div class="modal-symbols" v-if="selectedNews.relatedSymbols?.length">
            <span class="modal-symbols-label">相关标的：</span>
            <span v-for="symbol in selectedNews.relatedSymbols" :key="symbol" class="symbol-tag">{{ symbol }}</span>
          </div>
          <div class="modal-footer" v-if="selectedNews.url">
            <a :href="selectedNews.url" target="_blank" class="btn btn-primary">查看原文</a>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useNewsStore } from '@/stores/news'
import { formatDateTime, formatRelativeTime, truncateText } from '@/utils/format'

const newsStore = useNewsStore()
const loading = ref(true)
const selectedNews = ref(null)
const filters = reactive({ keyword: '', impact: '', source: '' })

const newsList = computed(() => newsStore.newsList)
const pagination = computed(() => newsStore.pagination)

function getImpactBadge(impact) {
  const map = { HIGH: 'badge-danger', MEDIUM: 'badge-warning', LOW: 'badge-info' }
  return map[impact] || 'badge-secondary'
}

function getImpactText(impact) {
  const map = { HIGH: '高影响', MEDIUM: '中影响', LOW: '低影响' }
  return map[impact] || impact
}

async function fetchNews() {
  loading.value = true
  await newsStore.fetchNews()
  loading.value = false
}

function handleFilter() {
  newsStore.setFilters(filters)
  fetchNews()
}

function resetFilters() {
  Object.assign(filters, { keyword: '', impact: '', source: '' })
  newsStore.resetFilters()
  fetchNews()
}

function refreshNews() {
  fetchNews()
}

function changePage(page) {
  newsStore.setPage(page)
  fetchNews()
}

function showDetail(news) {
  selectedNews.value = news
}

function closeDetail() {
  selectedNews.value = null
}

onMounted(fetchNews)
</script>

<style scoped>
.news-page { max-width: 1400px; margin: 0 auto; }
.filters { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; }
.filter-group { flex: 1; min-width: 150px; }
.filter-group .form-input { width: 100%; }
.filter-actions { display: flex; gap: 0.5rem; }
.loading-state { display: flex; justify-content: center; padding: 3rem; }
.news-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
.news-card { cursor: pointer; transition: all var(--transition-fast); }
.news-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.news-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.news-source { font-size: 0.8125rem; color: var(--text-muted); }
.news-title { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; line-height: 1.4; }
.news-summary { font-size: 0.9375rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.6; }
.news-footer { display: flex; justify-content: space-between; align-items: center; }
.news-time { font-size: 0.8125rem; color: var(--text-muted); }
.news-symbols { display: flex; gap: 0.5rem; }
.symbol-tag { padding: 0.125rem 0.5rem; background: var(--bg-tertiary); border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 500; color: var(--text-secondary); }
.pagination-info { font-size: 0.875rem; color: var(--text-secondary); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal { background: var(--bg-secondary); border-radius: var(--radius-xl); max-width: 700px; width: 100%; max-height: 80vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 1.5rem 0; }
.modal-close { padding: 0.5rem; border-radius: var(--radius-md); color: var(--text-muted); }
.modal-close:hover { background: var(--bg-tertiary); color: var(--text-primary); }
.modal-title { font-size: 1.25rem; font-weight: 600; padding: 1rem 1.5rem; line-height: 1.4; }
.modal-meta { display: flex; gap: 1rem; padding: 0 1.5rem; font-size: 0.875rem; color: var(--text-secondary); }
.modal-content { padding: 1.5rem; font-size: 1rem; line-height: 1.8; color: var(--text-primary); white-space: pre-wrap; }
.modal-symbols { padding: 0 1.5rem; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.modal-symbols-label { font-size: 0.875rem; color: var(--text-secondary); }
.modal-footer { padding: 1.5rem; border-top: 1px solid var(--border-light); }

@media (max-width: 768px) {
  .filters { flex-direction: column; }
  .filter-group { width: 100%; }
  .news-grid { grid-template-columns: 1fr; }
}
</style>