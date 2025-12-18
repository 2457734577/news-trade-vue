// ============================================
// Telegram JSON 导出专用解析器
// ============================================

/**
 * 解析Telegram导出的JSON消息
 * @param {Object} telegramMsg - Telegram导出的消息对象
 * 
 * 输入格式:
 * {
 *   "id": 15670,
 *   "date": "2025-12-02 12:48:43+00:00",  // UTC时间！
 *   "text": "消息内容...\n————————————\n2025-12-02 20:48:42",
 *   "sender_id": -1001279597711
 * }
 */
function parseTelegramMessage(telegramMsg) {
  // ✅ 直接用 date 字段（已经是UTC，有时区标识）
  const publishedAt = new Date(telegramMsg.date).toISOString();

  // 提取消息内容（去掉时间戳部分）
  const content = extractContent(telegramMsg.text);

  // 提取来源链接（如果有）
  const sourceLink = extractSourceLink(telegramMsg.text);

  // 提取币种
  const coinSymbol = extractCoinSymbol(telegramMsg.text);

  // 判断来源（Upbit/Bithumb/其他）
  const source = extractSource(telegramMsg.text);

  return {
    content: content,
    publishedAt: publishedAt,       // ISO 8601 UTC时间
    source: source,
    coinSymbol: coinSymbol,
    link: sourceLink,
    telegramId: telegramMsg.id,
    originalText: telegramMsg.text  // 保留原文，方便调试
  };
}

/**
 * 提取消息内容（去掉底部时间戳）
 */
function extractContent(text) {
  // 找到分隔线 ————————————
  const separatorIndex = text.lastIndexOf('————————————');

  if (separatorIndex !== -1) {
    // 返回分隔线之前的内容
    return text.substring(0, separatorIndex).trim();
  }

  // 如果没有分隔线，返回全部
  return text.trim();
}

/**
 * 提取来源链接
 */
function extractSourceLink(text) {
  // 匹配 source: https://...
  const match = text.match(/source:\s*(https?:\/\/[^\s\n]+)/i);
  return match ? match[1] : null;
}

/**
 * 提取币种符号（支持多个）
 */
function extractCoinSymbol(text) {
  const coins = new Set();
  const excludeList = ['USD', 'KRW', 'CNY', 'BBG', 'ETF', 'BTC', 'USDT', 'USDC', 'ETH'];
  
  const patterns = [
    /\$([A-Z]{2,10})\s+MarketCap/g,
    /\(([A-Z]{2,10})\)\s*원화/g,
    /\(([A-Z]{2,10})\)\s*韩元/g,
    /\[([A-Z]{2,10})\]/g,
    /\b([A-Z]{2,10})\/KRW/g,
    /\b([A-Z]{2,10})\/USDT/g,
    /\$([A-Z]{2,10})\b/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (!excludeList.includes(match[1])) {
        coins.add(match[1]);
      }
    }
  }

  return coins.size > 0 ? Array.from(coins) : [];
}

/**
 * 判断来源交易所
 */
function extractSource(text) {
  if (text.includes('Upbit') || text.includes('업비트')) {
    return 'Upbit';
  } else if (text.includes('Bithumb') || text.includes('빗썸') || text.includes('Bithumb Listing')) {
    return 'Bithumb';
  } else if (text.includes('Binance') || text.includes('币安')) {
    return 'Binance';
  } else if (text.includes('Tree News') || text.includes('树新闻')) {
    return 'TreeNews';
  }

  // ← 加这段：提取冒号前的内容
  const match = text.match(/^\*{0,2}([A-Za-z\s]+):/);
  if (match) {
    return match[1].trim();
  }
  return 'Unknown';
}

/**
 * 批量解析Telegram消息
 */
/**
 * 批量解析Telegram消息
 */
