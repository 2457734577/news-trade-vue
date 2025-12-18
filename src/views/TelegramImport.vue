<template>
  <div class="telegram-import-container">
    <div class="header">
      <h2>📥 导入Telegram历史新闻</h2>
      <p class="subtitle">支持Telegram JSON导出格式</p>
    </div>

    <!-- 步骤1: 上传文件 -->
    <div class="upload-section" v-if="!fileLoaded">
      <div class="upload-box" @dragover.prevent @drop.prevent="handleDrop">
        <input 
          type="file" 
          ref="fileInput"
          accept=".json"
          @change="handleFileSelect"
          style="display: none"
        />
        <div class="upload-content" @click="$refs.fileInput.click()">
          <span class="upload-icon">📁</span>
          <p>点击选择文件或拖拽到这里</p>
          <p class="hint">支持 .json 格式</p>
        </div>
      </div>
    </div>

    <!-- 步骤2: 数据预览和验证 -->
    <div class="preview-section" v-if="fileLoaded && !uploading && !uploadComplete">
      <div class="stats-card">
        <h3>📊 数据统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">总消息数</span>
            <span class="stat-value">{{ parseResult.stats.total }}</span>
          </div>
          <div class="stat-item success">
            <span class="stat-label">解析成功</span>
            <span class="stat-value">{{ parseResult.stats.successful }}</span>
          </div>
          <div class="stat-item error" v-if="parseResult.stats.failed > 0">
            <span class="stat-label">解析失败</span>
            <span class="stat-value">{{ parseResult.stats.failed }}</span>
          </div>
          <div class="stat-item" v-if="parseResult.stats.dateRange">
            <span class="stat-label">时间范围</span>
            <span class="stat-value small">
              {{ formatDate(parseResult.stats.dateRange.start) }}
              <br/>至<br/>
              {{ formatDate(parseResult.stats.dateRange.end) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 来源分布 -->
      <div class="source-distribution">
        <h4>📈 来源分布</h4>
        <div class="source-list">
          <div 
            v-for="(count, source) in sourceStats" 
            :key="source"
            class="source-item"
          >
            <span class="source-name">{{ source }}</span>
            <span class="source-count">{{ count }} 条</span>
            <div class="source-bar">
              <div 
                class="source-bar-fill" 
                :style="{ width: (count / parseResult.stats.successful * 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 样本预览 -->
      <div class="sample-preview">
        <h4>👀 数据预览（前3条）</h4>
        <div 
          v-for="(item, index) in parseResult.success.slice(0, 3)" 
          :key="index"
          class="sample-item"
        >
          <div class="sample-header">
            <span class="sample-index">#{{ index + 1 }}</span>
            <span class="sample-source">{{ item.source }}</span>
            <span class="sample-coin" v-if="item.coinSymbol">{{ item.coinSymbol }}</span>
          </div>
          <div class="sample-time">
            🕐 {{ formatDate(item.publishedAt) }}
          </div>
          <div class="sample-content">
            {{ item.content.substring(0, 100) }}{{ item.content.length > 100 ? '...' : '' }}
          </div>
        </div>
      </div>

      <!-- 错误列表 -->
      <div class="errors-section" v-if="parseResult.errors.length > 0">
        <h4>⚠️ 解析失败的消息（{{ parseResult.errors.length }} 条）</h4>
        <div class="errors-list">
          <div 
            v-for="(error, index) in parseResult.errors.slice(0, 5)" 
            :key="index"
            class="error-item"
          >
            <span>ID: {{ error.id }}</span>
            <span class="error-message">{{ error.error }}</span>
          </div>
          <p v-if="parseResult.errors.length > 5" class="more-errors">
            ...还有 {{ parseResult.errors.length - 5 }} 条错误
          </p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="btn btn-secondary" @click="resetUpload">
          取消
        </button>
        <button 
          class="btn btn-primary" 
          @click="startUpload"
          :disabled="parseResult.stats.successful === 0"
        >
          开始上传 ({{ parseResult.stats.successful }} 条)
        </button>
      </div>
    </div>

    <!-- 步骤3: 上传进度 -->
    <div class="uploading-section" v-if="uploading">
      <div class="progress-container">
        <h3>⏳ 正在上传...</h3>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: uploadProgress.percentage + '%' }"
          ></div>
        </div>
        <div class="progress-text">
          {{ uploadProgress.percentage }}% 
          ({{ uploadProgress.uploaded }} / {{ uploadProgress.total }})
        </div>
        <p class="progress-hint">
          第 {{ uploadProgress.batch }} / {{ uploadProgress.totalBatches }} 批
        </p>
      </div>
    </div>

    <!-- 步骤4: 完成 -->
    <div class="complete-section" v-if="uploadComplete">
      <div class="complete-card">
        <span class="complete-icon">✅</span>
        <h3>上传完成！</h3>
        <div class="complete-stats">
          <p>成功: {{ uploadResult.uploaded }} 条</p>
          <p v-if="uploadResult.failed > 0" class="error-text">
            失败: {{ uploadResult.failed }} 条
          </p>
        </div>
        <div class="action-buttons">
          <button class="btn btn-secondary" @click="resetUpload">
            继续上传
          </button>
          <button class="btn btn-primary" @click="goToNewsList">
            查看新闻列表
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { 
  batchParseTelegramMessages, 
  uploadToBackend, 
  validateTelegramData 
} from '../utils/Telegram-json-parser';

export default {
  name: 'TelegramImport',
  
  setup() {
    const fileLoaded = ref(false);
    const parseResult = ref(null);
    const uploading = ref(false);
    const uploadComplete = ref(false);
    const uploadProgress = ref({
      batch: 0,
      totalBatches: 0,
      uploaded: 0,
      total: 0,
      percentage: 0
    });
    const uploadResult = ref(null);
    const fileInput = ref(null);

    // 来源统计
    const sourceStats = computed(() => {
      if (!parseResult.value) return {};
      
      const stats = {};
      parseResult.value.success.forEach(item => {
        stats[item.source] = (stats[item.source] || 0) + 1;
      });
      
      return stats;
    });

    // 格式化日期
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      
      // 显示为北京时间（更容易理解）
      return date.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }

    // 处理文件选择
    async function handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        await loadFile(file);
      }
    }

    // 处理拖放
    async function handleDrop(event) {
      const file = event.dataTransfer.files[0];
      if (file && file.name.endsWith('.json')) {
        await loadFile(file);
      } else {
        alert('请上传 .json 文件');
      }
    }

    // 加载文件
    async function loadFile(file) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // 支持不同的JSON结构
        let messages;
        if (Array.isArray(data)) {
          messages = data;
        } else if (data.messages) {
          messages = data.messages;
        } else if (data.news) {
          messages = data.news;
        } else {
          throw new Error('无法识别的JSON格式');
        }
        
        console.log(`加载了 ${messages.length} 条消息`);
        
        // 验证数据
        // const valid = validateTelegramData(messages);
        // if (!valid) {
        //   if (!confirm('数据验证发现问题，是否继续？')) {
        //     return;
        //   }
        // }
        
        // 解析消息
        parseResult.value = batchParseTelegramMessages(messages);
        fileLoaded.value = true;
        
        console.log('解析完成:', parseResult.value.stats);
        
      } catch (error) {
        console.error('文件加载失败:', error);
        alert('文件加载失败: ' + error.message);
      }
    }

    // 开始上传
    async function startUpload() {
      if (!confirm(`确定上传 ${parseResult.value.stats.successful} 条新闻到后端？`)) {
        return;
      }
      
      uploading.value = true;
      uploadComplete.value = false;
      
      try {
        const result = await uploadToBackend(parseResult.value.success, {
          batchSize: 50,
          delayMs: 500,
          apiUrl: '/api/news/batch',
          token: localStorage.getItem('token'),
          onProgress: (progress) => {
            uploadProgress.value = progress;
          }
        });
        
        uploadResult.value = result;
        uploadComplete.value = true;
        
      } catch (error) {
        console.error('上传失败:', error);
        alert('上传失败: ' + error.message);
      } finally {
        uploading.value = false;
      }
    }

    // 重置上传
    function resetUpload() {
      fileLoaded.value = false;
      parseResult.value = null;
      uploading.value = false;
      uploadComplete.value = false;
      uploadProgress.value = {
        batch: 0,
        totalBatches: 0,
        uploaded: 0,
        total: 0,
        percentage: 0
      };
      uploadResult.value = null;
      
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    }

    // 跳转到新闻列表
    function goToNewsList() {
      // 使用 Vue Router 跳转
      // this.$router.push('/news');
      
      // 或者直接刷新页面
      window.location.href = '/news';
    }

    return {
      fileLoaded,
      parseResult,
      uploading,
      uploadComplete,
      uploadProgress,
      uploadResult,
      sourceStats,
      fileInput,
      formatDate,
      handleFileSelect,
      handleDrop,
      startUpload,
      resetUpload,
      goToNewsList
    };
  }
};
</script>

