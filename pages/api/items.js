const pool = require('../../lib/db')
const { validateRequest } = require('../../lib/auth')

module.exports = async function handler(req, res) {
  const auth = await validateRequest(req, res)
  if (!auth) return

  try {
    const [rows] = await pool.query('SELECT id, name, description, quantity, price FROM items ORDER BY id DESC')
    res.status(200).json({ ok: true, items: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: String(err) })
  }
}
