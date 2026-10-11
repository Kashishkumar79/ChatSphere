import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuLayoutDashboard, LuMessageSquare, LuUsers, LuUserPlus, LuListTodo, LuLogOut } from "react-icons/lu";
import api from "../lib/api";
import useAppStore from "../store/useAppStore";
import { useAuth } from "../context/AuthProvider";
import Avatar from "../components/Avatar";

export const NAV_ITEMS = [
  { id: "home", label: "Home", icon: LuLayoutDashboard },
  { id: "chats", label: "Chats", icon: LuMessageSquare },
  { id: "groups", label: "Groups", icon: LuUsers },
  { id: "friends", label: "Friends", icon: LuUserPlus },
  { id: "todo", label: "Tasks", icon: LuListTodo },
];

export default function NavRail() {
  const section = useAppStore((s) => s.section);
  const setSection = useAppStore((s) => s.setSection);
  const unread = useAppStore((s) => s.unread);
  const refreshRequests = useAppStore((s) => s.refresh.requests);
  const [authUser, setAuthUser] = useAuth();
  const [incoming, setIncoming] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  const unreadTotal = Object.entries(unread).reduce((sum, [k, v]) => (k.startsWith("dm:") ? sum + v : sum), 0);

  useEffect(() => {
    api.get("/api/friend/requests")
      .then((r) => setIncoming(r.data.incoming.length))
      .catch(() => {});
  }, [refreshRequests]);

  const badgeFor = (id) => {
    if (id === "chats" && unreadTotal) return unreadTotal;
    if (id === "friends" && incoming) return incoming;
    return 0;
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post("/api/user/logout");
    } catch {
      /* logout server par fail bhi ho to local logout karo */
    }
    setAuthUser(undefined);
    toast.success("Logged out");
    setLoggingOut(false);
  };

  return (
    <nav className="shrink-0 bg-surface border-t md:border-t-0 md:border-r border-line
                    flex md:flex-col items-center justify-between
                    px-2 py-2 md:px-0 md:py-4 md:w-[76px] z-20">
      {/* Logo (desktop only) */}
      <div className="hidden md:flex w-11 h-11 rounded-2xl items-center justify-center bg-gradient-to-br from-brand-600 to-accent shadow-lg shadow-brand-600/30">
        <span className="font-display font-bold text-white text-lg">C</span>
      </div>

      {/* Section links */}
      <div className="flex md:flex-col gap-1 md:gap-2 flex-1 md:mt-6 justify-around md:justify-start w-full md:w-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = section === item.id;
          const badge = badgeFor(item.id);
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`relative flex flex-col md:flex-row items-center justify-center gap-1 rounded-xl transition
                          px-2 py-1.5 md:px-0 md:py-0 md:w-12 md:h-12 md:mx-auto
                          ${active ? "text-white" : "text-muted hover:text-ink hover:bg-surface2"}`}
              title={item.label}
            >
              <span className={`w-10 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition
                                ${active ? "bg-brand-600 shadow-lg shadow-brand-600/30" : ""}`}>
                <Icon className="w-5 h-5" />
              </span>
              <span className="text-[10px] md:hidden font-medium">{item.label}</span>
              {badge > 0 && (
                <span className="absolute top-0 right-1 md:right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User + logout */}
      <div className="flex md:flex-col items-center gap-2 md:gap-3">
        <div className="hidden md:block" title={authUser?.user?.fullname}>
          <Avatar name={authUser?.user?.fullname} id={authUser?.user?._id} size={38} />
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title="Logout"
          className="icon-btn text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-300"
        >
          <LuLogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
