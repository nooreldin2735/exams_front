import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import ApiService from "@/services/Api";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Term {
    ID: number;
    Name: string;
    Year_id: number;
    User_id: number;
}

interface TermsListProps {
    yearId: string | number;
    onTermSelect?: (term: Term) => void;
    className?: string;
}

export function TermsList({ yearId, onTermSelect, className }: TermsListProps) {
    const [terms, setTerms] = useState<Term[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTerms = async () => {
            try {
                setLoading(true);
                // The API expects year_id as a param
                const data = await ApiService.get<any>(`/terms?year_id=${yearId}`);

                // Handle response structure (assuming it might be direct array or wrapped)
                if (Array.isArray(data)) {
                    setTerms(data);
                } else if (data && typeof data === 'object' && Array.isArray(data.list)) {
                    setTerms(data.list);
                } else {
                    setTerms([]);
                }
                setError(null);
            } catch (err: any) {
                setError(err.message || "Failed to load terms");
            } finally {
                setLoading(false);
            }
        };

        if (yearId) fetchTerms();
    }, [yearId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading terms...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4 border border-destructive/20 bg-destructive/5 rounded-2xl text-destructive">
                <AlertCircle className="h-10 w-10" />
                <div className="text-center">
                    <h3 className="font-semibold text-lg">Error Loading Terms</h3>
                    <p className="text-sm opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    if (terms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold">No terms found</h3>
                    <p className="text-sm text-muted-foreground italic">Try adding a new term for this year.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
            {terms.map((term, index) => (
                <motion.button
                    key={term.ID}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => {
                        if (onTermSelect) onTermSelect(term);
                        navigate(`/years/${yearId}/terms/${term.ID}`);
                    }}
                    className={cn(
                        "group relative flex items-center justify-between p-6",
                        "bg-card hover:bg-accent/50 border border-border/50 hover:border-primary/30",
                        "rounded-2xl transition-all duration-300 shadow-sm active:scale-[0.98]"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                                {term.Name}
                            </h3>
                            <p className="text-xs text-muted-foreground">ID: {term.ID}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0">
                        <ChevronRight className="h-4 w-4" />
                    </div>
                </motion.button>
            ))}
        </div>
    );
}
