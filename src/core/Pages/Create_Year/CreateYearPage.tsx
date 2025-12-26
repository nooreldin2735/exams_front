import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import ApiService from "@/services/Api";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function CreateYearPage() {
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await ApiService.post("/years/create", { name });
            setSuccess(true);
            setName("");
            // Redirect to years list after a short delay
            setTimeout(() => navigate("/years"), 1500);
        } catch (err: any) {
            console.error(err);
            // Backend returns specific messages in 400 or 500
            setError(err.message || "Failed to create year");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Create New Year</h2>
                <p className="text-muted-foreground">
                    Enter the name of the academic year you want to add to the system.
                </p>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-8 rounded-3xl border border-border bg-card/40 shadow-xl backdrop-blur-md relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Calendar className="h-24 w-24 text-primary" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative">
                    <div className="space-y-4">
                        <label htmlFor="year-name" className="text-sm font-medium text-foreground px-1">
                            Year Name
                        </label>
                        <input
                            id="year-name"
                            type="text"
                            placeholder="e.g. Year 1, 2024/2025"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={cn(
                                "w-full h-14 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-lg",
                                error && "border-destructive focus:ring-destructive/10"
                            )}
                            disabled={isLoading || success}
                            required
                        />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                        >
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p>{error}</p>
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm"
                        >
                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                            <p>Year created successfully! Redirecting...</p>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !name.trim() || success}
                        className={cn(
                            "w-full h-14 flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold text-lg transition-all",
                            "hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100",
                            success && "bg-green-500 hover:brightness-100"
                        )}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Creating...
                            </>
                        ) : success ? (
                            "Created!"
                        ) : (
                            "Create Academic Year"
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
