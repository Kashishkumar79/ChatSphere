import React, { useState } from "react";
import toast from "react-hot-toast";
import { LuCheckCheck, LuFileText, LuDownload, LuLoader } from "react-icons/lu";
import { downloadAttachment, formatSize } from "../lib/files";

function AttachmentCard({ id, att, mine }) {
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    setBusy(true);
    try {
      await downloadAttachment(id, att.originalName);
    } catch (err) {
      toast.error(err?.response?.data?.error || "File download nahi hui");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className={`w-full min-w-[220px] flex items-center gap-3 p-2.5 rounded-xl text-left transition ${
        mine ? "bg-white/10 hover:bg-white/20" : "bg-bg/60 hover:bg-bg"
      }`}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-brand-500/20 shrink-0">
        <LuFileText className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{att.originalName}</p>
        <p className={`text-[11px] ${mine ? "text-white/70" : "text-muted"}`}>
          {formatSize(att.size)} · Download
        </p>
      </div>
      {busy ? <LuLoader className="w-4 h-4 animate-spin shrink-0" /> : <LuDownload className="w-4 h-4 shrink-0" />}
    </button>
  );
}

export default function MessageBubble({ message, mine, showName }) {
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"} px-3 sm:px-6 ${showName ? "mt-3" : "mt-0.5"}`}>
      <div className={`max-w-[80%] sm:max-w-[65%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
        {showName && !mine && (
          <span className="text-xs font-semibold text-accent mb-1 ml-1">{message.senderName}</span>
        )}
        <div
          className={`px-3.5 py-2.5 text-sm leading-relaxed shadow-sm space-y-2 ${
            mine
              ? "bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-2xl rounded-br-md"
              : "bg-surface2 text-ink border border-line rounded-2xl rounded-bl-md"
          }`}
        >
          {message.attachment && (
            <AttachmentCard id={message._id} att={message.attachment} mine={mine} />
          )}
          {message.message && <p className="whitespace-pre-wrap break-words">{message.message}</p>}
        </div>
        <span className="flex items-center gap-1 text-[11px] text-dim mt-1 px-1">
          {time}
          {mine && <LuCheckCheck className="w-3 h-3 text-brand-400" />}
        </span>
      </div>
    </div>
  );
}
