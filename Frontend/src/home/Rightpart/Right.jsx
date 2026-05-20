import React, { useEffect } from "react";
import Chatuser from "./Chatuser";
import Messages from "./Messages";
import Typesend from "./Typesend";
import useConversation from "../../statemanage/useConversation.js";
import { useAuth } from "../../context/AuthProvider.jsx";

function Right({ onMenuClick }) {
  const { selectedConversation, setSelectedConversation } = useConversation();

  useEffect(() => {
    return () => setSelectedConversation(null);
  }, [setSelectedConversation]);

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--navy-950)" }}>
      {!selectedConversation ? (
        <NoChatSelected onMenuClick={onMenuClick} />
      ) : (
        <>
          <Chatuser onMenuClick={onMenuClick} />
          <div className="flex-1 overflow-y-auto">
            <Messages />
          </div>
          <Typesend />
        </>
      )}
    </div>
  );
}

export default Right;

const NoChatSelected = ({ onMenuClick }) => {
  const [authUser] = useAuth();
  const name = authUser?.user?.fullname || "there";

  return (
    <div className="h-full flex flex-col">
      {/* Top bar with menu button on mobile */}
      <div className="flex items-center px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)", minHeight: "60px" }}>
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center mr-3"
          style={{ background: "rgba(59,130,246,0.1)", border: "1px solid var(--border-subtle)" }}
        >
          <svg className="w-5 h-5" style={{ color: "var(--text-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-secondary)", fontFamily: "Syne, sans-serif" }}>
          ChatSphere
        </h2>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Animated icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center animate-float"
            style={{ background: "linear-gradient(135deg, rgba(29,78,216,0.2), rgba(6,182,212,0.2))", border: "1px solid rgba(59,130,246,0.3)" }}>
            <svg className="w-12 h-12" style={{ color: "var(--accent-blue)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          {/* Decorative rings */}
          <div className="absolute inset-0 rounded-3xl animate-ping opacity-10"
            style={{ border: "2px solid var(--accent-blue)", animationDuration: "3s" }} />
        </div>

        <h2 className="text-2xl font-bold mb-2 gradient-text" style={{ fontFamily: "Syne, sans-serif" }}>
          Hey, {name}! 👋
        </h2>
        <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--text-muted)" }}>
          Select a contact from the sidebar to start chatting. Your conversations are end-to-end secured.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {["Real-time chat", "Online status", "Secure messages"].map((f) => (
            <div key={f} className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "var(--text-secondary)" }}>
              {f}
            </div>
          ))}
        </div>

        {/* Mobile hint */}
        <button
          onClick={onMenuClick}
          className="md:hidden mt-6 btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Browse Contacts
        </button>
      </div>
    </div>
  );
};
