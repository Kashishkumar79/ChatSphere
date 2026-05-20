import React, { useState } from "react";
import Left from "./home/Leftpart/Left";
import Right from "./home/Rightpart/Right";
import Signup from "./components/Signup";
import Login from "./components/Login";
import { useAuth } from "./context/AuthProvider";
import { Toaster } from "react-hot-toast";
import Logout from "./home/left1/Logout";
import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  const [authUser, setAuthUser] = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            authUser ? (
              <div className="flex h-screen w-screen overflow-hidden" style={{ background: "var(--navy-950)" }}>
                {/* Sidebar toggle overlay for mobile */}
                {sidebarOpen && (
                  <div
                    className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={() => setSidebarOpen(false)}
                  />
                )}
                {/* Logout strip */}
                <Logout />
                {/* Left sidebar - hidden on mobile, shown in overlay */}
                <div className={`
                  fixed md:relative z-30 md:z-auto h-full
                  transition-transform duration-300 ease-in-out
                  ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                  w-72 md:w-[30%] lg:w-[28%] xl:w-[25%] flex-shrink-0
                `}>
                  <Left onClose={() => setSidebarOpen(false)} />
                </div>
                {/* Right chat area */}
                <div className="flex-1 min-w-0">
                  <Right onMenuClick={() => setSidebarOpen(true)} />
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/login" element={authUser ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={authUser ? <Navigate to="/" /> : <Signup />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0a1535",
            color: "#e8edf8",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: "12px",
            fontFamily: "DM Sans, sans-serif",
          },
        }}
      />
    </>
  );
}

export default App;
