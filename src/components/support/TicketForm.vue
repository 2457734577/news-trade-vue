<template>
  <div class="ticket-form">
    <div class="form-header">
      <h2>创建工单</h2>
      <button @click="$emit('close')" class="close-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    
    <form @submit.prevent="handleSubmit" class="form-body">
      <div class="form-group">
        <label for="category">问题类别 <span class="required">*</span></label>
        <select id="category" v-model="formData.category" required>
          <option value="">请选择</option>
          <option value="technical">技术问题</option>
          <option value="account">账户问题</option>
          <option value="trading">交易问题</option>
          <option value="other">其他</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="priority">优先级 <span class="required">*</span></label>
        <select id="priority" v-model="formData.priority" required>
          <option value="">请选择</option>
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="subject">问题标题 <span class="required">*</span></label>
        <input 
          id="subject"
          v-model="formData.subject" 
          type="text" 
          placeholder="简要描述您的问题"
          required 
          maxlength="100"
        />
        <span class="char-count">{{ formData.subject.length }}/100</span>
      </div>
      
      <div class="form-group">
        <label for="content">问题描述 <span class="required">*</span></label>
        <textarea 
          id="content"
          v-model="formData.content" 
          rows="6" 
          placeholder="请详细描述您遇到的问题..."
          required
          maxlength="500"
        ></textarea>
        <span class="char-count">{{ formData.content.length }}/500</span>
      </div>
      
      <div class="form-actions">
        <button type="button" @click="$emit('close')" class="btn-cancel">
          取消
        </button>
        <button type="submit" class="btn-submit" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交工单' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useSupportStore } from '@/stores/support'

const emit = defineEmits(['close', 'submit'])
const supportStore = useSupportStore()

const submitting = ref(false)
const formData = reactive({
  category: '',
  priority: 'medium',
  subject: '',
  content: ''
})

async function handleSubmit() {
  if (submitting.value) return
  
  submitting.value = true
  
  try {
    const result = await supportStore.createTicket({
      subject: formData.subject,
      category: formData.category,
      priority: formData.priority,
      content: formData.content
    })
    
    if (result.success) {
      emit('submit', result.data)
      emit('close')
    } else {
      alert(result.message || '创建失败，请重试')
    }
  } catch (error) {
    alert('创建失败，请检查网络连接')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.ticket-form {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #718096;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f7fafc;
  color: #2d3748;
}

.form-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
}

.required {
  color: #f56565;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group select {
  cursor: pointer;
  background: white;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.char-count {
  position: absolute;
  right: 0;
  bottom: -20px;
  font-size: 12px;
  color: #a0aec0;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: white;
  border: 1px solid #e2e8f0;
  color: #4a5568;
}

.btn-cancel:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>