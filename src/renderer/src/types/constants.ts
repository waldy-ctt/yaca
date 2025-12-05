// UPPER_SNAKE_CASE for const

export const ROUTES = {
  ROOT: '/',
  LOGIN: '/',              // ← public login is now root
  SIGNUP: '/signup',
  HOME: '/',                // ← protected home is also root (different parent)
  SETTINGS: '/settings',
} as const
