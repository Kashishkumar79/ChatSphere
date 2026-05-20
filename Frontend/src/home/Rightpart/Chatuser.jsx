import React from "react";
import useConversation from "../../statemanage/useConversation.js";
import { useSocketContext } from "../../context/SocketContext.jsx";

function Chatuser({ onMenuClick }) {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(selectedConversation?._id);

  const initials = selectedConversation?.fullname
    ? selectedConversation.fullname.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
      style={{ background: "var(--navy-900)", borderBottom: "1px solid var(--border-subtle)", minHeight: "64px" }}>
      
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center mr-1 flex-shrink-0"
        style={{ background: "rgba(59,130,246,0.1)", border: "1px solid var(--border-subtle)" }}
      >
        <svg className="w-4 h-4" style={{ color: "var(--text-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #1d4ed8, #06b6d4)", boxShadow: "0 0 12px rgba(59,130,246,0.3)" }}>
          {initials}
        </div>
        {isOnline && <div className="absolute bottom-0 right-0 online-dot" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-bold truncate" style={{ color: "var(--text-primary)", fontFamily: "Syne, sans-serif" }}>
          {selectedConversation?.fullname}
        </h2>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: isOnline ? "#22c55e" : "var(--text-muted)" }} />
          <span className="text-xs" style={{ color: isOnline ? "#22c55e" : "var(--text-muted)" }}>
            {isOnline ? "Online now" : "Offline"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{ background: "rgba(59,130,246,0.1)", border: "1px solid var(--border-subtle)" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}
          title="Video call (coming soon)"
        >
          <svg className="w-4 h-4" style={{ color: "var(--text-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.951V15.05a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          onClick={() => setSelectedConversation(null)}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
          title="Close chat"
        >
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Chatuser;
