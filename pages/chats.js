import { useEffect, useState } from 'react'

export default function Chats() {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/chats')
      .then(r => r.json())
      .then(data => {
        if (data.ok) setChats(data.chats)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{padding:20,fontFamily:'Arial, sans-serif'}}>
      <h2>Chats</h2>
      {loading && <div>Loading...</div>}
      {!loading && chats.length === 0 && <div>No chats yet.</div>}
      <ul>
        {chats.map(c => (
          <li key={c.id} style={{marginBottom:10}}>
            <strong>{c.user_name || 'Unknown'}</strong>: {c.message}
            <div style={{fontSize:12,color:'#666'}}>{new Date(c.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
