import React from "react";
import useAppStore from "../store/useAppStore";
import useRealtime from "../hooks/useRealtime";
import NavRail from "./NavRail";
import Dashboard from "../sections/Dashboard";
import Chats from "../sections/Chats";
import Groups from "../sections/Groups";
import Friends from "../sections/Friends";
import Todo from "../sections/Todo";

export default function AppShell() {
  const section = useAppStore((s) => s.section);
  useRealtime();

  return (
    <div className="h-full w-full flex flex-col-reverse md:flex-row overflow-hidden bg-bg">
      <NavRail />
      <main className="flex-1 min-w-0 min-h-0 flex flex-col">
        {section === "home" && <Dashboard />}
        {section === "chats" && <Chats />}
        {section === "groups" && <Groups />}
        {section === "friends" && <Friends />}
        {section === "todo" && <Todo />}
      </main>
    </div>
  );
}
