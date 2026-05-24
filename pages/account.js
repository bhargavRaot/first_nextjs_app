import { useEffect, useState } from 'react'

export default function Account() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('/api/account')
      .then(r => r.json())
      .then(data => { if (data.ok) setUser(data.user) })
  }, [])

  return (
    <div style={{padding:20,fontFamily:'Arial, sans-serif'}}>
      <h2>Account</h2>
      {user ? (
        <div>
          <div><strong>Name:</strong> {user.name}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div style={{fontSize:12,color:'#666'}}>Joined {new Date(user.created_at).toLocaleString()}</div>
        </div>
      ) : (
        <div>No account data.</div>
      )}
    </div>
  )
}
