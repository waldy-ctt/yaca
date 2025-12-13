// src/renderer/src/stores/authStore.ts
import { UserModel } from "@/types";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { ws } from "@/lib/api";

type State = {
  user: UserModel | null;
  token: string | null;
  isAuthenticated: boolean;
};

type Actions = {
  login: (user: UserModel, token: string) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<UserModel>) => void;
  setToken: (token: string | null) => void;
};

export const useAuthStore = create<State & Actions>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,

        login: (user, token) => {
          set({ user, token, isAuthenticated: true });
          ws.connect();
        },
        logout: () => {
          ws.disconnect();
          set({ user: null, token: null, isAuthenticated: false });
        },

        updateUser: (updatedUser) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...updatedUser } : null,
          })),

        setToken: (token) => set({ token }),
      }),
      { name: "auth-storage" },
    ),
  ),
);
