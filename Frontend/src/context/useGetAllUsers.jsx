import React, { useEffect, useState } from "react";
import axios from "axios";

function useGetAllUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        const authUser = JSON.parse(localStorage.getItem("ChatApp"));
        const token = authUser?.token;

        const response = await axios.get(
          "https://chatsphere-qkvb.onrender.com/api/user/allusers",
          {
            withCredentials: true,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        setAllUsers(response.data);
      } catch (error) {
        console.log("Error in useGetAllUsers: " + error);
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, []);

  return [allUsers, loading];
}

export default useGetAllUsers;