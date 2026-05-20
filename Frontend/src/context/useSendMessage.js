import React, { useState } from "react";
import useConversation from "../statemanage/useConversation.js";
import axios from "axios";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessage, selectedConversation } = useConversation();

  const sendMessages = async (message) => {
    setLoading(true);
    try {
      const authUser = JSON.parse(localStorage.getItem("ChatApp"));
      const token = authUser?.token;

      const res = await axios.post(
        `https://chatsphere-qkvb.onrender.com/api/message/send/${selectedConversation._id}`,
        { message },
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      setMessage([...messages, res.data]);
    } catch (error) {
      console.log("Error in send messages", error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, sendMessages };
};

export default useSendMessage;