<style scoped>
.telegram-import-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.header h2 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

/* 上传区域 */
.upload-box {
  border: 2px dashed #9333ea;
  border-radius: 12px;
  padding: 48px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
}

.upload-box:hover {
  border-color: #7c3aed;
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
}

.upload-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.upload-content p {
  margin: 8px 0;
}

.hint {
  color: #999;
  font-size: 12px;
}

/* 统计卡片 */
.stats-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-card h3 {
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.stat-item.success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.stat-item.error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  display: block;
  font-size: 32px;
  font-weight: 600;
  color: #333;
}

.stat-value.small {
  font-size: 12px;
  line-height: 1.4;
}

/* 来源分布 */
.source-distribution {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.source-list {
  margin-top: 16px;
}

.source-item {
  margin-bottom: 16px;
}

.source-name {
  font-weight: 500;
  margin-right: 8px;
}

.source-count {
  color: #666;
  font-size: 14px;
}

.source-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;
}

.source-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #9333ea, #a855f7);
  transition: width 0.3s;
}

/* 样本预览 */
.sample-preview {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sample-item {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.sample-header {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.sample-index {
  background: #9333ea;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.sample-source {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.sample-coin {
  background: #fbbf24;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.sample-time {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.sample-content {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

/* 错误列表 */
.errors-section {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.errors-list {
  margin-top: 16px;
}

.error-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: white;
  border-radius: 4px;
  margin-bottom: 8px;
}

.error-message {
  color: #dc2626;
  font-size: 14px;
}

.more-errors {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-top: 12px;
}

/* 按钮 */
.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 24px;
}

.btn {
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #9333ea 0%, #a855f7 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #333;
  border: 1px solid #e5e5e5;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

/* 上传进度 */
.uploading-section {
  text-align: center;
  padding: 48px;
}

.progress-container h3 {
  margin-bottom: 24px;
}

.progress-bar {
  height: 32px;
  background: #f0f0f0;
  border-radius: 16px;
  overflow: hidden;
  margin: 24px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #9333ea, #a855f7);
  transition: width 0.3s;
}

.progress-text {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.progress-hint {
  color: #666;
  font-size: 14px;
}

/* 完成页面 */
.complete-section {
  text-align: center;
  padding: 48px;
}

.complete-card {
  background: white;
  border-radius: 12px;
  padding: 48px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.complete-icon {
  font-size: 80px;
  display: block;
  margin-bottom: 24px;
}

.complete-card h3 {
  font-size: 28px;
  margin-bottom: 24px;
}

.complete-stats {
  margin-bottom: 32px;
}

.complete-stats p {
  font-size: 18px;
  margin: 8px 0;
}

.error-text {
  color: #dc2626;
}

</style>

