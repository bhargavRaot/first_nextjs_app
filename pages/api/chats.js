const pool = require('../../lib/db')
const { validateRequest } = require('../../lib/auth')

module.exports = async function handler(req, res) {
  const auth = await validateRequest(req, res)
  if (!auth) return

  try {
    const [rows] = await pool.query('SELECT c.id, c.message, c.created_at, u.name as user_name FROM chats c LEFT JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC LIMIT 100')
    res.status(200).json({ ok: true, chats: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: String(err) })
  }
}
