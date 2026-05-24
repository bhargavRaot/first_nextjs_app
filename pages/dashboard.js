import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, chats: 0, items: 0 })
  const [previewChats, setPreviewChats] = useState([])
  const [previewItems, setPreviewItems] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [chatRes, itemRes, accountRes] = await Promise.all([
          fetch('/api/chats'),
          fetch('/api/items'),
          fetch('/api/account'),
        ])
        if (chatRes.status === 401 || itemRes.status === 401 || accountRes.status === 401) {
          setError('Authentication required. Please login again.')
          return
        }

        const [chatData, itemData, accountData] = await Promise.all([
          chatRes.json(),
          itemRes.json(),
          accountRes.json(),
        ])

        setStats({
          users: accountData.user ? 1 : 0,
          chats: chatData.ok ? chatData.chats.length : 0,
          items: itemData.ok ? itemData.items.length : 0,
        })
        setPreviewChats(chatData.ok ? chatData.chats.slice(0, 3) : [])
        setPreviewItems(itemData.ok ? itemData.items.slice(0, 3) : [])
        setUser(accountData.ok ? accountData.user : null)
      } catch (err) {
        console.error(err)
        setError('Failed to fetch dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const chartData = useMemo(
    () => [
      { label: 'Mon', value: 32 },
      { label: 'Tue', value: 45 },
      { label: 'Wed', value: 28 },
      { label: 'Thu', value: 61 },
      { label: 'Fri', value: 48 },
      { label: 'Sat', value: 23 },
      { label: 'Sun', value: 56 },
    ],
    []
  )

  return (
    <main className="dashboardPage">
      <header className="heroCard">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Secure analytics for your app</h1>
          <p className="heroText">
            This dashboard is displayed only after Keycloak authentication, and all data is validated from the backend.
          </p>
        </div>
        <div className="heroActions">
          <Link href="/api/auth/logout" className="button secondary">
            Sign out
          </Link>
        </div>
      </header>

      <section className="grid overviewGrid">
        <article className="statCard">
          <p className="statLabel">Verified user</p>
          <h2>{loading ? '...' : user ? user.name : 'N/A'}</h2>
          <p className="statSubtext">Authenticated through Keycloak</p>
        </article>
        <article className="statCard">
          <p className="statLabel">Chats</p>
          <h2>{loading ? '...' : stats.chats}</h2>
          <p className="statSubtext">Secure chat count</p>
        </article>
        <article className="statCard">
          <p className="statLabel">Inventory items</p>
          <h2>{loading ? '...' : stats.items}</h2>
          <p className="statSubtext">Backend validated table records</p>
        </article>
      </section>

      <section className="grid widgetGrid">
        <article className="widgetCard chartCard">
          <div className="widgetHeader">
            <h3>Weekly activity</h3>
            <Link href="/table" className="smallButton">
              Full report
            </Link>
          </div>
          <div className="chartBars">
            {chartData.map((item) => (
              <div key={item.label} className="chartBar">
                <div className="barFill" style={{ height: `${item.value}%` }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="widgetCard">
          <div className="widgetHeader">
            <h3>Latest chats</h3>
            <Link href="/chats" className="smallButton">
              See all
            </Link>
          </div>
          {loading ? (
            <p>Loading chats...</p>
          ) : previewChats.length > 0 ? (
            <ul className="previewList">
              {previewChats.map((chat) => (
                <li key={chat.id}>
                  <strong>{chat.user_name || 'Guest'}</strong>
                  <span>{chat.message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No chats available yet.</p>
          )}
        </article>

        <article className="widgetCard accountCard">
          <div className="widgetHeader">
            <h3>Account snapshot</h3>
            <Link href="/account" className="smallButton">
              Profile
            </Link>
          </div>
          {loading ? (
            <p>Loading account...</p>
          ) : user ? (
            <div className="accountInfo">
              <p className="accountName">{user.name}</p>
              <p>{user.email}</p>
              <p className="accountMeta">Joined {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          ) : (
            <p>No account data found.</p>
          )}
        </article>
      </section>

      {error ? <p className="errorBanner">{error}</p> : null}

      <style jsx>{`
        .dashboardPage {
          padding: 24px;
          max-width: 1180px;
          margin: 0 auto;
          min-height: 100vh;
        }

        .heroCard {
          display: flex;
          gap: 24px;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, #1d4ed8 0%, #0f172a 100%);
          color: white;
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 24px;
        }

        .heroActions {
          display: flex;
          gap: 12px;
        }

        .button.secondary {
          background: rgba(255, 255, 255, 0.16);
          color: white;
        }

        .overviewGrid,
        .widgetGrid {
          display: grid;
          gap: 20px;
        }

        .overviewGrid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          margin-bottom: 24px;
        }

        .widgetGrid {
          grid-template-columns: 2fr 1.5fr 1fr;
          margin-bottom: 24px;
        }

        .chartCard {
          min-height: 320px;
        }

        .chartBars {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 14px;
          height: 240px;
          padding-top: 20px;
        }

        .chartBar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .barFill {
          width: 100%;
          min-height: 24px;
          background: linear-gradient(180deg, #60a5fa 0%, #0ea5e9 100%);
          border-radius: 18px 18px 0 0;
          align-self: flex-end;
        }

        .chartBar span {
          color: #475569;
          font-size: 0.95rem;
        }

        .errorBanner {
          padding: 16px 20px;
          background: #fee2e2;
          color: #b91c1c;
          border-radius: 16px;
          margin-top: 8px;
        }

        @media (max-width: 980px) {
          .overviewGrid,
          .widgetGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  )
}