function batchParseTelegramMessages(messages) {
  console.log(`开始解析 ${messages.length} 条Telegram消息...`);

  const parsed = [];
  const errors = [];
  let skippedNoCoins = 0;

  messages.forEach((msg, index) => {
    try {
      const newsItem = parseTelegramMessage(msg);

      // 基本验证
      if (!newsItem.publishedAt) {
        throw new Error('缺少发布时间');
      }

      // 时间合理性检查
      const date = new Date(newsItem.publishedAt);
      const now = new Date();
      if (date > now) {
        throw new Error(`时间是未来: ${newsItem.publishedAt}`);
      }

      // 没有币种的不保存
      if (!newsItem.coinSymbol || newsItem.coinSymbol.length === 0) {
        skippedNoCoins++;
        return;
      }

      parsed.push(newsItem);

    } catch (error) {
      errors.push({
        index: index,
        id: msg.id,
        error: error.message,
        message: msg
      });
    }
  });

  console.log(`✅ 成功解析: ${parsed.length} 条`);
  console.log(`⏭️ 跳过无币种: ${skippedNoCoins} 条`);
  if (errors.length > 0) {
    console.warn(`⚠️ 解析失败: ${errors.length} 条`);
  }

  // 按时间排序（从旧到新）
  parsed.sort((a, b) =>
    new Date(a.publishedAt) - new Date(b.publishedAt)
  );

  return {
    success: parsed,
    errors: errors,
    stats: {
      total: messages.length,
      successful: parsed.length,
      failed: errors.length,
      skippedNoCoins: skippedNoCoins,
      dateRange: parsed.length > 0 ? {
        start: parsed[0].publishedAt,
        end: parsed[parsed.length - 1].publishedAt
      } : null
    }
  };
}

/**
 * 批量上传到后端
 */
