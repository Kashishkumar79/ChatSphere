import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import useAppStore from "../store/useAppStore";
import sound from "../assets/notification.mp3";

const playSound = () => {
  try {
    new Audio(sound).play().catch(() => {});
  } catch {
    /* ignore */
  }
};

// Socket events ko store se connect karta hai (messages, requests, groups)
export default function useRealtime() {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    const onDM = (msg) => {
      const st = useAppStore.getState();
      const senderId = String(msg.senderId);
      if (st.active?.type === "dm" && st.active.id === senderId) {
        st.appendMessage(msg);
      } else {
        st.bumpUnread(`dm:${senderId}`);
        playSound();
      }
    };

    const onGroup = ({ groupId, message }) => {
      const st = useAppStore.getState();
      const id = String(groupId);
      if (st.active?.type === "group" && st.active.id === id) {
        st.appendMessage(message);
      } else {
        st.bumpUnread(`group:${id}`);
        playSound();
      }
    };

    const onFriendUpdate = () => {
      const st = useAppStore.getState();
      st.bump("friends");
      st.bump("requests");
    };

    // Group delete ho gaya ya mujhe remove kar diya gaya
    const onGroupUpdate = (payload = {}) => {
      const st = useAppStore.getState();
      st.bump("groups");
      if ((payload.removed || payload.deleted) && st.active?.type === "group" && st.active.id === String(payload.groupId)) {
        st.setActive(null);
      }
    };

    socket.on("newMessage", onDM);
    socket.on("newGroupMessage", onGroup);
    socket.on("friendUpdate", onFriendUpdate);
    socket.on("groupUpdate", onGroupUpdate);

    return () => {
      socket.off("newMessage", onDM);
      socket.off("newGroupMessage", onGroup);
      socket.off("friendUpdate", onFriendUpdate);
      socket.off("groupUpdate", onGroupUpdate);
    };
  }, [socket]);
}
