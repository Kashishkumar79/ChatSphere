import React from "react";
import useConversation from "../../statemanage/useConversation.js";
import { useSocketContext } from "../../context/SocketContext.jsx";

function Chatuser() {
  const { selectedConversation } = useConversation();
  const { onlineUsers } = useSocketContext();

  const getOnlineUsersStatus = (userId) => {
    return onlineUsers.includes(userId) ? "Online" : "Offline";
  };

  return (
    <div className="pl-5 pt-5 h-[12vh] flex space-x-4 bg-gray-700 hover:bg-gray-600 duration-300">
      
      {/* Avatar */}
      <div>
        <div
          className={`avatar ${
            onlineUsers.includes(selectedConversation?._id)
              ? "online"
              : "offline"
          }`}
        >
          <div className="w-14 rounded-full">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="user"
            />
          </div>
        </div>
      </div>

      {/* User Info */}
      <div>
        <h1 className="text-xl font-semibold">
          {selectedConversation?.fullname}
        </h1>

        <span className="text-sm text-gray-300">
          {getOnlineUsersStatus(selectedConversation?._id)}
        </span>
      </div>
    </div>
  );
}

export default Chatuser;