import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { LuArrowLeft, LuSearch, LuInfo, LuSend, LuX, LuMessageSquare, LuUsers, LuPaperclip, LuFileText } from "react-icons/lu";
import { ACCEPT_FILES, MAX_FILE_BYTES, formatSize } from "../lib/files";
import api, { errorMessage } from "../lib/api";
import useAppStore from "../store/useAppStore";
import { useAuth } from "../context/AuthProvider";
import { useSocketContext } from "../context/SocketContext";
import Avatar from "../components/Avatar";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import MessageBubble from "./MessageBubble";
import GroupInfoPanel from "../groups/GroupInfoPanel";

// Ek hi component DM aur group dono ke liye kaam karta hai
export default function ChatWindow() {
  const active = useAppStore((s) => s.active);
  const messages = useAppStore((s) => s.messages);
  const setMessages = useAppStore((s) => s.setMessages);
  const appendMessage = useAppStore((s) => s.appendMessage);
  const setActive = useAppStore((s) => s.setActive);
  const refreshGroups = useAppStore((s) => s.refresh.groups);
  const [authUser] = useAuth();
  const { onlineUsers } = useSocketContext();

  const myId = String(authUser?.user?._id);
  const isGroup = active.type === "group";
  const isOnline = !isGroup && onlineUsers.includes(active.id);

  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);
  const [groupMeta, setGroupMeta] = useState(null);
  const endRef = useRef(null);

  const loadUrl = isGroup ? `/api/group/${active.id}/messages` : `/api/message/get/${active.id}`;
  const sendUrl = isGroup ? `/api/group/${active.id}/messages` : `/api/message/send/${active.id}`;

  // Messages load karo
  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .get(loadUrl)
      .then((res) => {
        if (alive) setMessages(res.data);
      })
      .catch((err) => {
        if (!alive) return;
        setMessages([]);
        // Access nahi hai (friend nahi / group member nahi) to chat band kar do
        if (err?.response?.status === 403) {
          setActive(null);
          toast.error(errorMessage(err));
        } else {
          toast.error(errorMessage(err, "Messages load nahi ho paaye"));
        }
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [loadUrl, setMessages, setActive]);

  // Group ki details (member count, admin) header ke liye
  useEffect(() => {
    if (!isGroup) return;
    let alive = true;
    api
      .get(`/api/group/${active.id}`)
      .then((r) => alive && setGroupMeta(r.data))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [isGroup, active.id, refreshGroups]);

  // Naya message aaye to neeche scroll karo
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, loading]);

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > MAX_FILE_BYTES) {
      toast.error("File 10MB se badi hai");
      return;
    }
    setFile(f);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if ((!text && !file) || sending) return;
    const chatId = active.id;
    setSending(true);
    try {
      let res;
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        if (text) fd.append("message", text);
        res = await api.post(sendUrl, fd);
      } else {
        res = await api.post(sendUrl, { message: text });
      }
      // Agar user beech mein chat badal chuka hai to galat chat mein na jaye
      if (useAppStore.getState().active?.id === chatId) appendMessage(res.data);
      setDraft("");
      setFile(null);
    } catch (err) {
      toast.error(errorMessage(err, "Message send nahi hua"));
    } finally {
      setSending(false);
    }
  };

  const q = query.trim().toLowerCase();
  const visible = q ? messages.filter((m) => m.message.toLowerCase().includes(q)) : messages;

  const title = active.title;
  const initialsSource = title;

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 w-full bg-bg relative">
      {/* Header */}
      <header className="flex items-center gap-3 px-3 sm:px-5 py-3 border-b border-line bg-surface/80 backdrop-blur shrink-0">
        <button onClick={() => setActive(null)} className="icon-btn md:hidden" aria-label="Back">
          <LuArrowLeft className="w-5 h-5" />
        </button>

        {isGroup ? (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-brand-600 to-accent shrink-0">
            <LuUsers className="w-5 h-5 text-white" />
          </div>
        ) : (
          <Avatar name={initialsSource} id={active.id} size={40} online={isOnline} />
        )}

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">{title}</h2>
          <p className="text-xs truncate">
            {isGroup ? (
              <span className="text-muted">
                {groupMeta ? `${groupMeta.memberCount} members · Admin: ${groupMeta.adminName || "—"}` : "Group chat"}
              </span>
            ) : (
              <span className={isOnline ? "text-emerald-400" : "text-dim"}>{isOnline ? "Online" : "Offline"}</span>
            )}
          </p>
        </div>

        <button
          onClick={() => setSearchOpen((v) => !v)}
          className={`icon-btn ${searchOpen ? "text-brand-400 bg-surface2" : ""}`}
          title="Chat mein search karo"
        >
          <LuSearch className="w-4 h-4" />
        </button>
        {isGroup && (
          <button onClick={() => setInfoOpen(true)} className="icon-btn" title="Group info">
            <LuInfo className="w-4 h-4" />
          </button>
        )}
      </header>

      {/* In-chat search bar */}
      {searchOpen && (
        <div className="px-3 sm:px-5 py-2 border-b border-line bg-surface shrink-0 flex items-center gap-2 animate-fade">
          <div className="relative flex-1">
            <LuSearch className="w-4 h-4 text-dim absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Is chat mein message dhoondo..."
              className="input pl-9"
            />
          </div>
          <span className="text-xs text-muted whitespace-nowrap">
            {q ? `${visible.length} mil e` : ""}
          </span>
          <button onClick={() => { setQuery(""); setSearchOpen(false); }} className="icon-btn">
            <LuX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto py-4">
        {loading ? (
          <Loading text="Messages load ho rahe hain..." />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={LuMessageSquare}
            title={q ? "Koi message nahi mila" : "Abhi koi message nahi"}
            text={q ? "Dusra keyword try karo." : "Pehla message bhejo aur baat shuru karo 👋"}
          />
        ) : (
          <>
            {visible.map((m, i) => {
              const prev = visible[i - 1];
              const mine = String(m.senderId) === myId;
              const showName = isGroup && (!prev || String(prev.senderId) !== String(m.senderId));
              return (
                <div key={m._id || i} ref={i === visible.length - 1 ? endRef : null}>
                  <MessageBubble message={m} mine={mine} showName={showName} />
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-3 sm:px-5 py-3 border-t border-line bg-surface shrink-0">
        {file && (
          <div className="flex items-center gap-2 mb-2 p-2 rounded-xl bg-surface2 border border-line animate-fade">
            <LuFileText className="w-4 h-4 text-brand-400 shrink-0" />
            <p className="text-xs flex-1 truncate">
              {file.name} <span className="text-dim">({formatSize(file.size)})</span>
            </p>
            <button type="button" onClick={() => setFile(null)} className="icon-btn !w-7 !h-7" aria-label="Remove file">
              <LuX className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept={ACCEPT_FILES} className="hidden" onChange={pickFile} />
          <button type="button" onClick={() => fileRef.current?.click()} className="icon-btn" title="File bhejo" aria-label="Attach file">
            <LuPaperclip className="w-4 h-4" />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={file ? "Caption likho (optional)..." : isGroup ? "Group mein message likho..." : "Message likho..."}
            className="input flex-1 py-3"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={(!draft.trim() && !file) || sending}
            className="btn-primary w-11 h-11 !px-0 shrink-0"
            aria-label="Send"
          >
            <LuSend className="w-4 h-4" />
          </button>
        </div>
      </form>

      {isGroup && (
        <GroupInfoPanel
          open={infoOpen}
          groupId={active.id}
          onClose={() => setInfoOpen(false)}
        />
      )}
    </div>
  );
}
