import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../config/firebase";

export const AuthService = {
  /**
   * Sign in a user with email and password.
   */
  login: async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  /**
   * Sign out the currently logged-in user.
   */
  logout: async (): Promise<void> => {
    await signOut(auth);
  },
};
