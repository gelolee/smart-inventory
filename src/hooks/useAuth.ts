import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);

  return {
    ...context,
    isAdmin: context.role === "admin",
    isStaff: context.role === "staff",
  };
}
