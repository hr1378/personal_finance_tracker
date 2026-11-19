import { getAccessToken, refreshSession } from './session'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Auth endpoints that must never trigger a refresh-retry loop.
const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']

const GUEST_KEY = 'finance_guest'

function clearSession() {
  // Access token is in-memory only; clearing guest flag + stored profile.
  localStorage.removeItem('user')
  localStorage.removeItem(GUEST_KEY)
}

function isApiCall(url: string): boolean {
  return url.includes('/api/') || url.startsWith(API_BASE_URL)
}

function isPublicAuthCall(url: string): boolean {
  return PUBLIC_AUTH_PATHS.some((p) => url.includes(p))
}

/**
 * Wraps window.fetch so any 401 from the API triggers a single refresh-token
 * exchange (via the httpOnly cookie) and one transparent retry. If refresh
 * fails, the in-memory session is cleared and the app reloads onto the start
 * page.
 */
export function installAuthInterceptor() {
  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const isApi = isApiCall(url)

    let response = await originalFetch(input, init)

    if (response.status === 401 && isApi && !isPublicAuthCall(url)) {
      const hadSession = getAccessToken() !== null
      const user = await refreshSession()
      if (user) {
        const headers = new Headers(
          init?.headers ?? (input instanceof Request ? input.headers : undefined)
        )
        headers.set('Authorization', `Bearer ${getAccessToken()}`)
        response = await originalFetch(input, { ...init, headers })
      } else if (hadSession) {
        // Session is genuinely expired — send the user back to the start page.
        clearSession()
        window.location.reload()
      }
    }

    return response
  }
}
