const { URLSearchParams } = require('url')

const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_BASE_URL?.replace(/\/+$/, '') || ''
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || ''
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || ''
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

function getMissingKeycloakEnvVars() {
  const missing = []
  if (!KEYCLOAK_BASE_URL) missing.push('KEYCLOAK_BASE_URL')
  if (!KEYCLOAK_REALM) missing.push('KEYCLOAK_REALM')
  if (!KEYCLOAK_CLIENT_ID) missing.push('KEYCLOAK_CLIENT_ID')
  return missing
}

function assertKeycloakConfig() {
  const missing = getMissingKeycloakEnvVars()
  if (missing.length > 0) {
    const message = `Missing Keycloak environment variables: ${missing.join(', ')}`
    console.error(message)
    throw new Error(message)
  }
}

function getTokenEndpoint() {
  assertKeycloakConfig()
  return `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`
}

function getIntrospectEndpoint() {
  assertKeycloakConfig()
  return `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token/introspect`
}

function buildAuthUrl() {
  assertKeycloakConfig()
  const redirectUri = `${APP_URL}/api/auth/callback`
  const params = new URLSearchParams({
    client_id: KEYCLOAK_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
  })

  return `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth?${params.toString()}`
}

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(/;\s*/)
    .filter(Boolean)
    .reduce((acc, pair) => {
      const [key, ...rest] = pair.split('=')
      acc[key] = rest.join('=')
      return acc
    }, {})
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization || ''
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  const cookies = parseCookies(req.headers.cookie || '')
  return cookies.access_token || null
}

async function exchangeCode(code) {
  const redirectUri = `${APP_URL}/api/auth/callback`
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: KEYCLOAK_CLIENT_ID,
    redirect_uri: redirectUri,
  })

  if (KEYCLOAK_CLIENT_SECRET) {
    body.append('client_secret', KEYCLOAK_CLIENT_SECRET)
  }

  const response = await fetch(getTokenEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  return response.json()
}

async function introspectToken(accessToken) {
  const body = new URLSearchParams({
    token: accessToken,
    token_type_hint: 'access_token',
  })

  if (KEYCLOAK_CLIENT_SECRET) {
    body.append('client_id', KEYCLOAK_CLIENT_ID)
    body.append('client_secret', KEYCLOAK_CLIENT_SECRET)
  } else {
    body.append('client_id', KEYCLOAK_CLIENT_ID)
  }

  const response = await fetch(getIntrospectEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

async function loginWithCredentials(username, password) {
  const body = new URLSearchParams({
    grant_type: 'password',
    username,
    password,
    client_id: KEYCLOAK_CLIENT_ID,
    scope: 'openid profile email',
  })

  if (KEYCLOAK_CLIENT_SECRET) {
    body.append('client_secret', KEYCLOAK_CLIENT_SECRET)
  }

  const response = await fetch(getTokenEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorDesc = 'Invalid username or password'
    try {
      const errJson = JSON.parse(errorText)
      errorDesc = errJson.error_description || errJson.error || errorDesc
    } catch (_) { }
    throw new Error(errorDesc)
  }

  return response.json()
}


async function validateRequest(req, res) {
  const accessToken = getTokenFromRequest(req)
  if (!accessToken) {
    res.status(401).json({ ok: false, error: 'Missing token' })
    return null
  }

  const introspection = await introspectToken(accessToken)
  if (!introspection || !introspection.active) {
    res.status(401).json({ ok: false, error: 'Invalid or expired token' })
    return null
  }

  return introspection
}

function getCookieHeader(token, maxAgeSeconds) {
  const appUrl = APP_URL || ''
  const isSecure = process.env.FORCE_SECURE === 'true' || process.env.NODE_ENV === 'production' || appUrl.startsWith('https')
  const sameSite = isSecure ? 'None' : 'Lax'
  const secureFlag = isSecure ? '; Secure' : ''
  return [`access_token=${token}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${maxAgeSeconds}${secureFlag}`]
}

module.exports = {
  buildAuthUrl,
  exchangeCode,
  validateRequest,
  getTokenFromRequest,
  getCookieHeader,
  loginWithCredentials,
}