async function uploadToBackend(newsItems, options = {}) {
  const {
    batchSize = 50,
    delayMs = 500,
    apiUrl = '/api/news/batch',
    onProgress = null
  } = options;
  
  // 获取 token
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) {
    throw new Error('未登录，请先登录');
  }
  
  console.log(`准备上传 ${newsItems.length} 条新闻...`);
  
  const results = {
    uploaded: 0,
    failed: 0,
    errors: []
  };
  
  const totalBatches = Math.ceil(newsItems.length / batchSize);
  
  for (let i = 0; i < newsItems.length; i += batchSize) {
    const batch = newsItems.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    
    console.log(`\n上传第 ${batchNum}/${totalBatches} 批 (${batch.length} 条)...`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token  // ← 改这里，直接用 token（后端可能不需要 Bearer）
        },
        body: JSON.stringify({
          news: batch
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      results.uploaded += batch.length;
      
      console.log(`✅ 第 ${batchNum} 批上传成功`);
      
      if (onProgress) {
        onProgress({
          batch: batchNum,
          total: totalBatches,
          uploaded: results.uploaded,
          percentage: Math.round(results.uploaded / newsItems.length * 100)
        });
      }
      
      if (i + batchSize < newsItems.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      
    } catch (error) {
      console.error(`❌ 第 ${batchNum} 批上传失败:`, error.message);
      results.failed += batch.length;
      results.errors.push({
        batch: batchNum,
        error: error.message,
        items: batch
      });
    }
  }
  
  console.log('\n上传完成！');
  console.log(`成功: ${results.uploaded} 条`);
  console.log(`失败: ${results.failed} 条`);
  
  return results;
}

// ============================================
// 使用示例
// ============================================

// 示例1: 单条消息解析
const singleMessage = {
  "id": 15695,
  "date": "2025-12-09 02:18:09+00:00",
  "text": "Bithumb Listing: [마켓 추가] 알로라(ALLO) 원화 마켓 추가 (거래 수수료 무료)\nBithumb上新: [市场新增] Alloa (ALLO) 韩元市场新增 (交易费免费)\n$ALLO  MarketCap: $33M\n$RWA  MarketCap: $6M\n(Auto match could be wrong, 自动匹配可能不准确)\n————————————\n2025-12-09 10:18:09\nsource: https://feed.bithumb.com/notice/1651063",
  "sender_id": -1001279597711
};

console.log('单条解析示例:');
const parsed = parseTelegramMessage(singleMessage);
console.log(JSON.stringify(parsed, null, 2));
/*
输出:
{
  "content": "Bithumb Listing: [마켓 추가] 알로라(ALLO) 원화 마켓 추가...",
  "publishedAt": "2025-12-09T02:18:09.000Z",  ← UTC时间
  "source": "Bithumb",
  "coinSymbol": "ALLO",
  "link": "https://feed.bithumb.com/notice/1651063",
  "telegramId": 15695,
  "originalText": "..."
}
*/

// 示例2: 批量处理
async function processHistoricalData() {
  // 1. 加载Telegram导出的JSON
  const response = await fetch('/telegram_export.json');
  const data = await response.json();

  // 假设JSON结构是 { messages: [...] }
  const messages = data.messages || data;

  // 2. 批量解析
  const result = batchParseTelegramMessages(messages);

  console.log('\n解析统计:');
  console.table(result.stats);

  // 3. 如果有解析错误，查看详情
  if (result.errors.length > 0) {
    console.log('\n解析错误详情:');
    result.errors.forEach(err => {
      console.log(`ID ${err.id}:`, err.error);
      console.log('原始消息:', err.message.text.substring(0, 100) + '...');
    });
  }

  // 4. 确认是否上传
  if (!confirm(`解析成功 ${result.success.length} 条，是否上传到后端？`)) {
    return;
  }

  // 5. 上传
  const uploadResult = await uploadToBackend(result.success, {
    batchSize: 50,
    delayMs: 500,
    onProgress: (progress) => {
      console.log(`进度: ${progress.percentage}% (${progress.uploaded}/${result.success.length})`);
    }
  });

  return uploadResult;
}

// ============================================
// 验证函数 - 运行前检查
// ============================================

function validateTelegramData(messages) {
  console.log('🔍 开始数据验证...\n');

  const checks = {
    total: messages.length,
    hasDate: 0,
    hasText: 0,
    dateFormat: 0,
    futureTime: 0,
    oldTime: 0,
    duplicates: 0
  };

  const seenIds = new Set();
  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  messages.forEach(msg => {
    // 检查必要字段
    if (msg.date) checks.hasDate++;
    if (msg.text) checks.hasText++;

    // 检查日期格式（应该有 +00:00）
    if (msg.date && msg.date.includes('+00:00')) {
      checks.dateFormat++;
    }

    // 检查时间合理性
    if (msg.date) {
      const date = new Date(msg.date);
      if (date > now) checks.futureTime++;
      if (date < oneYearAgo) checks.oldTime++;
    }

    // 检查重复ID
    if (seenIds.has(msg.id)) {
      checks.duplicates++;
    } else {
      seenIds.add(msg.id);
    }
  });

  console.log('验证结果:');
  console.table({
    '总消息数': checks.total,
    '包含date字段': `${checks.hasDate} (${(checks.hasDate / checks.total * 100).toFixed(1)}%)`,
    '包含text字段': `${checks.hasText} (${(checks.hasText / checks.total * 100).toFixed(1)}%)`,
    '正确UTC格式': `${checks.dateFormat} (${(checks.dateFormat / checks.total * 100).toFixed(1)}%)`,
    '未来时间⚠️': checks.futureTime,
    '过于久远⚠️': checks.oldTime,
    '重复ID⚠️': checks.duplicates
  });

  // 判断是否可以继续
  const canProceed =
    checks.hasDate === checks.total &&
    checks.hasText === checks.total &&
    checks.dateFormat === checks.total &&
    checks.futureTime === 0 &&
    checks.duplicates === 0;

  if (canProceed) {
    console.log('\n✅ 数据验证通过，可以继续处理！');
  } else {
    console.log('\n⚠️ 数据验证发现问题，建议检查后再继续。');
  }

  return canProceed;
}

// ============================================
// 导出供Vue使用
// ============================================

export {
  parseTelegramMessage,
  batchParseTelegramMessages,
  uploadToBackend,
  validateTelegramData,
  extractCoinSymbol,
  extractSource
};