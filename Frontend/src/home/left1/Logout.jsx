import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthProvider";

function Logout() {
  const [loading, setLoading] = useState(false);
  const [authUser] = useAuth();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.post("https://chatsphere-qkvb.onrender.com/api/user/logout", {}, { withCredentials: true });
      localStorage.removeItem("ChatApp");
      Cookies.remove("jwt");
      toast.success("Logged out");
      window.location.reload();
    } catch (error) {
      toast.error("Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between py-4 px-2 flex-shrink-0"
      style={{ width: "56px", background: "var(--navy-900)", borderRight: "1px solid var(--border-subtle)" }}>
      
      {/* Logo icon at top */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center animate-float"
        style={{ background: "linear-gradient(135deg, #1d4ed8, #06b6d4)", boxShadow: "0 0 15px rgba(59,130,246,0.4)" }}>
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)", color: "white", boxShadow: "0 0 10px rgba(59,130,246,0.3)" }}>
          {authUser?.user?.fullname?.[0]?.toUpperCase() || "U"}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={loading}
          title="Logout"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.25)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(239,68,68,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default Logout;
