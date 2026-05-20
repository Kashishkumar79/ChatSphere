import React from "react";

function Message({ message }) {
  const authUser = JSON.parse(localStorage.getItem("ChatApp"));
  const itsMe = message.senderId === authUser?.user?._id;

  const createdAt = new Date(message.createdAt);
  const formattedTime = createdAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${itsMe ? "justify-end" : "justify-start"} px-4 py-1`}>
      <div className="max-w-[75%] sm:max-w-[65%]">
        <div className={`px-4 py-2.5 text-sm leading-relaxed ${itsMe ? "msg-mine text-white" : "msg-theirs"}`}
          style={{ color: itsMe ? "white" : "var(--text-primary)" }}>
          {message.message}
        </div>
        <p className={`text-xs mt-1 ${itsMe ? "text-right" : "text-left"}`} style={{ color: "var(--text-muted)" }}>
          {formattedTime}
          {itsMe && (
            <span className="ml-1.5 inline-flex items-center">
              <svg className="w-3 h-3" style={{ color: "var(--accent-blue)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export default Message;
