 
/**
 * 验证工具函数
 */

// 验证邮箱
export function validateEmail(email) {
  if (!email) {
    return { valid: false, message: '请输入邮箱地址' }
  }
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!regex.test(email)) {
    return { valid: false, message: '请输入有效的邮箱地址' }
  }
  
  return { valid: true, message: '' }
}

// 验证密码强度
export function validatePassword(password) {
  if (!password) {
    return { valid: false, message: '请输入密码', strength: 0 }
  }
  
  if (password.length < 8) {
    return { valid: false, message: '密码长度不能少于8位', strength: 1 }
  }
  
  let strength = 0
  
  // 包含小写字母
  if (/[a-z]/.test(password)) strength++
  // 包含大写字母
  if (/[A-Z]/.test(password)) strength++
  // 包含数字
  if (/[0-9]/.test(password)) strength++
  // 包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
  // 长度超过12位
  if (password.length >= 12) strength++
  
  if (strength < 2) {
    return { 
      valid: false, 
      message: '密码强度太弱，建议包含大小写字母、数字和特殊字符', 
      strength 
    }
  }
  
  return { valid: true, message: '', strength }
}

// 验证确认密码
export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return { valid: false, message: '请确认密码' }
  }
  
  if (password !== confirmPassword) {
    return { valid: false, message: '两次输入的密码不一致' }
  }
  
  return { valid: true, message: '' }
}

// 验证用户名
export function validateUsername(username) {
  if (!username) {
    return { valid: false, message: '请输入用户名' }
  }
  
  if (username.length < 2) {
    return { valid: false, message: '用户名至少2个字符' }
  }
  
  if (username.length > 50) {
    return { valid: false, message: '用户名不能超过50个字符' }
  }
  
  return { valid: true, message: '' }
}

// 验证手机号
export function validatePhone(phone) {
  if (!phone) {
    return { valid: false, message: '请输入手机号' }
  }
  
  const regex = /^1[3-9]\d{9}$/
  
  if (!regex.test(phone)) {
    return { valid: false, message: '请输入有效的手机号' }
  }
  
  return { valid: true, message: '' }
}

// 验证 TOTP 验证码
export function validateTotpCode(code) {
  if (!code) {
    return { valid: false, message: '请输入验证码' }
  }
  
  const regex = /^\d{6}$/
  
  if (!regex.test(code)) {
    return { valid: false, message: '验证码必须是6位数字' }
  }
  
  return { valid: true, message: '' }
}

// 验证必填
export function validateRequired(value, fieldName = '此字段') {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName}不能为空` }
  }
  
  return { valid: true, message: '' }
}

// 验证数字范围
export function validateNumberRange(value, min, max, fieldName = '数值') {
  const num = parseFloat(value)
  
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName}必须是数字` }
  }
  
  if (min !== undefined && num < min) {
    return { valid: false, message: `${fieldName}不能小于${min}` }
  }
  
  if (max !== undefined && num > max) {
    return { valid: false, message: `${fieldName}不能大于${max}` }
  }
  
  return { valid: true, message: '' }
}

// 验证字符串长度
export function validateLength(value, min, max, fieldName = '内容') {
  if (!value) {
    return { valid: false, message: `${fieldName}不能为空` }
  }
  
  if (min !== undefined && value.length < min) {
    return { valid: false, message: `${fieldName}长度不能少于${min}个字符` }
  }
  
  if (max !== undefined && value.length > max) {
    return { valid: false, message: `${fieldName}长度不能超过${max}个字符` }
  }
  
  return { valid: true, message: '' }
}

// 验证 URL
export function validateUrl(url) {
  if (!url) {
    return { valid: false, message: '请输入URL' }
  }
  
  try {
    new URL(url)
    return { valid: true, message: '' }
  } catch {
    return { valid: false, message: '请输入有效的URL' }
  }
}

// 表单验证器
export class FormValidator {
  constructor() {
    this.errors = {}
  }
  
  // 添加验证规则
  validate(field, value, rules) {
    this.errors[field] = null
    
    for (const rule of rules) {
      const result = rule(value)
      if (!result.valid) {
        this.errors[field] = result.message
        return false
      }
    }
    
    return true
  }
  
  // 获取字段错误
  getError(field) {
    return this.errors[field]
  }
  
  // 是否有错误
  hasErrors() {
    return Object.values(this.errors).some(e => e !== null)
  }
  
  // 获取所有错误
  getAllErrors() {
    return Object.entries(this.errors)
      .filter(([, error]) => error !== null)
      .map(([field, error]) => ({ field, error }))
  }
  
  // 清除错误
  clearErrors() {
    this.errors = {}
  }
  
  // 清除单个字段错误
  clearError(field) {
    this.errors[field] = null
  }
}