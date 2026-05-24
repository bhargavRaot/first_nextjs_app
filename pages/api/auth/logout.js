module.exports = function handler(req, res) {
  res.setHeader('Set-Cookie', 'access_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax')
  res.writeHead(302, { Location: '/login' })
  res.end()
}
