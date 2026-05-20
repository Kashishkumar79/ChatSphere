import React, { useEffect, useState } from "react";
import useConversation from "../statemanage/useConversation.js";
import axios from "axios";

const useGetMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessage, selectedConversation } = useConversation();

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      if (selectedConversation && selectedConversation._id) {
        try {
          const authUser = JSON.parse(localStorage.getItem("ChatApp"));
          const token = authUser?.token;

          const res = await axios.get(
            `https://chatsphere-qkvb.onrender.com/api/message/get/${selectedConversation._id}`,
            {
              withCredentials: true,
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
          );
          setMessage(res.data);
        } catch (error) {
          console.log("Error in getting messages", error);
        } finally {
          setLoading(false);
        }
      }
    };
    getMessages();
  }, [selectedConversation, setMessage]);

  return { loading, messages };
};

export default useGetMessage;