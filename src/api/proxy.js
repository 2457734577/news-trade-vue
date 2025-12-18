export default async function handler(req, res) {
  const { path } = req.query
  const apiPath = Array.isArray(path) ? path.join('/') : path
  
  const url = `https://news-trade.take-btc.com/api/${apiPath}`
  
  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
      },
      ...(req.method !== 'GET' && req.body && { body: JSON.stringify(req.body) })
    })
    
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}