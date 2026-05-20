import React from "react";

function Loading() {
  return (
    <div className="flex items-center justify-center h-full py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{ borderTopColor: "var(--accent-blue)", animation: "spin 1s linear infinite" }} />
          <div className="absolute inset-1 rounded-full border-2 border-transparent"
            style={{ borderBottomColor: "var(--accent-cyan)", animation: "spin 1.5s linear infinite reverse" }} />
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Loading messages...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Loading;
