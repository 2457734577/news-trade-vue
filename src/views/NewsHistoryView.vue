<template>
  <div class="news-history-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">历史新闻管理</h1>
        <p class="page-subtitle">管理和分类历史新闻数据，用于策略回测和模板提取</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="openImportModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          导入新闻
        </button>
        <button class="btn btn-primary" @click="batchFetchKline" :disabled="fetchingKline || selectedIds.length === 0">
          <span v-if="fetchingKline" class="spinner"></span>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          获取K线 ({{ selectedIds.length }})
        </button>
        <button class="btn btn-secondary" @click="extractTemplates">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
          提取模板
        </button>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 mb-6">
      <div class="stat-card">
        <div class="stat-icon stat-icon-primary">📰</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总新闻数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-success">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.categorized }}</div>
          <div class="stat-label">已分类</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-warning">📋</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.templates }}</div>
          <div class="stat-label">模板数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-danger">⏳</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">待处理</div>
        </div>
      </div>
    </div>
    
    <!-- 筛选和搜索 -->
    <div class="card mb-6">
      <div class="filters">
        <div class="filter-group">
          <label class="form-label">新闻类型</label>
          <select v-model="filters.type" class="form-input" @change="loadNews">
            <option value="">全部类型</option>
            <option v-for="t in newsTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="form-label">关联币种</label>
          <select v-model="filters.hasSymbol" class="form-input" @change="loadNews">
            <option value="">全部</option>
            <option value="true">有币种</option>
            <option value="false">无币种</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="form-label">K线状态</label>
          <select v-model="filters.klineStatus" class="form-input" @change="loadNews">
            <option value="">全部</option>
            <option value="pending">待收集</option>
            <option value="collected">已收集</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="form-label">来源</label>
          <select v-model="filters.source" class="form-input" @change="loadNews">
            <option value="">全部来源</option>
            <option value="binance">Binance</option>
            <option value="upbit">Upbit</option>
            <option value="bithumb">Bithumb</option>
            <option value="telegram">Telegram</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="form-label">开始日期</label>
          <input type="date" v-model="filters.startDate" class="form-input" @change="loadNews">
        </div>
        <div class="filter-group">
          <label class="form-label">结束日期</label>
          <input type="date" v-model="filters.endDate" class="form-input" @change="loadNews">
        </div>
        <div class="filter-group flex-2">
          <label class="form-label">搜索</label>
          <input type="text" v-model="filters.keyword" class="form-input" placeholder="搜索新闻内容..." @keyup.enter="loadNews">
        </div>
      </div>
    </div>
    
    <!-- 新闻列表 -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">新闻列表</h3>
        <div class="header-actions">
          <button class="btn btn-sm btn-secondary" @click="batchCategorize" :disabled="selectedIds.length === 0">
            批量分类 ({{ selectedIds.length }})
          </button>
        </div>
      </div>
      <div class="card-body">
        <div v-if="loading" class="loading-state"><div class="spinner"></div></div>
        <div v-else-if="newsList.length === 0" class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p class="empty-state-title">暂无新闻</p>
          <p class="empty-state-text">点击"导入新闻"开始添加历史数据</p>
        </div>
        <div v-else class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th><input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected"></th>
                <th>时间</th>
                <th>来源</th>
                <th>内容</th>
                <th>类型</th>
                <th>关联币种</th>
                <th>K线</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="news in newsList" :key="news.id">
                <td><input type="checkbox" :value="news.id" v-model="selectedIds"></td>
                <td class="nowrap">{{ formatDateTime(news.publishedAt) }}</td>
                <td><span class="badge badge-secondary">{{ news.source }}</span></td>
                <td class="news-content">{{ truncateText(news.content, 80) }}</td>
                <td>
                  <select v-model="news.type" class="form-input form-input-sm" @change="updateNewsType(news)">
                    <option value="">未分类</option>
                    <option v-for="t in newsTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
                  </select>
                </td>
                <td>
                  <span v-if="news.symbol" class="coin-tag">{{ news.symbol }}</span>
                  <span v-else class="text-muted">无</span>
                </td>
                <td>
                  <span v-if="news.klineCollected" class="badge badge-success">已收集</span>
                  <span v-else class="badge badge-warning">待收集</span>
                </td>
                <td>
                  <button class="btn btn-sm btn-secondary" @click="viewNews(news)">详情</button>
                  <button class="btn btn-sm btn-danger" @click="deleteNews(news.id)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- 分页 -->
    <div class="pagination-bar">
      <div class="page-size">
        <span>每页</span>
        <select v-model="pagination.pageSize" class="form-input form-input-sm" @change="loadNews(true)">
          <option :value="20">20条</option>
          <option :value="50">50条</option>
          <option :value="100">100条</option>
          <option :value="9999">全部</option>
        </select>
      </div>
      <div class="pagination" v-if="pagination.totalPages > 1">
        <button class="pagination-btn" :disabled="pagination.page <= 1" @click="changePage(pagination.page - 1)">上一页</button>
        <span class="pagination-info">第 {{ pagination.page }} / {{ pagination.totalPages }} 页，共 {{ pagination.total }} 条</span>
        <button class="pagination-btn" :disabled="pagination.page >= pagination.totalPages" @click="changePage(pagination.page + 1)">下一页</button>
      </div>
      <div v-else class="pagination-info">共 {{ pagination.total }} 条</div>
    </div>
    
    <!-- 导入弹窗 -->
    <Teleport to="body">
      <div v-if="showImportModal" class="modal-overlay" @click="showImportModal = false">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">导入新闻数据</h3>
            <button class="modal-close" @click="showImportModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">数据来源</label>
              <select v-model="importForm.source" class="form-input">
                <option value="telegram">Telegram 频道导出</option>
                <option value="api">API 拉取</option>
                <option value="file">JSON 文件</option>
              </select>
            </div>
            <div class="form-group" v-if="importForm.source === 'telegram'">
              <label class="form-label">Telegram JSON 文件</label>
              <input type="file" accept=".json" @change="handleFileSelect" class="form-input">
            </div>
            <div class="form-group" v-if="importForm.source === 'api'">
              <label class="form-label">频道/来源</label>
              <select v-model="importForm.channel" class="form-input">
                <option value="binance_announce">Binance 公告</option>
                <option value="upbit_announce">Upbit 公告</option>
                <option value="bithumb_announce">Bithumb 公告</option>
              </select>
            </div>
            <div class="form-group" v-if="importForm.source === 'api'">
              <label class="form-label">日期范围</label>
              <div class="form-row">
                <input type="date" v-model="importForm.startDate" class="form-input">
                <input type="date" v-model="importForm.endDate" class="form-input">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showImportModal = false">取消</button>
            <button class="btn btn-primary" @click="importNews" :disabled="importing">
              <span v-if="importing" class="spinner"></span>
              <span v-else>开始导入</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- 新闻详情弹窗 -->
    <div v-if="selectedNews" class="modal-overlay" @click="selectedNews = null">
      <div class="modal modal-lg" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">新闻详情</h3>
          <button class="modal-close" @click="selectedNews = null">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-label">发布时间</span>
            <span>{{ formatDateTimeUTC8(selectedNews.publishedAt) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">来源</span>
            <span class="badge badge-secondary">{{ selectedNews.source }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">类型</span>
            <span class="badge badge-primary">{{ getTypeName(selectedNews.type) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">关联币种</span>
            <span v-if="selectedNews.symbol" class="coin-tag">{{ selectedNews.symbol }}</span>
            <span v-else class="text-muted">无</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">K线状态</span>
            <span v-if="selectedNews.klineCollected" class="badge badge-success">已收集</span>
            <span v-else class="badge badge-warning">待收集</span>
          </div>
          <div class="detail-section">
            <span class="detail-label">原文内容</span>
            <div class="news-full-content">{{ selectedNews.content }}</div>
          </div>
          <div class="detail-section" v-if="selectedNews.template">
            <span class="detail-label">匹配模板</span>
            <div class="template-content">{{ selectedNews.template }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/utils/api'
import { useAlertStore } from '@/stores/alert'
import { formatDateTime, truncateText } from '@/utils/format'

const alertStore = useAlertStore()
const loading = ref(true)
const importing = ref(false)
const fetchingKline = ref(false)
const showImportModal = ref(false)
const selectedNews = ref(null)
const newsList = ref([])
const selectedIds = ref([])

const stats = reactive({ total: 0, categorized: 0, templates: 0, pending: 0 })
const filters = reactive({ type: '', source: '', startDate: '', endDate: '', keyword: '', hasSymbol: '', klineStatus: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
const importForm = reactive({ source: 'telegram', channel: '', startDate: '', endDate: '', file: null })

const newsTypes = [
  { value: 'LISTING', label: '上币公告' },
  { value: 'DELISTING', label: '下币公告' },
  { value: 'AIRDROP', label: '空投' },
  { value: 'LAUNCHPOOL', label: 'Launchpool' },
  { value: 'LAUNCHPAD', label: 'Launchpad' },
  { value: 'FUTURES_LISTING', label: '合约上线' },
  { value: 'LEVERAGE_UPDATE', label: '杠杆调整' },
  { value: 'TRADING_PAIR', label: '交易对更新' },
  { value: 'MAINTENANCE', label: '系统维护' },
  { value: 'PROMOTION', label: '活动促销' },
  { value: 'OTHER', label: '其他' }
]

const isAllSelected = computed(() => newsList.value.length > 0 && selectedIds.value.length === newsList.value.length)

function getTypeName(type) {
  return newsTypes.find(t => t.value === type)?.label || type || '未分类'
}

function formatDateTimeUTC8(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  // 转UTC+8
  const utc8 = new Date(date.getTime() + 8 * 60 * 60 * 1000)
  return utc8.toISOString().replace('T', ' ').substring(0, 19) + ' (UTC+8)'
}

function toggleSelectAll(e) {
  selectedIds.value = e.target.checked ? newsList.value.map(n => n.id) : []
}

function openImportModal() {
  console.log('打开导入弹窗')
  showImportModal.value = true
}

async function loadNews(resetPage = true) {
  loading.value = true
  if (resetPage) pagination.page = 1
  try {
    const params = { page: pagination.page - 1, size: pagination.pageSize }
    if (filters.type) params.type = filters.type
    if (filters.source) params.source = filters.source
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.startDate) params.start = filters.startDate
    if (filters.endDate) params.end = filters.endDate
    if (filters.hasSymbol) params.hasSymbol = filters.hasSymbol
    if (filters.klineStatus) params.klineStatus = filters.klineStatus
    
    const response = await api.get('/news', { params })
    if (response.success) {
      newsList.value = response.data?.content || response.data || []
      pagination.total = response.data?.totalElements || newsList.value.length
      pagination.totalPages = response.data?.totalPages || 1
      if (response.data?.stats) Object.assign(stats, response.data.stats)
    }
  } catch (error) {
    console.error('加载新闻失败:', error)
    newsList.value = []
  } finally {
    loading.value = false
  }
}

async function batchFetchKline() {
  if (selectedIds.value.length === 0) {
    alertStore.warning('请先选择要获取K线的新闻')
    return
  }
  
  const newsItems = newsList.value
    .filter(n => selectedIds.value.includes(n.id) && n.symbol)
    .map(n => {
      // 解析symbol：可能是数组、字符串"[A, B]"、或单个"A"
      let symbols = n.symbol
      if (typeof symbols === 'string') {
        if (symbols.startsWith('[')) {
          // "[ARB, LAVA]" -> ["ARB", "LAVA"]
          symbols = symbols.slice(1, -1).split(',').map(s => s.trim())
        } else {
          symbols = [symbols]
        }
      }
      return {
        newsId: n.id,
        symbol: symbols,
        newsTime: n.publishedAt
      }
    })
  
  if (newsItems.length === 0) {
    alertStore.warning('选中的新闻没有关联币种')
    return
  }
  
  fetchingKline.value = true
  try {
    const response = await api.post('/kline/collect/batch', { newsIds: newsItems })
    if (response.success) {
      alertStore.success(`成功: ${response.data?.success || 0}, 失败: ${response.data?.failed || 0}`)
      selectedIds.value = []
      loadNews(false)
    }
  } catch (error) {
    alertStore.error('批量获取失败')
  } finally {
    fetchingKline.value = false
  }
}

function changePage(page) {
  pagination.page = page
  loadNews(false)
}

function viewNews(news) {
  console.log('打开详情弹窗:', news.id)
  selectedNews.value = news
}

async function updateNewsType(news) {
  try {
    await api.patch(`/news/history/${news.id}`, { type: news.type })
    alertStore.success('分类已更新')
  } catch (error) {
    alertStore.error('更新失败')
  }
}

async function deleteNews(id) {
  if (!confirm('确定删除这条新闻？')) return
  try {
    await api.delete(`/news/history/${id}`)
    alertStore.success('已删除')
    loadNews()
  } catch (error) {
    alertStore.error('删除失败')
  }
}

async function batchCategorize() {
  alertStore.info('批量分类功能开发中')
}

function handleFileSelect(e) {
  importForm.file = e.target.files[0]
}

async function importNews() {
  importing.value = true
  try {
    const formData = new FormData()
    formData.append('source', importForm.source)
    if (importForm.file) formData.append('file', importForm.file)
    if (importForm.channel) formData.append('channel', importForm.channel)
    if (importForm.startDate) formData.append('startDate', importForm.startDate)
    if (importForm.endDate) formData.append('endDate', importForm.endDate)
    
    const response = await api.upload('/news/import', formData)
    if (response.success) {
      alertStore.success(`成功导入 ${response.data.count} 条新闻`)
      showImportModal.value = false
      loadNews()
    } else {
      alertStore.error(response.message || '导入失败')
    }
  } catch (error) {
    alertStore.error('导入失败')
  } finally {
    importing.value = false
  }
}

async function extractTemplates() {
  try {
    const response = await api.post('/news/templates/extract')
    if (response.success) {
      alertStore.success(`提取了 ${response.data.count} 个新模板`)
    }
  } catch (error) {
    alertStore.error('模板提取失败')
  }
}

onMounted(() => {
  loadNews().catch(e => {
    console.error('初始化失败:', e)
    loading.value = false
  })
})
</script>

<style scoped>
.news-history-page { max-width: 1400px; margin: 0 auto; }
.header-actions { display: flex; gap: 0.5rem; }
.filters { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; }
.filter-group { flex: 1; min-width: 120px; }
.filter-group.flex-2 { flex: 2; }
.form-row { display: flex; gap: 0.5rem; }
.news-content { max-width: 300px; font-size: 0.875rem; color: var(--text-secondary); }
.coin-tags { display: flex; flex-wrap: wrap; gap: 0.25rem; }
.coin-tag { padding: 0.125rem 0.5rem; background: var(--primary-color); color: white; border-radius: var(--radius-full); font-size: 0.75rem; }
.form-input-sm { padding: 0.375rem 0.5rem; font-size: 0.8125rem; }
.detail-row { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-light); }
.detail-label { color: var(--text-secondary); font-weight: 500; }
.detail-section { margin-top: 1rem; }
.detail-section .detail-label { display: block; margin-bottom: 0.5rem; }
.news-full-content { padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-md); line-height: 1.6; white-space: pre-wrap; }
.template-content { padding: 1rem; background: var(--bg-secondary); border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.875rem; }
.nowrap { white-space: nowrap; }
.pagination-bar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; }
.page-size { display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.875rem; }
.page-size .form-input-sm { width: 80px; }

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  overflow: hidden;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
}
.modal-title { font-size: 1.125rem; font-weight: 600; margin: 0; }
.modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
.modal-body { padding: 1.5rem; overflow-y: auto; max-height: calc(85vh - 70px); }
</style>