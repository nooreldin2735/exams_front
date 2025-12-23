import ApiService from "@/services/Api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginResponse {
  access_token?: string;
  token_type?: string;
  success?: string;
  lang?: string | null;
}

export const useLoginLogic = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async () => {
    try {
      setError(null);
      // ApiService.post returns the data directly (T)
      const res = await ApiService.post<LoginResponse>("/login",
        {
          "username": username,
          "password": password
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );

      console.log(res);

      if (res && (res.access_token || res.success)) {
        // Backend might not return a token, so we create a session marker if needed.
        const token = res.access_token || "session_active";
        localStorage.setItem("auth_token", token);
        navigate("/");
      } else {
        setError("Login failed: Unexpected response from server");
      }
    } catch (err: any) {
      console.error(err);
      setError("Assignments Failed");
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login();
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
