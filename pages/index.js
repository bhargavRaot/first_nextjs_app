import Link from 'next/link'

export default function Home() {
  return (
    <main className="loginPage">
      <div className="loginCard">
        <h1>Secure Keycloak Login</h1>
        <p>Sign in with your Keycloak account to load the dashboard and view protected data.</p>
        <a href="/api/auth/login" className="button primary">
          Login with Keycloak
        </a>
        <p className="note">If you are already authenticated, go to the dashboard directly.</p>
        <Link href="/dashboard" className="continueLink">
          Go to Dashboard
        </Link>
      </div>

      <style jsx>{`
        .loginPage {
          min-height: 100vh;
          padding: 40px 16px;
          display: grid;
          place-items: center;
          background: radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 40%), #0f172a;
          color: white;
        }

        .loginCard {
          width: min(560px, 100%);
          padding: 40px;
          border-radius: 28px;
          background: rgba(15, 23, 42, 0.95);
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(18px);
          text-align: center;
        }

        h1 {
          margin: 0 0 18px;
          font-size: clamp(2.2rem, 2.5vw, 3rem);
        }

        p {
          margin: 0 0 22px;
          line-height: 1.75;
          color: #cbd5e1;
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 24px;
          border-radius: 999px;
          color: white;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s ease, background-color 0.2s ease;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
        }

        .button:hover {
          transform: translateY(-2px);
        }

        .note {
          margin-top: 18px;
          color: #94a3b8;
          font-size: 0.95rem;
        }

        .continueLink {
          display: inline-block;
          margin-top: 18px;
          color: #93c5fd;
          text-decoration: none;
        }
      `}</style>
    </main>
  )
}
