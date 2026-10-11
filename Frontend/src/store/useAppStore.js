import { create } from "zustand";

// Chat ka unique key (unread count ke liye)
export const chatKey = (active) => `${active.type}:${active.id}`;

const useAppStore = create((set) => ({
  // Current section: home | chats | groups | friends | todo
  section: "home",
  setSection: (section) => set({ section }),

  // Selected chat: { type: "dm" | "group", id, title, ... }
  active: null,
  messages: [],
  setActive: (active) =>
    set((s) => ({
      active,
      messages: [],
      unread: active ? { ...s.unread, [chatKey(active)]: 0 } : s.unread,
    })),
  setMessages: (messages) => set({ messages }),
  appendMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),

  // Naye messages ke unread count
  unread: {},
  bumpUnread: (key) =>
    set((s) => ({ unread: { ...s.unread, [key]: (s.unread[key] || 0) + 1 } })),

  // Kisi list ko dobara fetch karwane ke liye version counters
  refresh: { friends: 0, requests: 0, groups: 0 },
  bump: (key) =>
    set((s) => ({ refresh: { ...s.refresh, [key]: (s.refresh[key] || 0) + 1 } })),
}));

export default useAppStore;
