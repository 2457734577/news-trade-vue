 
/**
 * 格式化工具函数
 */

// 格式化日期时间
export function formatDateTime(dateString, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) return '-'
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 格式化日期
export function formatDate(dateString) {
  return formatDateTime(dateString, 'YYYY-MM-DD')
}

// 格式化时间
export function formatTime(dateString) {
  return formatDateTime(dateString, 'HH:mm:ss')
}

// 相对时间
export function formatRelativeTime(dateString) {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 30) {
    return formatDate(dateString)
  } else if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else if (seconds > 0) {
    return `${seconds}秒前`
  } else {
    return '刚刚'
  }
}

// 格式化数字
export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined) return '-'
  
  const value = parseFloat(num)
  
  if (isNaN(value)) return '-'
  
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

// 格式化货币
export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return '-'
  
  const value = parseFloat(amount)
  
  if (isNaN(value)) return '-'
  
  const symbols = {
    USD: '$',
    CNY: '¥',
    EUR: '€',
    GBP: '£',
    JPY: '¥'
  }
  
  const symbol = symbols[currency] || currency
  
  return `${symbol}${value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

// 格式化百分比
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined) return '-'
  
  const num = parseFloat(value)
  
  if (isNaN(num)) return '-'
  
  const formatted = num.toFixed(decimals)
  const prefix = num > 0 ? '+' : ''
  
  return `${prefix}${formatted}%`
}

// 格式化文件大小
export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  let size = bytes
  
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  
  return `${size.toFixed(2)} ${units[index]}`
}

// 截断文本
export function truncateText(text, maxLength = 50) {
  if (!text) return ''
  
  if (text.length <= maxLength) return text
  
  return text.slice(0, maxLength) + '...'
}

// 格式化订单状态
export function formatOrderStatus(status) {
  const statusMap = {
    PENDING: { text: '待执行', class: 'badge-warning' },
    OPEN: { text: '持仓中', class: 'badge-info' },
    CLOSED: { text: '已平仓', class: 'badge-success' },
    CANCELLED: { text: '已取消', class: 'badge-secondary' },
    FAILED: { text: '失败', class: 'badge-danger' }
  }
  
  return statusMap[status] || { text: status, class: 'badge-secondary' }
}

// 格式化交易方向
export function formatTradeDirection(direction) {
  const directionMap = {
    BUY: { text: '买入', class: 'text-success' },
    SELL: { text: '卖出', class: 'text-danger' },
    LONG: { text: '做多', class: 'text-success' },
    SHORT: { text: '做空', class: 'text-danger' }
  }
  
  return directionMap[direction] || { text: direction, class: '' }
}

// 格式化新闻影响等级
export function formatNewsImpact(impact) {
  const impactMap = {
    HIGH: { text: '高', class: 'badge-danger' },
    MEDIUM: { text: '中', class: 'badge-warning' },
    LOW: { text: '低', class: 'badge-info' }
  }
  
  return impactMap[impact] || { text: impact, class: 'badge-secondary' }
}

// HTML 转义（防 XSS）
export function escapeHtml(text) {
  if (!text) return ''
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  
  return String(text).replace(/[&<>"']/g, m => map[m])
}

// 获取颜色类名（根据数值正负）
export function getValueColorClass(value) {
  const num = parseFloat(value)
  
  if (isNaN(num)) return ''
  if (num > 0) return 'text-success'
  if (num < 0) return 'text-danger'
  return ''
}