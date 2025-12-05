import { UserModel } from '@/types'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type State = {
  user: UserModel | null
  token: string | null
  isAuthenticated: boolean
}

type Actions = {
  login: (user: UserModel, token: string) => void
  logout: () => void
  setUser: (user: UserModel) => void
}

export const useAuthStore = create<State & Actions>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,

        login: (user, token) => set({ user, token, isAuthenticated: true }),
        logout: () => set({ user: null, token: null, isAuthenticated: false }),
        setUser: (user) => set({ user, isAuthenticated: !!user }),
      }),
      { name: 'auth-storage' }
    )
  )
)
