<template>
  <div class="asset-chart">
    <div class="chart-header">
      <h3>资产趋势</h3>
      <div class="chart-tabs">
        <button 
          v-for="period in periods" 
          :key="period.value"
          @click="selectedPeriod = period.value"
          :class="['tab-btn', { active: selectedPeriod === period.value }]"
        >
          {{ period.label }}
        </button>
      </div>
    </div>
    
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
    
    <div class="chart-legend">
      <div class="legend-item">
        <span class="legend-dot" style="background: #667eea;"></span>
        <span>总资产</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot" style="background: #f093fb;"></span>
        <span>现货</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot" style="background: #4facfe;"></span>
        <span>合约</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const chartCanvas = ref(null)
const selectedPeriod = ref('7d')

const periods = [
  { label: '24小时', value: '24h' },
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' },
  { label: '90天', value: '90d' }
]

function drawChart() {
  if (!chartCanvas.value) return
  
  const ctx = chartCanvas.value.getContext('2d')
  const canvas = chartCanvas.value
  canvas.width = canvas.offsetWidth
  canvas.height = 300
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 绘制背景网格
  ctx.strokeStyle = '#f7fafc'
  ctx.lineWidth = 1
  for (let i = 0; i <= 5; i++) {
    const y = (canvas.height / 5) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }
  
  // 模拟数据
  const points = 30
  const data = Array.from({ length: points }, (_, i) => ({
    total: 1000 + Math.random() * 500,
    spot: 400 + Math.random() * 200,
    futures: 600 + Math.random() * 300
  }))
  
  // 绘制曲线
  drawLine(ctx, data.map(d => d.total), '#667eea', canvas)
  drawLine(ctx, data.map(d => d.spot), '#f093fb', canvas)
  drawLine(ctx, data.map(d => d.futures), '#4facfe', canvas)
}

function drawLine(ctx, data, color, canvas) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min
  
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  
  data.forEach((value, index) => {
    const x = (canvas.width / (data.length - 1)) * index
    const y = canvas.height - ((value - min) / range) * (canvas.height - 40) - 20
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
}

watch(selectedPeriod, () => {
  drawChart()
})

onMounted(() => {
  drawChart()
  window.addEventListener('resize', drawChart)
})
</script>

<style scoped>
.asset-chart {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.chart-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.chart-tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #4a5568;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #f7fafc;
}

.tab-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.chart-container {
  margin-bottom: 16px;
}

.chart-container canvas {
  width: 100%;
  height: 300px;
}

.chart-legend {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4a5568;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
</style>