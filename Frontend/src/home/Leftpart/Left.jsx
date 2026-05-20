import React from "react";
import Search from "./Search";
import Users from "./Users";

function Left({ onClose }) {
  return (
    <div className="h-full flex flex-col" style={{ background: "var(--navy-900)", borderRight: "1px solid var(--border-subtle)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)", fontFamily: "Syne, sans-serif" }}>
            Messages
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Your conversations</p>
        </div>
        {/* Mobile close */}
        {onClose && (
          <button onClick={onClose} className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid var(--border-subtle)" }}>
            <svg className="w-4 h-4" style={{ color: "var(--text-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <Search />

      {/* Users list */}
      <div className="flex-1 overflow-y-auto">
        <Users />
      </div>
    </div>
  );
}

export default Left;
