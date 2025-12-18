/**
 * News Trade - TypeScript API 接口定义
 */

// ============================================
// 基础类型定义
// ============================================

export interface ApiResponse<T = any> {
  code: number
  message: string
  success: boolean
  data: T
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// ============================================
// 枚举类型
// ============================================

export enum OrderStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export enum SentimentType {
  BULLISH = 'BULLISH',
  BEARISH = 'BEARISH',
  NEUTRAL = 'NEUTRAL'
}

export enum ExecuteMode {
  OBSERVE = 'OBSERVE',
  TEST = 'TEST',
  LIVE = 'LIVE'
}

export enum ExchangeType {
  BINANCE = 'BINANCE',
  BYBIT = 'BYBIT',
  BITGET = 'BITGET',
  GATE = 'GATE'
}

export enum MarketType {
  SPOT = 'SPOT',
  FUTURES = 'FUTURES'
}

export enum Direction {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export enum SupportCategory {
  TECHNICAL = 'technical',
  ACCOUNT = 'account',
  TRADING = 'trading',
  OTHER = 'other'
}

export enum SupportStatus {
  OPEN = 'open',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum SupportPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// ============================================
// 认证模块
// ============================================

export interface LoginRequest {
  email: string
  password: string
  totpCode?: string | null
}

export interface RegisterRequest {
  email: string
  password: string
  nickname: string
}

export interface SessionToken {
  sessionId: string
  userId: string
  role?: UserRole
  expiresAt?: string
}

export interface UserInfo {
  userId: string
  email: string
  nickname: string
  role: UserRole
  createdAt: string
  lastLoginAt?: string
}

// ============================================
// 资产模块（新增）
// ============================================

export interface AssetItem {
  coin: string
  free: number
  locked: number
  usdtValue: number
}

export interface AccountAsset {
  accountId: string
  exchangeType: ExchangeType
  totalAsset: number          // 总资产（USDT）
  spotBalance: number         // 现货余额
  futuresBalance: number      // 合约余额
  fundingBalance: number      // 资金账户
  unrealizedPnl: number       // 未实现盈亏
  marginUsed: number          // 占用保证金
  availableMargin: number     // 可用保证金
  assets: AssetItem[]         // 资产详情
  lastUpdate?: string
}

export interface AssetSummary {
  total: number
  spot: number
  futures: number
  funding: number
  unrealizedPnl: number
  availableMargin: number
  accountCount: number
  exchanges: number
}

// ============================================
// 交易所账户模块
// ============================================

export interface TradingAccount {
  id: string
  userId: string
  exchangeType: ExchangeType
  apiKey: string
  apiSecret?: string
  nickname?: string
  enabled: boolean
  createdAt: string
  updatedAt?: string
}

export interface AddCexAccountRequest {
  exchangeType: ExchangeType
  apiKey: string
  apiSecret: string
  nickname?: string
  enabled?: boolean
}

export interface AddOnchainAccountRequest {
  onchainWalletAddress: string
  nickname?: string
  enabled?: boolean
}

// ============================================
// 订单模块
// ============================================

export interface Order {
  id: string
  userId: string
  symbol: string
  direction: Direction
  quantity: number
  price?: number
  status: OrderStatus
  exchangeType: ExchangeType
  marketType: MarketType
  strategyId?: string
  newsId?: string
  createdAt: string
  updatedAt?: string
  closedAt?: string
  profit?: number
}

export interface OrderStatistics {
  totalOrders: number
  openOrders: number
  closedOrders: number
  totalProfit: number
  winRate: number
  period?: string
}

// ============================================
// 新闻模块
// ============================================

export interface News {
  id: string
  title: string
  content: string
  source: string
  publishTime: string
  sentiment?: SentimentType
  symbol?: string
  strategyId?: string
  createdAt: string
}

export interface ImportNewsRequest {
  title: string
  content: string
  source: string
  publishTime: string
  symbol?: string
  strategyId?: string
  collectKline?: boolean
}

export interface BatchImportNewsRequest {
  news: Array<{
    content: string
    publishedAt: string
    source: string
    coinSymbol?: string[]
    link?: string
  }>
}

export interface NewsStatistics {
  totalNews: number
  todayNews: number
  bullishCount: number
  bearishCount: number
  neutralCount: number
}

// ============================================
// 策略模块
// ============================================

export interface Strategy {
  id: string
  userId: string
  name: string
  description?: string
  executeMode: ExecuteMode
  enabled: boolean
  config: StrategyConfig
  stats?: StrategyStats
  createdAt: string
  updatedAt?: string
}

export interface StrategyConfig {
  symbol?: string
  leverage?: number
  stopLoss?: number
  takeProfit?: number
  maxPosition?: number
  [key: string]: any
}

export interface StrategyStats {
  totalTrades: number
  winRate: number
  totalProfit: number
  avgProfit: number
  maxDrawdown: number
}

export interface StrategyDTO {
  name: string
  description?: string
  executeMode: ExecuteMode
  enabled: boolean
  config: StrategyConfig
}

// ============================================
// K线模块
// ============================================

export interface Kline {
  id: string
  symbol: string
  interval: string
  openTime: number
  closeTime: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  newsId?: string
  strategyId?: string
}

export interface KlineAnalysis {
  newsId: string
  symbol: string
  priceChange: number
  priceChangePercent: number
  maxGain: number
  maxLoss: number
  optimalSellPoint?: {
    time: number
    price: number
    profit: number
  }
}

// ============================================
// 客服支持模块（新增）
// ============================================

export interface SupportTicket {
  id: string
  userId: string
  subject: string
  category: SupportCategory
  status: SupportStatus
  priority: SupportPriority
  createdAt: string
  updatedAt: string
  closedAt?: string
}

export interface SupportMessage {
  id: string
  ticketId: string
  senderId: string
  senderType: 'user' | 'support'
  content: string
  attachments?: Array<{
    name: string
    url: string
    size: number
  }>
  read: boolean
  createdAt: string
}

export interface CreateTicketRequest {
  subject: string
  category: SupportCategory
  priority: SupportPriority
  content?: string
}

export interface SendMessageRequest {
  ticketId: string
  content: string
  attachments?: string[]
}

// ============================================
// 管理员模块（新增）
// ============================================

export interface AdminUser {
  id: string
  email: string
  nickname: string
  role: UserRole
  enabled: boolean
  totalAssets?: number
  accountCount?: number
  orderCount?: number
  createdAt: string
  lastLoginAt?: string
}

export interface UpdateUserStatusRequest {
  enabled: boolean
}

export interface UpdateUserRoleRequest {
  role: UserRole
}

// ============================================
// 系统配置模块
// ============================================

export interface SystemConfig {
  key: string
  value: string
  description?: string
  type: 'string' | 'number' | 'boolean' | 'json'
  category?: string
}

export interface UpdateConfigRequest {
  value: string
}

export interface BatchUpdateConfigRequest {
  [key: string]: string
}

// ============================================
// API 客户端类
// ============================================

export class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL
  }

