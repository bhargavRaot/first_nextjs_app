const pool = require('../../lib/db')
const { validateRequest } = require('../../lib/auth')

module.exports = async function handler(req, res) {
  const auth = await validateRequest(req, res)
  if (!auth) return

  try {
    const [rows] = await pool.query('SELECT id, name, email, created_at FROM users ORDER BY id LIMIT 1')
    const user = rows[0] || null
    res.status(200).json({ ok: true, user, auth })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: String(err) })
  }
}
