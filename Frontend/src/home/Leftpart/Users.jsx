import React from "react";
import User from "./User";
import useGetAllUsers from "../../context/useGetAllUsers";

function Users() {
  const [allUsers, loading] = useGetAllUsers();

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
            <div className="skeleton w-11 h-11 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-2.5 w-32 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (allUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2">
        <svg className="w-10 h-10 opacity-30" style={{ color: "var(--text-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>No contacts found</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <p className="px-5 pb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        Contacts ({allUsers.length})
      </p>
      {allUsers.map((user, index) => (
        <User key={user._id || index} user={user} />
      ))}
    </div>
  );
}

export default Users;
