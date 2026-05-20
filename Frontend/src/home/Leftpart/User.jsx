import React from "react";
import useConversation from "../../statemanage/useConversation.js";
import { useSocketContext } from "../../context/SocketContext.jsx";

function User({ user }) {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const isSelected = selectedConversation?._id === user._id;
  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(user._id);

  const initials = user.fullname
    ? user.fullname.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const colors = ["#1d4ed8", "#0e7490", "#7c3aed", "#065f46", "#92400e", "#9f1239"];
  const colorIdx = user._id ? user._id.charCodeAt(0) % colors.length : 0;

  return (
    <div
      className={`user-item mx-2 rounded-xl cursor-pointer animate-fade-in ${isSelected ? "active" : ""}`}
      onClick={() => setSelectedConversation(user)}
    >
      <div className="flex items-center gap-3 px-3 py-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${colors[colorIdx]}, ${colors[(colorIdx + 1) % colors.length]})`, boxShadow: isSelected ? `0 0 12px ${colors[colorIdx]}60` : "none" }}>
            {initials}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 online-dot" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold truncate" style={{ color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}>
              {user.fullname || user.name}
            </h3>
            {isOnline && (
              <span className="text-xs font-medium ml-1 flex-shrink-0" style={{ color: "#22c55e" }}>●</span>
            )}
          </div>
          <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}

export default User;
