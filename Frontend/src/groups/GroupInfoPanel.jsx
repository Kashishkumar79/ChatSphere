import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuX, LuCrown, LuUserMinus, LuUserPlus, LuCheck, LuTrash2, LuLogOut, LuLoader } from "react-icons/lu";
import api, { errorMessage } from "../lib/api";
import useAppStore from "../store/useAppStore";
import { useAuth } from "../context/AuthProvider";
import Avatar from "../components/Avatar";

// Group info + admin tools (join requests, members, delete/leave)
export default function GroupInfoPanel({ open, groupId, onClose }) {
  const [authUser] = useAuth();
  const myId = String(authUser?.user?._id);
  const setActive = useAppStore((s) => s.setActive);
  const bump = useAppStore((s) => s.bump);
  const refreshGroups = useAppStore((s) => s.refresh.groups);
  const [group, setGroup] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [friends, setFriends] = useState([]);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/group/${groupId}`);
      setGroup(res.data);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }, [groupId]);

  useEffect(() => {
    if (open) load();
  }, [open, load, refreshGroups]);

  // Admin ke friends list (add member ke liye)
  useEffect(() => {
    if (open && showAdd) {
      api.get("/api/friend/list").then((r) => setFriends(r.data)).catch(() => {});
    }
  }, [open, showAdd, refreshGroups]);

  if (!open) return null;

  // Ek action chalao, phir details refresh karo
  const run = async (fn, successMsg) => {
    setBusy(true);
    try {
      await fn();
      if (successMsg) toast.success(successMsg);
      bump("groups");
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const approve = (uid) =>
    run(() => api.post(`/api/group/${groupId}/requests/${uid}/approve`), "Member add ho gaya ✅");
  const reject = (uid) =>
    run(() => api.post(`/api/group/${groupId}/requests/${uid}/reject`), "Request reject ho gayi");
  const addMember = (uid, name) =>
    run(() => api.post(`/api/group/${groupId}/members/${uid}`), `${name} ko group mein add kar diya ✅`);
  const removeMember = (uid, name) => {
    if (!window.confirm(`${name} ko group se remove karna hai?`)) return;
    run(() => api.delete(`/api/group/${groupId}/members/${uid}`), "Member remove ho gaya");
  };

  const leaveOrDelete = async () => {
    const isAdmin = group?.isAdmin;
    const msg = isAdmin
      ? "Group delete karna hai? Saare messages bhi delete ho jayenge."
      : "Kya aap is group ko chhodna chahte ho?";
    if (!window.confirm(msg)) return;
    setBusy(true);
    try {
      if (isAdmin) await api.delete(`/api/group/${groupId}`);
      else await api.post(`/api/group/${groupId}/leave`);
      toast.success(isAdmin ? "Group delete ho gaya" : "Group chhod diya");
      setActive(null);
      bump("groups");
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-[2px] animate-fade" onClick={onClose}>
      <aside
        className="w-full sm:w-96 h-full bg-surface border-l border-line flex flex-col animate-pop shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="font-semibold">Group info</h3>
          <button onClick={onClose} className="icon-btn"><LuX className="w-4 h-4" /></button>
        </div>

        {!group ? (
          <div className="flex-1 flex items-center justify-center"><LuLoader className="w-5 h-5 animate-spin text-brand-400" /></div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Basic */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-gradient-to-br from-brand-600 to-accent text-white text-xl font-bold">
                {group.name?.[0]?.toUpperCase()}
              </div>
              <h4 className="text-lg font-semibold mt-3">{group.name}</h4>
              {group.description && <p className="text-sm text-muted mt-1">{group.description}</p>}
              <div className="flex justify-center gap-2 mt-3">
                <span className="chip border-line bg-surface2 text-muted">{group.memberCount} members</span>
                {group.isAdmin ? (
                  <span className="chip border-amber-400/30 bg-amber-400/10 text-amber-300"><LuCrown className="w-3 h-3" /> Aap Admin ho</span>
                ) : (
                  <span className="chip border-line bg-surface2 text-muted">Admin: {group.adminName}</span>
                )}
              </div>
            </div>

            {/* Join requests (admin only) */}
            {group.isAdmin && (
              <section className="space-y-2">
                <p className="section-title">Join requests ({group.joinRequests.length})</p>
                {group.joinRequests.length === 0 ? (
                  <p className="text-xs text-dim px-1">Koi pending request nahi hai.</p>
                ) : (
                  group.joinRequests.map((r) => (
                    <div key={r.user._id} className="flex items-center gap-3 p-3 rounded-xl bg-surface2/60 border border-line">
                      <Avatar name={r.user.fullname} id={r.user._id} size={34} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.user.fullname}</p>
                        <p className="text-[11px] text-dim truncate">{r.user.email}</p>
                      </div>
                      <button disabled={busy} onClick={() => approve(r.user._id)} className="btn-success !px-2.5 !py-1.5 text-xs">
                        <LuCheck className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button disabled={busy} onClick={() => reject(r.user._id)} className="btn-danger !px-2.5 !py-1.5 text-xs">
                        Reject
                      </button>
                    </div>
                  ))
                )}
              </section>
            )}

            {/* Members */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="section-title">Members ({group.members.length})</p>
                {group.isAdmin && (
                  <button onClick={() => setShowAdd((v) => !v)} className="text-xs text-brand-400 hover:underline flex items-center gap-1">
                    <LuUserPlus className="w-3.5 h-3.5" /> {showAdd ? "Band karo" : "Member add karo"}
                  </button>
                )}
              </div>

              {group.isAdmin && showAdd && (() => {
                const memberIds = new Set(group.members.map((m) => String(m._id)));
                const candidates = friends.filter((f) => !memberIds.has(String(f._id)));
                if (friends.length === 0) {
                  return <p className="text-xs text-dim px-1">Aapke abhi koi friend nahi hain. Pehle Friends section mein friends banao.</p>;
                }
                if (candidates.length === 0) {
                  return <p className="text-xs text-dim px-1">Aapke sab friends pehle se group mein hain.</p>;
                }
                return (
                  <div className="space-y-2 p-3 rounded-xl bg-surface2/50 border border-line">
                    <p className="text-[11px] text-muted">Apne friends mein se chuno:</p>
                    {candidates.map((f) => (
                      <div key={f._id} className="flex items-center gap-3">
                        <Avatar name={f.fullname} id={f._id} size={30} />
                        <p className="flex-1 text-sm truncate">{f.fullname}</p>
                        <button disabled={busy} onClick={() => addMember(f._id, f.fullname)} className="btn-success !px-2.5 !py-1.5 text-xs">
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
              {group.members.map((m) => {
                const isAdminMember = String(m._id) === group.adminId;
                const isMe = String(m._id) === myId;
                return (
                  <div key={m._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface2/60">
                    <Avatar name={m.fullname} id={m._id} size={34} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {m.fullname} {isMe && <span className="text-dim text-xs">(aap)</span>}
                      </p>
                      <p className="text-[11px] text-dim truncate">{m.email}</p>
                    </div>
                    {isAdminMember ? (
                      <span className="chip border-amber-400/30 bg-amber-400/10 text-amber-300"><LuCrown className="w-3 h-3" /> Admin</span>
                    ) : (
                      group.isAdmin && (
                        <button disabled={busy} onClick={() => removeMember(m._id, m.fullname)} className="icon-btn text-rose-400 hover:text-rose-300" title="Remove">
                          <LuUserMinus className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </section>
          </div>
        )}

        {/* Footer action */}
        {group && (
          <div className="p-5 border-t border-line">
            <button onClick={leaveOrDelete} disabled={busy} className="btn-danger w-full">
              {group.isAdmin ? <><LuTrash2 className="w-4 h-4" /> Group delete karo</> : <><LuLogOut className="w-4 h-4" /> Group chhodo</>}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
