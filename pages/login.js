import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleDirectLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      if (response.ok && data.ok) {
        // Redirect to dashboard on success
        router.push('/dashboard')
      } else {
        setError(data.error || 'Invalid credentials or connection issue.')
      }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="loginPage">
      <div className="loginCard">
        <div className="cardHeader">
          <div className="logoMark">🔑</div>
          <h1>Welcome back</h1>
          <p>Sign in to your account securely via direct credentials or Keycloak SSO.</p>
        </div>

        {error && (
          <div className="errorAlert">
            <span className="errorIcon">⚠️</span>
            <p className="errorMessage">{error}</p>
          </div>
        )}

        <form onSubmit={handleDirectLogin} className="loginForm">
          <div className="inputGroup">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="inputGroup">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="button primary" disabled={loading}>
            {loading ? (
              <span className="spinnerLabel">
                <span className="spinner"></span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="divider">
          <span>or continue with SSO</span>
        </div>

        <a href="/api/auth/login" className="button ssoButton">
          <span className="ssoIcon">🛡️</span>
          Sign in with Keycloak
        </a>

        <div className="footerLink">
          <Link href="/dashboard">Continue to dashboard directly</Link>
        </div>
      </div>

      <style jsx>{`
        .loginPage {
          min-height: 100vh;
          padding: 40px 16px;
          display: grid;
          place-items: center;
          background: radial-gradient(circle at top, rgba(99, 102, 241, 0.18), transparent 45%),
                      radial-gradient(circle at bottom right, rgba(6, 182, 212, 0.12), transparent 45%),
                      #0b0f19;
          color: white;
          font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .loginCard {
          width: min(480px, 100%);
          padding: 40px;
          border-radius: 28px;
          background: rgba(17, 24, 39, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          text-align: center;
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .cardHeader {
          margin-bottom: 28px;
        }

        .logoMark {
          font-size: 32px;
          margin-bottom: 12px;
          display: inline-block;
          background: rgba(255, 255, 255, 0.05);
          width: 64px;
          height: 64px;
          line-height: 64px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        h1 {
          margin: 0 0 10px;
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #ffffff 60%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        p {
          margin: 0;
          line-height: 1.6;
          color: #94a3b8;
          font-size: 0.95rem;
        }

        .errorAlert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          margin-bottom: 24px;
          text-align: left;
          animation: shake 0.4s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        .errorIcon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .errorMessage {
          color: #f87171;
          font-size: 0.875rem;
          line-height: 1.4;
          margin: 0;
        }

        .loginForm {
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: left;
        }

        .inputGroup {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .inputGroup label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #cbd5e1;
        }

        .inputGroup input {
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .inputGroup input:focus {
          outline: none;
          border-color: #6366f1;
          background: rgba(15, 23, 42, 0.9);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          border-radius: 12px;
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .button.primary {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .button.primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
        }

        .spinnerLabel {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
          color: #475569;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .divider:not(:empty)::before {
          margin-right: .5em;
        }

        .divider:not(:empty)::after {
          margin-left: .5em;
        }

        .button.ssoButton {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
          gap: 10px;
        }

        .button.ssoButton:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          color: white;
          transform: translateY(-1px);
        }

        .footerLink {
          margin-top: 28px;
        }

        .footerLink :global(a) {
          color: #818cf8;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }

        .footerLink :global(a:hover) {
          color: #a5b4fc;
        }
      `}</style>
    </main>
  )
}
