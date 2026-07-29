import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../config/firebase";
import { UserService } from "../services/UserService";

type Role = "admin" | "staff" | null;

interface AuthContextValue {
  user: User | null;
  role: Role;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const role = await UserService.getUserRole(firebaseUser.uid);
          setRole(role);
        } catch (error) {
          console.error("Failed to fetch user role:", error);
          setRole(null);
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
