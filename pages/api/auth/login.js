const { buildAuthUrl, loginWithCredentials, getCookieHeader } = require('../../../lib/auth')

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body || {}
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Username and password are required' })
    }

    try {
      const tokenData = await loginWithCredentials(username, password)
      const cookie = getCookieHeader(tokenData.access_token, tokenData.expires_in || 3600)
      res.setHeader('Set-Cookie', cookie)
      return res.status(200).json({ ok: true })
    } catch (err) {
      console.error('Direct login error:', err.message)
      return res.status(401).json({ ok: false, error: err.message || 'Authentication failed' })
    }
  }

  const authUrl = buildAuthUrl()
  res.writeHead(302, { Location: authUrl })
  res.end()
}
