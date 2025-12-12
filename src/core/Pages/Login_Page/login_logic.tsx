import ApiService from "@/services/Api";
import { useState } from "react";

export const useLoginLogic = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async () => {
    const res = await ApiService.post("/login",
      {
        "username": username, // Use state variable
        "password": password // Use state variable
      }
    )

    console.log(res);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // LOGIC TO BE IMPLEMENTED BY USER
    // suppressing unused vars for build
    setIsLoading(true);
    await login(); // await the login call
    setIsLoading(false);
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    handleLogin,
    isLoading,
    error
  };
};
