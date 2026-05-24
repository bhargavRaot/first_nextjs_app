import { useEffect, useState } from 'react'

export default function TablePage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    fetch('/api/items')
      .then(r => r.json())
      .then(data => { if (data.ok) setItems(data.items) })
  }, [])

  return (
    <div style={{padding:20,fontFamily:'Arial, sans-serif'}}>
      <h2>Items Table</h2>
      <table border="1" cellPadding="8" style={{borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id}>
              <td>{it.id}</td>
              <td>{it.name}</td>
              <td>{it.description}</td>
              <td>{it.quantity}</td>
              <td>{it.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
