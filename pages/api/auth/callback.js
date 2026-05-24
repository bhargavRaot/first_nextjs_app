const { exchangeCode, getCookieHeader } = require('../../../lib/auth')

module.exports = async function handler(req, res) {
  const code = req.query.code
  if (!code) {
    res.status(400).send('Missing authorization code')
    return
  }

  try {
    const tokenData = await exchangeCode(code)
    const cookie = getCookieHeader(tokenData.access_token, tokenData.expires_in || 3600)
    res.setHeader('Set-Cookie', cookie)
    res.writeHead(302, { Location: '/dashboard' })
    res.end()
  } catch (err) {
    console.error(err)
    res.status(500).send('Authentication failed')
  }
}
