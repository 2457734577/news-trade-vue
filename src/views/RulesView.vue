<template>
  <div class="rules-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">策略规则配置</h1>
        <p class="page-subtitle">配置新闻交易策略和执行规则</p>
      </div>
      <button class="btn btn-primary" @click="showAddModal = true">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        添加策略
      </button>
    </div>
    
    <!-- 策略统计 -->
    <div class="grid grid-cols-4 mb-6">
      <div class="stat-card">
        <div class="stat-icon stat-icon-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总策略数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-success">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.active }}</div>
          <div class="stat-label">活跃策略</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-warning">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.testing }}</div>
          <div class="stat-label">测试中</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-danger">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.disabled }}</div>
          <div class="stat-label">已禁用</div>
        </div>
      </div>
    </div>
    
    <!-- 策略列表 -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">策略列表</h3>
        <div class="header-actions">
          <select v-model="filterMode" class="form-input form-input-sm" @change="loadRules">
            <option value="">全部模式</option>
            <option value="LIVE">实盘</option>
            <option value="TEST">测试</option>
            <option value="OBSERVE">观察</option>
          </select>
        </div>
      </div>
      <div class="card-body">
        <div v-if="loading" class="loading-state"><div class="spinner"></div></div>
        <div v-else-if="rules.length === 0" class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p class="empty-state-title">暂无策略</p>
          <p class="empty-state-text">点击"添加策略"创建您的第一个交易策略</p>
        </div>
        <div v-else class="rules-list">
          <div v-for="rule in rules" :key="rule.id" class="rule-card" :class="{ disabled: !rule.enabled }">
            <div class="rule-header">
              <div class="rule-title-row">
                <h4 class="rule-name">{{ rule.name }}</h4>
                <div class="rule-badges">
                  <span :class="['badge', getModeClass(rule.mode)]">{{ getModeText(rule.mode) }}</span>
                  <span :class="['badge', rule.enabled ? 'badge-success' : 'badge-secondary']">
                    {{ rule.enabled ? '启用' : '禁用' }}
                  </span>
                  <span :class="['badge', getPriorityClass(rule.priority)]">
                    {{ getPriorityText(rule.priority) }}
                  </span>
                </div>
              </div>
              <p class="rule-desc">{{ rule.description || '暂无描述' }}</p>
            </div>
            
            <div class="rule-config">
              <div class="config-section">
                <h5 class="config-title">触发条件</h5>
                <div class="config-items">
                  <div class="config-item">
                    <span class="config-label">新闻类型</span>
                    <span class="config-value">{{ rule.newsTypes?.join(', ') || '全部' }}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">关键词</span>
                    <span class="config-value">{{ rule.keywords?.join(', ') || '无' }}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">交易对</span>
                    <span class="config-value">{{ rule.symbols?.join(', ') || '自动匹配' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="config-section">
                <h5 class="config-title">执行参数</h5>
                <div class="config-items">
                  <div class="config-item">
                    <span class="config-label">交易方向</span>
                    <span class="config-value" :class="rule.direction === 'BUY' ? 'text-success' : 'text-danger'">
                      {{ rule.direction === 'BUY' ? '买入' : '卖出' }}
                    </span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">交易量</span>
                    <span class="config-value">{{ rule.quantity }} {{ rule.quantityType === 'PERCENT' ? '%' : '' }}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">止损/止盈</span>
                    <span class="config-value">{{ rule.stopLoss }}% / {{ rule.takeProfit }}%</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">持仓时间</span>
                    <span class="config-value">{{ rule.holdingTime }}秒</span>
                  </div>
                </div>
              </div>
              
              <div class="config-section">
                <h5 class="config-title">执行优先级</h5>
                <div class="config-items">
                  <div class="config-item">
                    <span class="config-label">执行顺序</span>
                    <span class="config-value">{{ rule.executionPriority?.join(' > ') || 'FUTURES > SPOT > ALPHA' }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="rule-stats">
              <div class="stat-mini">
                <span class="stat-mini-value">{{ rule.triggerCount || 0 }}</span>
                <span class="stat-mini-label">触发次数</span>
              </div>
              <div class="stat-mini">
                <span class="stat-mini-value">{{ rule.successCount || 0 }}</span>
                <span class="stat-mini-label">成功次数</span>
              </div>
              <div class="stat-mini">
                <span class="stat-mini-value" :class="getValueColorClass(rule.totalProfit)">
                  {{ formatCurrency(rule.totalProfit || 0) }}
                </span>
                <span class="stat-mini-label">总盈亏</span>
              </div>
            </div>
            
            <div class="rule-actions">
              <button class="btn btn-sm btn-secondary" @click="editRule(rule)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                编辑
              </button>
              <button class="btn btn-sm" :class="rule.enabled ? 'btn-warning' : 'btn-success'" @click="toggleRule(rule)">
                {{ rule.enabled ? '禁用' : '启用' }}
              </button>
              <button class="btn btn-sm btn-secondary" @click="duplicateRule(rule)">复制</button>
              <button class="btn btn-sm btn-danger" @click="deleteRule(rule.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑策略弹窗 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal modal-lg" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ showEditModal ? '编辑策略' : '添加策略' }}</h3>
            <button class="modal-close" @click="closeModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          
          <form @submit.prevent="saveRule" class="modal-body">
            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">策略名称 *</label>
                <input type="text" v-model="form.name" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label">执行模式 *</label>
                <select v-model="form.mode" class="form-input" required>
                  <option value="OBSERVE">观察模式</option>
                  <option value="TEST">测试模式</option>
                  <option value="LIVE">实盘模式</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">优先级</label>
                <select v-model="form.priority" class="form-input">
                  <option value="HIGH">高</option>
                  <option value="MEDIUM">中</option>
                  <option value="LOW">低</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">策略描述</label>
              <textarea v-model="form.description" class="form-input" rows="2"></textarea>
            </div>
            
            <div class="form-section">
              <h4 class="form-section-title">触发条件</h4>
              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">新闻类型（多选）</label>
                  <select v-model="form.newsTypes" class="form-input" multiple>
                    <option value="LISTING">上币公告</option>
                    <option value="DELISTING">下币公告</option>
                    <option value="AIRDROP">空投</option>
                    <option value="LAUNCHPOOL">Launchpool</option>
                    <option value="FUTURES">合约上线</option>
                    <option value="LEVERAGE">杠杆调整</option>
                    <option value="MAINTENANCE">维护公告</option>
                  </select>
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">关键词（逗号分隔）</label>
                  <input type="text" v-model="form.keywordsText" class="form-input" placeholder="listing, 上线, launchpool">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">限定交易对（逗号分隔，留空自动匹配）</label>
                <input type="text" v-model="form.symbolsText" class="form-input" placeholder="BTCUSDT, ETHUSDT">
              </div>
            </div>
            
            <div class="form-section">
              <h4 class="form-section-title">执行参数</h4>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">交易方向</label>
                  <select v-model="form.direction" class="form-input">
                    <option value="BUY">买入/做多</option>
                    <option value="SELL">卖出/做空</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">交易量</label>
                  <input type="number" v-model="form.quantity" class="form-input" step="0.01" min="0">
                </div>
                <div class="form-group">
                  <label class="form-label">数量类型</label>
                  <select v-model="form.quantityType" class="form-input">
                    <option value="FIXED">固定数量</option>
                    <option value="PERCENT">账户百分比</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">止损 (%)</label>
                  <input type="number" v-model="form.stopLoss" class="form-input" step="0.1" min="0" max="100">
                </div>
                <div class="form-group">
                  <label class="form-label">止盈 (%)</label>
                  <input type="number" v-model="form.takeProfit" class="form-input" step="0.1" min="0" max="100">
                </div>
                <div class="form-group">
                  <label class="form-label">最大持仓时间 (秒)</label>
                  <input type="number" v-model="form.holdingTime" class="form-input" min="10" max="3600">
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h4 class="form-section-title">执行优先级</h4>
              <div class="form-group">
                <label class="form-label">执行顺序（拖拽排序）</label>
                <div class="priority-list">
                  <div v-for="(item, index) in form.executionPriority" :key="item" class="priority-item" draggable="true">
                    <span class="priority-number">{{ index + 1 }}</span>
                    <span class="priority-name">{{ getPriorityItemText(item) }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label class="toggle-label">
                <span>启用策略</span>
                <input type="checkbox" v-model="form.enabled">
                <span class="toggle"></span>
              </label>
            </div>
          </form>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
            <button type="submit" class="btn btn-primary" @click="saveRule" :disabled="saving">
              <span v-if="saving" class="spinner"></span>
              <span v-else>{{ showEditModal ? '保存修改' : '创建策略' }}</span>
            </button>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/utils/api'
import { useAlertStore } from '@/stores/alert'
import { formatCurrency, getValueColorClass } from '@/utils/format'

const alertStore = useAlertStore()

const loading = ref(true)
const saving = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const filterMode = ref('')
const rules = ref([])
const editingRule = ref(null)

const stats = computed(() => ({
  total: rules.value.length,
  active: rules.value.filter(r => r.enabled && r.mode === 'LIVE').length,
  testing: rules.value.filter(r => r.enabled && (r.mode === 'TEST' || r.mode === 'OBSERVE')).length,
  disabled: rules.value.filter(r => !r.enabled).length
}))

const defaultForm = {
  name: '',
  description: '',
  mode: 'OBSERVE',
  priority: 'MEDIUM',
  enabled: true,
  newsTypes: [],
  keywordsText: '',
  symbolsText: '',
  direction: 'BUY',
  quantity: 100,
  quantityType: 'FIXED',
  stopLoss: 2,
  takeProfit: 5,
  holdingTime: 120,
  executionPriority: ['FUTURES', 'SPOT', 'ALPHA']
}

const form = reactive({ ...defaultForm })

function getModeClass(mode) {
  const map = { LIVE: 'badge-danger', TEST: 'badge-warning', OBSERVE: 'badge-info' }
  return map[mode] || 'badge-secondary'
}

function getModeText(mode) {
  const map = { LIVE: '实盘', TEST: '测试', OBSERVE: '观察' }
  return map[mode] || mode
}

function getPriorityClass(priority) {
  const map = { HIGH: 'badge-danger', MEDIUM: 'badge-warning', LOW: 'badge-info' }
  return map[priority] || 'badge-secondary'
}

function getPriorityText(priority) {
  const map = { HIGH: '高优先', MEDIUM: '中优先', LOW: '低优先' }
  return map[priority] || priority
}

function getPriorityItemText(item) {
  const map = { FUTURES: '合约交易', SPOT: '现货交易', ALPHA: 'Alpha/链上' }
  return map[item] || item
}

async function loadRules() {
  loading.value = true
  try {
    const params = filterMode.value ? { mode: filterMode.value } : {}
    const response = await api.get('/strategy/list', { params })
    if (response.success) rules.value = response.data || []
  } catch (error) {
    console.error('加载策略失败:', error)
    rules.value = []
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, { ...defaultForm, executionPriority: ['FUTURES', 'SPOT', 'ALPHA'] })
}

function closeModal() {
  showAddModal.value = false
  showEditModal.value = false
  editingRule.value = null
  resetForm()
}

function editRule(rule) {
  editingRule.value = rule
  Object.assign(form, {
    ...rule,
    keywordsText: rule.keywords?.join(', ') || '',
    symbolsText: rule.symbols?.join(', ') || ''
  })
  showEditModal.value = true
}

function duplicateRule(rule) {
  Object.assign(form, {
    ...rule,
    id: null,
    name: rule.name + ' (副本)',
    keywordsText: rule.keywords?.join(', ') || '',
    symbolsText: rule.symbols?.join(', ') || ''
  })
  showAddModal.value = true
}

async function saveRule() {
  if (!form.name) {
    alertStore.warning('请输入策略名称')
    return
  }
  
  saving.value = true
  try {
    const payload = {
      ...form,
      keywords: form.keywordsText ? form.keywordsText.split(',').map(s => s.trim()).filter(Boolean) : [],
      symbols: form.symbolsText ? form.symbolsText.split(',').map(s => s.trim()).filter(Boolean) : []
    }
    delete payload.keywordsText
    delete payload.symbolsText
    
    let response
    if (showEditModal.value && editingRule.value) {
      response = await api.put(`/strategy/update/${editingRule.value.id}`, payload)
    } else {
      response = await api.post('/strategy/create', payload)
    }
    
    if (response.success) {
      alertStore.success(showEditModal.value ? '策略已更新' : '策略已创建')
      closeModal()
      await loadRules()
    } else {
      alertStore.error(response.message || '保存失败')
    }
  } catch (error) {
    alertStore.error('保存失败')
  } finally {
    saving.value = false
  }
}

async function toggleRule(rule) {
  try {
    const response = await api.patch(`/strategy/toggle/${rule.id}`, { enabled: !rule.enabled })
    if (response.success) {
      rule.enabled = !rule.enabled
      alertStore.success(rule.enabled ? '策略已启用' : '策略已禁用')
    }
  } catch (error) {
    alertStore.error('操作失败')
  }
}

async function deleteRule(id) {
  if (!confirm('确定要删除这个策略吗？')) return
  try {
    const response = await api.delete(`/strategy/delete/${id}`)
    if (response.success) {
      alertStore.success('策略已删除')
      await loadRules()
    }
  } catch (error) {
    alertStore.error('删除失败')
  }
}

onMounted(() => {
  loadRules().catch(e => {
    console.error('初始化失败:', e)
    loading.value = false
  })
})
</script>

<style scoped>
.rules-page { max-width: 1400px; margin: 0 auto; }
.header-actions { display: flex; gap: 0.5rem; }
.form-input-sm { padding: 0.5rem 0.75rem; font-size: 0.875rem; }
.rules-list { display: flex; flex-direction: column; gap: 1rem; }
.rule-card { background: var(--bg-tertiary); border-radius: var(--radius-lg); padding: 1.25rem; transition: all var(--transition-fast); }
.rule-card:hover { box-shadow: var(--shadow-md); }
.rule-card.disabled { opacity: 0.6; }
.rule-header { margin-bottom: 1rem; }
.rule-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.rule-name { font-size: 1.125rem; font-weight: 600; }
.rule-badges { display: flex; gap: 0.5rem; }
.rule-desc { font-size: 0.875rem; color: var(--text-secondary); }
.rule-config { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: var(--radius-md); }

.config-title { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; }
.config-items { display: flex; flex-direction: column; gap: 0.25rem; }
.config-item { display: flex; justify-content: space-between; font-size: 0.875rem; }
.config-label { color: var(--text-secondary); }
.config-value { font-weight: 500; }
.rule-stats { display: flex; gap: 2rem; margin-bottom: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-light); }
.stat-mini { text-align: center; }
.stat-mini-value { display: block; font-size: 1.25rem; font-weight: 600; }
.stat-mini-label { font-size: 0.75rem; color: var(--text-muted); }
.rule-actions { display: flex; gap: 0.5rem; }
.modal-lg { max-width: 800px; }
.modal-body { padding: 1.5rem; max-height: 60vh; overflow-y: auto; }
.form-row { display: flex; gap: 1rem; }
.form-row .form-group { flex: 1; }
.form-row .form-group.flex-1 { flex: 2; }
.form-section { margin: 1.5rem 0; padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-md); }
.form-section-title { font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary); }
.priority-list { display: flex; gap: 0.5rem; }
.priority-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: move; }
.priority-number { width: 20px; height: 20px; background: var(--primary-gradient); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; }
.toggle-label { display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
.toggle-label input { display: none; }
.toggle { width: 44px; height: 24px; background: var(--border-color); border-radius: 12px; position: relative; transition: background var(--transition-fast); }
.toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: white; border-radius: 50%; transition: transform var(--transition-fast); }
.toggle-label input:checked + .toggle { background: var(--primary-color); }
.toggle-label input:checked + .toggle::after { transform: translateX(20px); }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end; gap: 0.75rem; }
.text-success { color: var(--success-color); }
.text-danger { color: var(--danger-color); }
.btn-warning { background: var(--warning-color); color: white; }

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
.modal-close { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 0.25rem; }

@media (max-width: 768px) { .rule-config { grid-template-columns: 1fr; } .form-row { flex-direction: column; } }
</style>