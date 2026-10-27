import axios from 'axios'

// One shared axios instance for the whole app.
// In development VITE_API_URL is empty and Vite proxies "/api" to the backend.
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
})

const TOKEN_KEY = 'imovies_token'

// localStorage can throw in private mode, so every access is wrapped.
export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* ignore */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* ignore */
    }
  },
}

// Attach the login token to every request.
http.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// The API wraps successful results as { data }, so unwrap them here.
// If a logged-in request gets 401, the token has expired: log out everywhere.
http.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      tokenStore.clear()
      window.dispatchEvent(new Event('imovies:logout'))
    }
    return Promise.reject(error)
  },
)

// Turns any request error into a friendly sentence for the UI.
export function getErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message
  // 502/503/504 come from the dev proxy or host when the API itself is down.
  if ([502, 503, 504].includes(error?.response?.status)) {
    return 'The IMovies server is not responding. Make sure the backend is running (npm run dev in the server folder) and try again.'
  }
  if (error?.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.'
  if (error?.request && !error.response) return 'Cannot reach the IMovies server. Check your connection and try again.'
  return error?.message || 'Something went wrong. Please try again.'
}

export default http
