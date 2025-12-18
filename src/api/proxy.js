export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { path } = req.query
  const apiPath = Array.isArray(path) ? path.join('/') : path
  const url = `https://news-trade.take-btc.com/api/${apiPath}`
  
  const headers = { 'Content-Type': 'application/json' }
  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization
  }
  
  const options = {
    method: req.method,
    headers: headers
  }
  
  // Vercel 已经解析了 body，直接用
  if (req.method !== 'GET' && req.body) {
    options.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  }
  
  try {
    const response = await fetch(url, options)
    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
