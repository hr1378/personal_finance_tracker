const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// The access token lives in memory only — never in localStorage — so XSS
// cannot exfiltrate a long-lived credential. The refresh token is held by the
// browser in an httpOnly cookie and is exchanged via /auth/refresh.
let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function clearAccessToken() {
  accessToken = null
}

export interface SessionUser {
  id: string
  email: string
  preferredCurrency: string
}

interface AuthData {
  token: string
  userId: string
  email: string
  preferredCurrency?: string
}

function toSessionUser(data: AuthData): SessionUser {
  return { id: data.userId, email: data.email, preferredCurrency: data.preferredCurrency ?? 'USD' }
}

/**
 * Exchange the httpOnly refresh-token cookie for a new access token.
 * Returns the user profile on success, null when no valid session exists.
 */
export async function refreshSession(): Promise<SessionUser | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    })
    if (!res.ok) return null
    const data: AuthData = await res.json()
    accessToken = data.token
    return toSessionUser(data)
  } catch {
    return null
  }
}

/** Store credentials returned by login/register and return the user profile. */
export function applyAuthResponse(data: AuthData): SessionUser {
  accessToken = data.token
  return toSessionUser(data)
}
