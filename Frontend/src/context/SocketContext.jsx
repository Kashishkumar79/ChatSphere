import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthProvider";
import { API_URL } from "../lib/api";

const SocketContext = createContext({ socket: null, onlineUsers: [] });

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [authUser] = useAuth();
  const userId = authUser?.user?._id;

  useEffect(() => {
    if (!userId) {
      setSocket(null);
      setOnlineUsers([]);
      return;
    }
    const s = io(API_URL, { query: { userId }, withCredentials: true });
    setSocket(s);
    s.on("getOnlineUsers", (users) => setOnlineUsers(users));
    return () => {
      s.off("getOnlineUsers");
      s.close();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
