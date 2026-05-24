const { buildAuthUrl } = require('../../../lib/auth')

module.exports = function handler(req, res) {
  const authUrl = buildAuthUrl()
  res.writeHead(302, { Location: authUrl })
  res.end()
}
