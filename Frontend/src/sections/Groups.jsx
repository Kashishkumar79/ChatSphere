import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuSearch, LuPlus, LuCrown, LuUsers, LuGlobe } from "react-icons/lu";
import api, { errorMessage } from "../lib/api";
import useAppStore from "../store/useAppStore";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import ChatWindow from "../chat/ChatWindow";
import CreateGroupModal from "../groups/CreateGroupModal";

// Groups section: mere groups + discover (join request)
export default function Groups() {
  const active = useAppStore((s) => s.active);
  const setActive = useAppStore((s) => s.setActive);
  const bump = useAppStore((s) => s.bump);
  const refreshGroups = useAppStore((s) => s.refresh.groups);

  const [tab, setTab] = useState("mine");
  const [mine, setMine] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  // Mere groups
  useEffect(() => {
    let alive = true;
    api
      .get("/api/group/mine")
      .then((r) => alive && setMine(r.data))
      .catch((err) => toast.error(errorMessage(err, "Groups load nahi ho paaye")))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [refreshGroups]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  // Discover groups
  useEffect(() => {
    if (tab !== "discover") return;
    let alive = true;
    api
      .get("/api/group/discover", { params: { search: debounced } })
      .then((r) => alive && setDiscover(r.data))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [tab, debounced, refreshGroups]);

  const openGroup = (g) => setActive({ type: "group", id: String(g._id), title: g.name, group: g });

  const requestJoin = async (g) => {
    try {
      await api.post(`/api/group/${g._id}/join`);
      toast.success("Join request bhej di gayi ✅ Admin approve karega");
      bump("groups");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const cancelJoin = async (g) => {
    try {
      await api.delete(`/api/group/${g._id}/join`);
      toast.success("Request cancel ho gayi");
      bump("groups");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const groupActive = active?.type === "group" ? active : null;
  const list = tab === "mine" ? mine : discover;

  return (
    <div className="flex flex-1 min-h-0">
      <aside
        className={`${groupActive ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 shrink-0 flex-col min-h-0 bg-surface border-r border-line`}
      >
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Groups</h1>
              <p className="text-xs text-muted mt-0.5">Group banao ya join karo</p>
            </div>
            <button onClick={() => setCreateOpen(true)} className="btn-primary !py-2 !px-3 text-xs">
              <LuPlus className="w-3.5 h-3.5" /> Naya group
            </button>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface2 mt-4">
            {[
              { id: "mine", label: "Mere groups", icon: LuUsers },
              { id: "discover", label: "Discover", icon: LuGlobe },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                  tab === t.id ? "bg-brand-600 text-white shadow" : "text-muted hover:text-ink"
                }`}
              >
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
          </div>

          {tab === "discover" && (
            <div className="relative mt-3">
              <LuSearch className="w-4 h-4 text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Group dhoondo..." className="input pl-10" />
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-4">
          {tab === "mine" && loading ? (
            <Loading text="Groups load ho rahe hain..." />
          ) : list.length === 0 ? (
            <EmptyState
              icon={LuUsers}
              title={tab === "mine" ? "Abhi aap kisi group mein nahi ho" : "Koi group nahi mila"}
              text={tab === "mine" ? "Naya group banao ya Discover tab se join request bhejo." : "Dusra naam try karo ya khud group banao."}
            />
          ) : tab === "mine" ? (
            <div className="space-y-1">
              {mine.map((g) => {
                const isSelected = groupActive?.id === String(g._id);
                return (
                  <button
                    key={g._id}
                    onClick={() => openGroup(g)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition border ${
                      isSelected ? "bg-brand-500/15 border-brand-500/30" : "border-transparent hover:bg-surface2"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-brand-600 to-accent text-white font-bold shrink-0">
                      {g.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{g.name}</p>
                      <p className="text-xs text-muted truncate">
                        {g.memberCount} members · {g.isAdmin ? "Aap admin ho" : `Admin: ${g.adminName || "—"}`}
                      </p>
                    </div>
                    {g.isAdmin && <LuCrown className="w-4 h-4 text-amber-300 shrink-0" />}
                    {g.pendingCount > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-amber-400 text-[11px] font-bold text-bg flex items-center justify-center">
                        {g.pendingCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {discover.map((g) => (
                <div key={g._id} className="p-3.5 rounded-xl border border-line bg-surface2/40">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface2 border border-line text-brand-400 font-bold shrink-0">
                      {g.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{g.name}</p>
                      {g.description && <p className="text-xs text-muted line-clamp-2 mt-0.5">{g.description}</p>}
                      <p className="text-[11px] text-dim mt-1">{g.memberCount} members · Admin: {g.adminName || "—"}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    {g.hasRequested ? (
                      <button onClick={() => cancelJoin(g)} className="btn-ghost w-full !py-2 text-xs">
                        Request bheji gayi · Cancel karo
                      </button>
                    ) : (
                      <button onClick={() => requestJoin(g)} className="btn-primary w-full !py-2 text-xs">
                        Join request bhejo
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      <section className={`${groupActive ? "flex" : "hidden md:flex"} flex-1 min-w-0 min-h-0`}>
        {groupActive ? (
          <ChatWindow key={`group-${groupActive.id}`} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={LuUsers}
              title="Koi group select karo"
              text="Left side se group chuno, ya naya group banao jisme aap admin honge."
              action={
                <button onClick={() => setCreateOpen(true)} className="btn-primary text-xs !py-2">
                  <LuPlus className="w-3.5 h-3.5" /> Naya group banao
                </button>
              }
            />
          </div>
        )}
      </section>

      <CreateGroupModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
