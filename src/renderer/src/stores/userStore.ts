import { UserModel } from "@/types"
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type State = {
  user: UserModel | null
}

type Actions = {
  updateUser: (user: UserModel) => void;
}

export const useUserStore = create<State & Actions>() (
  devtools((
    persist(
      (set) => ({
        user: null,

        updateUser: (user) => set({user})
      }),
      {name: 'user-storage'}
    )
  ))
)
