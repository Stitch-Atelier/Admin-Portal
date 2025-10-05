import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type LoginRes, type SignupReq } from "../types/type";

interface UserStore extends Partial<LoginRes> {
  setUser: (data: LoginRes) => void;
  logoutFunc: () => void;
  signupFunc: (data: SignupReq) => void;
}

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      authToken: null,
      message: null,
      user: {
        id: null,
        firstname: null,
        lastname: null,
        role: null,
        mobile: null,
        createdAt: null,
        isVerified: false,
      },

      // ✅ Set user info and token
      setUser: (data) => {
        console.log("Setting user data:", data);
        set({
          authToken: data.authToken,
          message: data.message,
          user: data.user,
        });
      },

      // ✅ Clear user info
      logoutFunc: () => {
        set({
          authToken: null,
          message: null,
          user: {
            id: null,
            firstname: null,
            lastname: null,
            role: null,
            mobile: null,
            createdAt: null,
            isVerified: false,
          },
        });
      },

      // ✅ Signup placeholder
      signupFunc: (data) => {
        console.log("Signup data:", data);
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage), // ✅ Explicitly define localStorage
    }
  )
);

export default useUserStore;
