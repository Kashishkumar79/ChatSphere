import React, { useEffect, useState } from "react";
import { LuUsers, LuUserPlus, LuListTodo, LuMessageSquare, LuPlus, LuSearch, LuCalendar } from "react-icons/lu";
import api from "../lib/api";
import useAppStore from "../store/useAppStore";
import { useAuth } from "../context/AuthProvider";
import CreateGroupModal from "../groups/CreateGroupModal";
import { PRIORITY, dueInfo } from "./Todo";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

// Home: ek jagah saari zaroori cheezein
export default function Dashboard() {
  const [authUser] = useAuth();
  const setSection = useAppStore((s) => s.setSection);
  const refresh = useAppStore((s) => s.refresh);
  const [stats, setStats] = useState({ friends: 0, groups: 0, requests: 0, openTasks: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);

  const firstName = authUser?.user?.fullname?.split(" ")[0] || "there";

  useEffect(() => {
    let alive = true;
    Promise.allSettled([
      api.get("/api/friend/list"),
      api.get("/api/group/mine"),
      api.get("/api/friend/requests"),
      api.get("/api/todo"),
    ]).then(([friends, groups, requests, todos]) => {
      if (!alive) return;
      const open = todos.status === "fulfilled" ? todos.value.data.filter((t) => !t.done) : [];
      setStats({
        friends: friends.status === "fulfilled" ? friends.value.data.length : 0,
        groups: groups.status === "fulfilled" ? groups.value.data.length : 0,
        requests: requests.status === "fulfilled" ? requests.value.data.incoming.length : 0,
        openTasks: open.length,
      });
      setUpcoming(
        [...open]
          .sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
          })
          .slice(0, 5)
      );
    });
    return () => { alive = false; };
  }, [refresh]);

  const cards = [
    { label: "Friends", value: stats.friends, icon: LuUsers, go: "friends", tone: "from-blue-500/20" },
    { label: "Groups", value: stats.groups, icon: LuUsers, go: "groups", tone: "from-cyan-500/20" },
    { label: "Pending requests", value: stats.requests, icon: LuUserPlus, go: "friends", tone: "from-violet-500/20" },
    { label: "Open tasks", value: stats.openTasks, icon: LuListTodo, go: "todo", tone: "from-emerald-500/20" },
  ];

  const actions = [
    { label: "Chat shuru karo", icon: LuMessageSquare, onClick: () => setSection("chats") },
    { label: "Group banao", icon: LuPlus, onClick: () => setCreateOpen(true) },
    { label: "Task add karo", icon: LuListTodo, onClick: () => setSection("todo") },
    { label: "Log dhoondo", icon: LuSearch, onClick: () => setSection("friends") },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-5 sm:p-8 space-y-8 animate-fade">
        {/* Greeting */}
        <div>
          <p className="text-sm text-muted">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-3xl font-bold mt-1">
            {greeting()}, <span className="gradient-text">{firstName}</span> 👋
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((c) => (
            <button
              key={c.label}
              onClick={() => setSection(c.go)}
              className={`card !p-5 text-left bg-gradient-to-br ${c.tone} to-surface hover:border-brand-500/40 transition group`}
            >
              <c.icon className="w-5 h-5 text-brand-400 mb-4 group-hover:scale-110 transition" />
              <p className="text-3xl font-bold">{c.value}</p>
              <p className="text-xs text-muted mt-1">{c.label}</p>
            </button>
          ))}
        </div>

        {/* Quick actions */}
        <section className="space-y-3">
          <p className="section-title">Quick actions</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {actions.map((a) => (
              <button key={a.label} onClick={a.onClick} className="btn-ghost !justify-start !py-3.5">
                <a.icon className="w-4 h-4 text-brand-400" />
                {a.label}
              </button>
            ))}
          </div>
        </section>

        {/* Upcoming tasks */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="section-title">Aage ke kaam</p>
            <button onClick={() => setSection("todo")} className="text-xs text-brand-400 hover:underline">Sab dekho →</button>
          </div>
          <div className="card !p-2">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">Koi pending task nahi. Mast! ✨</p>
            ) : (
              upcoming.map((t) => {
                const due = dueInfo(t);
                const pr = PRIORITY[t.priority] || PRIORITY.medium;
                return (
                  <div key={t._id} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface2/60">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${t.priority === "high" ? "bg-rose-400" : t.priority === "medium" ? "bg-amber-300" : "bg-emerald-400"}`} />
                    <p className="flex-1 text-sm truncate">{t.title}</p>
                    {due && (
                      <span className={`text-[11px] font-medium flex items-center gap-1 ${due.cls}`}>
                        <LuCalendar className="w-3 h-3" /> {due.label}
                      </span>
                    )}
                    <span className={`chip hidden sm:inline-flex ${pr.cls}`}>{pr.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <CreateGroupModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
