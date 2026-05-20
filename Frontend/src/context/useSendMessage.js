import React, { useState } from "react";
import useConversation from "../statemanage/useConversation.js";
import axios from "axios";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessage, selectedConversation } = useConversation();

  const sendMessages = async (message) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `https://chatsphere-qkvb.onrender.com/api/message/send/${selectedConversation._id}`,
        { message },
        { withCredentials: true }
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
