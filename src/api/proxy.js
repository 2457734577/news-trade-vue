export default async function handler(req, res) {
  // 允许 CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { path } = req.query
  const apiPath = Array.isArray(path) ? path.join('/') : path
  
  const url = `https://news-trade.take-btc.com/api/${apiPath}`
  
  console.log(`代理请求: ${req.method} ${url}`)
  
  try {
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization
    }
    
    const options = {
      method: req.method,
      headers: headers
    }
    
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = JSON.stringify(req.body)
    }
    
    const response = await fetch(url, options)
    const data = await response.json()
    
    console.log(`代理响应: ${response.status}`)
    
    res.status(response.status).json(data)
  } catch (error) {
    console.error('代理错误:', error)
    res.status(500).json({ error: error.message })
  }
}
