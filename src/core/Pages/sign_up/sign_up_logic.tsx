import ApiService from "@/services/Api";
import { useState } from "react";

export const useSignUpLogic = () => {
    const [first_name, set_first_name] = useState("");
    const [last_name, set_last_name] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm_password, setConfirm_Password] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signUp = async () => {
        if (password !== confirm_password) {
            setError("Passwords do not match");
            return;
        }

        // Clear any previous errors
        setError(null);

        const res = await ApiService.post("/user/create",
            {
                "firstname": first_name,
                "lastname": last_name,
                "username": username,
                "email": email,
                "password": password,
                "password2": confirm_password

            }
        )

        console.log(res);
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signUp();
        } catch (err: any) {
            // ApiService might throw an error directly or we might catch it here
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        first_name,
        set_first_name,
        last_name,
        set_last_name,
        username,
        setUsername,
        email,
        setEmail,
        password,
        setPassword,
        confirm_password,
        setConfirm_Password,
        handleSignUp,
        isLoading,
        error
    };
};
