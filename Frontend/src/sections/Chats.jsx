import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { LuSearch, LuMessageSquare, LuUserPlus } from "react-icons/lu";
import api, { errorMessage } from "../lib/api";
import useAppStore from "../store/useAppStore";
import { useSocketContext } from "../context/SocketContext";
import Avatar from "../components/Avatar";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import ChatWindow from "../chat/ChatWindow";

// Chats section: sirf friends ki list, aur unke saath 1-to-1 chat
export default function Chats() {
  const active = useAppStore((s) => s.active);
  const setActive = useAppStore((s) => s.setActive);
  const setSection = useAppStore((s) => s.setSection);
  const unread = useAppStore((s) => s.unread);
  const refreshFriends = useAppStore((s) => s.refresh.friends);
  const { onlineUsers } = useSocketContext();

  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    api
      .get("/api/friend/list")
      .then((r) => alive && setFriends(r.data))
      .catch((err) => toast.error(errorMessage(err, "Friends load nahi ho paaye")))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [refreshFriends]);

  // Unread messages wale upar, phir online, phir naam ke hisaab se
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return friends
      .filter((f) => f.fullname.toLowerCase().includes(term))
      .sort((a, b) => {
        const ua = unread[`dm:${a._id}`] || 0;
        const ub = unread[`dm:${b._id}`] || 0;
        if (ua !== ub) return ub - ua;
        const oa = onlineUsers.includes(a._id) ? 1 : 0;
        const ob = onlineUsers.includes(b._id) ? 1 : 0;
        if (oa !== ob) return ob - oa;
        return a.fullname.localeCompare(b.fullname);
      });
  }, [friends, q, unread, onlineUsers]);

  const openChat = (f) =>
    setActive({ type: "dm", id: String(f._id), title: f.fullname, user: f });

  const dmActive = active?.type === "dm" ? active : null;

  return (
    <div className="flex flex-1 min-h-0">
      {/* Sidebar */}
      <aside
        className={`${dmActive ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 shrink-0 flex-col min-h-0 bg-surface border-r border-line`}
      >
        <div className="px-5 pt-5 pb-3">
          <h1 className="text-xl font-bold">Chats</h1>
          <p className="text-xs text-muted mt-0.5">Sirf friends ke saath chat hoti hai</p>
          <div className="relative mt-4">
            <LuSearch className="w-4 h-4 text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Friend dhoondo..."
              className="input pl-10"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-4">
          {loading ? (
            <Loading text="Friends load ho rahe hain..." />
          ) : list.length === 0 ? (
            <EmptyState
              icon={LuUserPlus}
              title={friends.length === 0 ? "Abhi koi friend nahi" : "Koi friend nahi mila"}
              text={
                friends.length === 0
                  ? "Pehle kisi ko friend request bhejo. Accept hone ke baad yahan chat kar sakte ho."
                  : "Dusra naam try karo."
              }
              action={
                friends.length === 0 && (
                  <button onClick={() => setSection("friends")} className="btn-primary text-xs !py-2">
                    Friends dhoondo
                  </button>
                )
              }
            />
          ) : (
            <div className="space-y-1">
              {list.map((f) => {
                const isOn = onlineUsers.includes(f._id);
                const isSelected = dmActive?.id === String(f._id);
                const count = unread[`dm:${f._id}`] || 0;
                return (
                  <button
                    key={f._id}
                    onClick={() => openChat(f)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition border ${
                      isSelected
                        ? "bg-brand-500/15 border-brand-500/30"
                        : "border-transparent hover:bg-surface2"
                    }`}
                  >
                    <Avatar name={f.fullname} id={f._id} size={42} online={isOn} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{f.fullname}</p>
                      <p className={`text-xs truncate ${isOn ? "text-emerald-400" : "text-muted"}`}>
                        {isOn ? "Online" : f.email}
                      </p>
                    </div>
                    {count > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand-500 text-[11px] font-bold text-white flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Chat area */}
      <section className={`${dmActive ? "flex" : "hidden md:flex"} flex-1 min-w-0 min-h-0`}>
        {dmActive ? (
          <ChatWindow key={`dm-${dmActive.id}`} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={LuMessageSquare}
              title="Koi chat select karo"
              text="Left side se kisi friend ko chuno aur baat shuru karo."
            />
          </div>
        )}
      </section>
    </div>
  );
}
