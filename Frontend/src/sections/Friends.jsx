import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuSearch, LuUserCheck, LuUserX, LuMessageSquare, LuUserPlus, LuUserMinus } from "react-icons/lu";
import api, { errorMessage } from "../lib/api";
import useAppStore from "../store/useAppStore";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";

const TABS = [
  { id: "friends", label: "Mere friends" },
  { id: "requests", label: "Requests" },
  { id: "find", label: "Log dhoondo" },
];

export default function Friends() {
  const [tab, setTab] = useState("friends");
  const bump = useAppStore((s) => s.bump);
  const setActive = useAppStore((s) => s.setActive);
  const setSection = useAppStore((s) => s.setSection);
  const refreshFriends = useAppStore((s) => s.refresh.friends);
  const refreshRequests = useAppStore((s) => s.refresh.requests);

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [people, setPeople] = useState([]);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loadingFriends, setLoadingFriends] = useState(true);

  useEffect(() => {
    let alive = true;
    api.get("/api/friend/list").then((r) => alive && setFriends(r.data)).catch(() => {}).finally(() => alive && setLoadingFriends(false));
    return () => { alive = false; };
  }, [refreshFriends]);

  useEffect(() => {
    let alive = true;
    api.get("/api/friend/requests").then((r) => alive && setRequests(r.data)).catch(() => {});
    return () => { alive = false; };
  }, [refreshRequests, refreshFriends]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (tab !== "find") return;
    let alive = true;
    api
      .get("/api/friend/people", { params: { search: debounced } })
      .then((r) => alive && setPeople(r.data))
      .catch(() => {});
    return () => { alive = false; };
  }, [tab, debounced, refreshFriends, refreshRequests]);

  // Ek action chalao, phir sab refresh karo
  const run = async (fn, msg) => {
    try {
      await fn();
      if (msg) toast.success(msg);
      bump("friends");
      bump("requests");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const sendRequest = (id) => run(() => api.post(`/api/friend/request/${id}`), "Friend request bhej di ✅");
  const acceptRequest = (requestId) => run(() => api.post(`/api/friend/request/${requestId}/accept`), "Friend add ho gaya 🎉");
  const removeRequest = (requestId, msg) => run(() => api.delete(`/api/friend/request/${requestId}`), msg);
  const unfriend = (f) => {
    if (!window.confirm(`${f.fullname} ko friends se hatana hai? Ab aap chat nahi kar paoge.`)) return;
    run(() => api.delete(`/api/friend/${f._id}`), "Friend remove ho gaya");
  };

  const chatWith = (f) => {
    setActive({ type: "dm", id: String(f._id), title: f.fullname, user: f });
    setSection("chats");
  };

  const incomingCount = requests.incoming.length;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-5 sm:p-8 space-y-6 animate-fade">
        <div>
          <h1 className="text-2xl font-bold">Friends</h1>
          <p className="text-sm text-muted mt-1">Friend bano, tab hi unke saath chat kar paoge.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const count = t.id === "friends" ? friends.length : t.id === "requests" ? incomingCount : null;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap border transition flex items-center gap-2 ${
                  tab === t.id
                    ? "bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-600/20"
                    : "bg-surface border-line text-muted hover:text-ink"
                }`}
              >
                {t.label}
                {count > 0 && t.id === "requests" && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] flex items-center justify-center">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* My friends */}
        {tab === "friends" && (
          loadingFriends ? <Loading text="Friends load ho rahe hain..." /> :
          friends.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={LuUserPlus}
                title="Abhi koi friend nahi hai"
                text="'Log dhoondo' tab mein jaake kisi ko friend request bhejo."
                action={<button onClick={() => setTab("find")} className="btn-primary text-xs !py-2">Log dhoondo</button>}
              />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {friends.map((f) => (
                <PersonCard key={f._id} person={f}>
                  <button onClick={() => chatWith(f)} className="btn-primary flex-1 !py-2 text-xs">
                    <LuMessageSquare className="w-3.5 h-3.5" /> Chat
                  </button>
                  <button onClick={() => unfriend(f)} className="btn-danger !py-2 text-xs" title="Friend hatao">
                    <LuUserMinus className="w-3.5 h-3.5" />
                  </button>
                </PersonCard>
              ))}
            </div>
          )
        )}

        {/* Requests */}
        {tab === "requests" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="section-title">Aapko aayi requests ({requests.incoming.length})</p>
              {requests.incoming.length === 0 && <p className="text-sm text-dim px-1">Koi nayi request nahi.</p>}
              {requests.incoming.map((r) => (
                <PersonCard key={r._id} person={r.user}>
                  <button onClick={() => acceptRequest(r._id)} className="btn-success flex-1 !py-2 text-xs">
                    <LuUserCheck className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button onClick={() => removeRequest(r._id, "Request decline ho gayi")} className="btn-danger flex-1 !py-2 text-xs">
                    <LuUserX className="w-3.5 h-3.5" /> Decline
                  </button>
                </PersonCard>
              ))}
            </div>
            <div className="space-y-3">
              <p className="section-title">Aapki bheji hui requests ({requests.outgoing.length})</p>
              {requests.outgoing.length === 0 && <p className="text-sm text-dim px-1">Koi pending request nahi.</p>}
              {requests.outgoing.map((r) => (
                <PersonCard key={r._id} person={r.user} subtitle="Pending...">
                  <button onClick={() => removeRequest(r._id, "Request cancel ho gayi")} className="btn-ghost flex-1 !py-2 text-xs">
                    Cancel request
                  </button>
                </PersonCard>
              ))}
            </div>
          </div>
        )}

        {/* Find people */}
        {tab === "find" && (
          <div className="space-y-4">
            <div className="relative">
              <LuSearch className="w-4 h-4 text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Naam se dhoondo..." className="input pl-10 py-3" />
            </div>
            {people.length === 0 ? (
              <div className="card"><EmptyState title="Koi user nahi mila" text="Dusra naam try karo." /></div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {people.map((p) => (
                  <PersonCard key={p._id} person={p} subtitle={p.email}>
                    {p.relation === "none" && (
                      <button onClick={() => sendRequest(p._id)} className="btn-primary flex-1 !py-2 text-xs">
                        <LuUserPlus className="w-3.5 h-3.5" /> Friend request bhejo
                      </button>
                    )}
                    {p.relation === "request_sent" && (
                      <button onClick={() => removeRequest(p.requestId, "Request cancel ho gayi")} className="btn-ghost flex-1 !py-2 text-xs">
                        Request sent · Cancel
                      </button>
                    )}
                    {p.relation === "request_received" && (
                      <>
                        <button onClick={() => acceptRequest(p.requestId)} className="btn-success flex-1 !py-2 text-xs">Accept</button>
                        <button onClick={() => removeRequest(p.requestId, "Request decline ho gayi")} className="btn-danger flex-1 !py-2 text-xs">Decline</button>
                      </>
                    )}
                    {p.relation === "friend" && (
                      <button onClick={() => chatWith(p)} className="btn-ghost flex-1 !py-2 text-xs">
                        <LuMessageSquare className="w-3.5 h-3.5" /> Chat karo
                      </button>
                    )}
                  </PersonCard>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PersonCard({ person, subtitle, children }) {
  return (
    <div className="card !p-4 flex flex-col gap-4 hover:border-brand-500/30 transition">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={person.fullname} id={person._id} size={44} />
        <div className="min-w-0">
          <p className="font-semibold truncate">{person.fullname}</p>
          <p className="text-xs text-muted truncate">{subtitle ?? person.email}</p>
        </div>
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}