  setToken(token: string) {
    this.token = token
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
      headers['Session-Token'] = this.token
    }
    
    return headers
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // ==================== 认证 ====================
  
  async login(data: LoginRequest): Promise<ApiResponse<SessionToken>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async adminLogin(data: LoginRequest): Promise<ApiResponse<SessionToken>> {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async register(data: RegisterRequest): Promise<ApiResponse<void>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getCurrentUser(): Promise<ApiResponse<UserInfo>> {
    return this.request('/auth/me')
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request('/auth/logout', { method: 'POST' })
  }

  // ==================== 资产 ====================
  
  async getAssets(): Promise<ApiResponse<AccountAsset[]>> {
    return this.request('/user/assets')
  }

  async getAccountAsset(accountId: string): Promise<ApiResponse<AccountAsset>> {
    return this.request(`/user/assets/${accountId}`)
  }

  async getAssetSummary(): Promise<ApiResponse<AssetSummary>> {
    return this.request('/user/assets/summary')
  }

  // ==================== 账户 ====================
  
  async getAccounts(): Promise<ApiResponse<TradingAccount[]>> {
    return this.request('/user/accounts')
  }

  async addCexAccount(data: AddCexAccountRequest): Promise<ApiResponse<TradingAccount>> {
    return this.request('/user/accounts/cex', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async toggleAccount(id: string, enabled: boolean): Promise<ApiResponse<void>> {
    return this.request(`/user/accounts/${id}/toggle?enabled=${enabled}`, {
      method: 'PUT'
    })
  }

  async deleteAccount(id: string): Promise<ApiResponse<void>> {
    return this.request(`/user/accounts/${id}`, { method: 'DELETE' })
  }

  // ==================== 订单 ====================
  
  async getOrders(params: {
    page?: number
    size?: number
    status?: OrderStatus
    symbol?: string
    startDate?: string
    endDate?: string
  } = {}): Promise<ApiResponse<PageResponse<Order>>> {
    const query = new URLSearchParams(params as any).toString()
    return this.request(`/orders?${query}`)
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request(`/orders/${id}`)
  }

  async getOrderStatistics(period?: string): Promise<ApiResponse<OrderStatistics>> {
    const query = period ? `?period=${period}` : ''
    return this.request(`/orders/statistics${query}`)
  }

  // ==================== 新闻 ====================
  
  async getNews(params: {
    page?: number
    size?: number
    sentiment?: SentimentType
    symbol?: string
    keyword?: string
  } = {}): Promise<ApiResponse<PageResponse<News>>> {
    const query = new URLSearchParams(params as any).toString()
    return this.request(`/news?${query}`)
  }

  async importNews(data: ImportNewsRequest): Promise<ApiResponse<News>> {
    return this.request('/news/import', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async batchImportNews(data: BatchImportNewsRequest): Promise<ApiResponse<void>> {
    return this.request('/news/batch', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // ==================== 策略 ====================
  
  async getStrategies(): Promise<ApiResponse<Strategy[]>> {
    return this.request('/strategy/list')
  }

  async getStrategy(id: string): Promise<ApiResponse<Strategy>> {
    return this.request(`/strategy/${id}`)
  }

  async createStrategy(data: StrategyDTO): Promise<ApiResponse<Strategy>> {
    return this.request('/strategy/create', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateStrategy(id: string, data: StrategyDTO): Promise<ApiResponse<Strategy>> {
    return this.request(`/strategy/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteStrategy(id: string): Promise<ApiResponse<void>> {
    return this.request(`/strategy/${id}`, { method: 'DELETE' })
  }

  // ==================== 客服支持 ====================
  
  async createTicket(data: CreateTicketRequest): Promise<ApiResponse<SupportTicket>> {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getTickets(): Promise<ApiResponse<SupportTicket[]>> {
    return this.request('/support/tickets')
  }

  async getTicket(id: string): Promise<ApiResponse<SupportTicket>> {
    return this.request(`/support/tickets/${id}`)
  }

  async sendMessage(data: SendMessageRequest): Promise<ApiResponse<SupportMessage>> {
    return this.request('/support/messages', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getMessages(ticketId: string): Promise<ApiResponse<SupportMessage[]>> {
    return this.request(`/support/messages/${ticketId}`)
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return this.request('/support/unread-count')
  }

  async closeTicket(id: string): Promise<ApiResponse<void>> {
    return this.request(`/support/tickets/${id}/close`, { method: 'PUT' })
  }

  // ==================== 管理员 ====================
  
  async getAdminUsers(params: {
    page?: number
    size?: number
    keyword?: string
  } = {}): Promise<ApiResponse<PageResponse<AdminUser>>> {
    const query = new URLSearchParams(params as any).toString()
    return this.request(`/admin/users?${query}`)
  }

  async getAdminUser(id: string): Promise<ApiResponse<AdminUser>> {
    return this.request(`/admin/users/${id}`)
  }

  async updateUserStatus(id: string, data: UpdateUserStatusRequest): Promise<ApiResponse<void>> {
    return this.request(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async updateUserRole(id: string, data: UpdateUserRoleRequest): Promise<ApiResponse<void>> {
    return this.request(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // ==================== 系统配置 ====================
  
  async getConfigs(): Promise<ApiResponse<Record<string, SystemConfig>>> {
    return this.request('/config')
  }

  async getConfig(key: string): Promise<ApiResponse<SystemConfig>> {
    return this.request(`/config/${key}`)
  }

  async updateConfig(key: string, data: UpdateConfigRequest): Promise<ApiResponse<void>> {
    return this.request(`/config/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async batchUpdateConfig(data: BatchUpdateConfigRequest): Promise<ApiResponse<void>> {
    return this.request('/config/batch', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
}

// 导出默认实例
export const api = new ApiClient()