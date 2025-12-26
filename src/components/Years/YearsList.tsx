import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import ApiService from "@/services/Api";
import { cn } from "@/lib/utils";

interface Year {
    ID: number;
    Name: string;
    User_id: number;
}

interface YearsListProps {
    onYearSelect?: (year: Year) => void;
    className?: string;
}

export function YearsList({ onYearSelect, className }: YearsListProps) {
    const [years, setYears] = useState<Year[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchYears = async () => {
            try {
                setLoading(true);
                const data = await ApiService.get<any>("/years");
                console.log("Years Data received:", data);

                // Handle different response structures: [item, item] or { list: [item, item] }
                if (Array.isArray(data)) {
                    setYears(data);
                } else if (data && typeof data === 'object' && Array.isArray(data.list)) {
                    setYears(data.list);
                } else {
                    console.warn("Unexpected data structure for years:", data);
                    setYears([]);
                }
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load years");
            } finally {
                setLoading(false);
            }
        };

        fetchYears();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading academic years...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4 border border-destructive/20 bg-destructive/5 rounded-2xl text-destructive">
                <AlertCircle className="h-10 w-10" />
                <div className="text-center">
                    <h3 className="font-semibold text-lg">Error Loading Years</h3>
                    <p className="text-sm opacity-80">{error}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm font-medium"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
            {years.map((year, index) => (
                <motion.button
                    key={year.ID}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => onYearSelect?.(year)}
                    className={cn(
                        "group relative flex items-center justify-between p-6",
                        "bg-card hover:bg-accent/50 border border-border/50 hover:border-primary/30",
                        "rounded-2xl transition-all duration-300",
                        "hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                {year.Name}
                            </h3>
                            <p className="text-xs text-muted-foreground">Academic Year {year.ID}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0">
                        <ChevronRight className="h-4 w-4" />
                    </div>

                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
                        <div className="w-16 h-16 -mr-8 -mt-8 rounded-full bg-primary blur-2xl" />
                    </div>
                </motion.button>
            ))}
        </div>
    );
}
