import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AppShell from "./layout/AppShell";

function App() {
  const [authUser] = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={authUser ? <AppShell /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={authUser ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={authUser ? <Navigate to="/" replace /> : <Signup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111d3d",
            color: "#e6ecff",
            border: "1px solid #1c2b52",
            borderRadius: "12px",
            fontFamily: "DM Sans, sans-serif",
            fontSize: "14px",
          },
        }}
      />
    </>
  );
}

export default App;
