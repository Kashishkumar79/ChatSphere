import React, { useState, useRef } from "react";
import useSendMessage from "../../context/useSendMessage.js";

function Typesend() {
  const [message, setMessage] = useState("");
  const { loading, sendMessages } = useSendMessage();
  const inputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    await sendMessages(message.trim());
    setMessage("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="px-4 py-3 flex-shrink-0"
      style={{ background: "var(--navy-900)", borderTop: "1px solid var(--border-subtle)" }}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2">
          {/* Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Enter to send)"
              className="chat-input w-full px-4 py-3 text-sm pr-12"
            />
            {/* Emoji hint */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-lg opacity-40 select-none pointer-events-none">
              💬
            </div>
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!message.trim() || loading}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{
              background: message.trim() && !loading
                ? "linear-gradient(135deg, #1d4ed8, #2563eb)"
                : "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.3)",
              boxShadow: message.trim() && !loading ? "0 0 15px rgba(59,130,246,0.4)" : "none",
              cursor: message.trim() && !loading ? "pointer" : "not-allowed",
            }}
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" style={{ color: "var(--accent-blue)" }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-center mt-1.5" style={{ color: "var(--text-muted)" }}>
          Messages are secured end-to-end
        </p>
      </form>
    </div>
  );
}

export default Typesend;
