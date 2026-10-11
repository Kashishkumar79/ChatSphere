import React, { createContext, useContext, useState } from "react";
import { getStoredUser } from "../lib/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUserState] = useState(getStoredUser);

  // Login/logout dono yahin se hote hain, localStorage bhi sync rehta hai
  const setAuthUser = (value) => {
    if (value) localStorage.setItem("ChatApp", JSON.stringify(value));
    else localStorage.removeItem("ChatApp");
    setAuthUserState(value);
  };

  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
