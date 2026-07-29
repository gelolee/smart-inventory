import { db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { AppUser, UserRole } from "../types/User";

const USERS_COLLECTION = "users";

export const UserService = {
  getUserRole: async (uid: string): Promise<UserRole | null> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return null;
      }

      return userSnap.data().role as UserRole;
    } catch (error) {
      console.error("Firebase user role lookup error:", error);
      throw error;
    }
  },

  getUser: async (uid: string): Promise<AppUser | null> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return null;
      }

      return {
        uid: userSnap.id,
        ...(userSnap.data() as Omit<AppUser, "uid">),
      };
    } catch (error) {
      console.error("Firebase user lookup error:", error);
      throw error;
    }
  },
};
