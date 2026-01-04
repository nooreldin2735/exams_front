import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Book, Loader2, AlertCircle, CheckCircle2, GraduationCap, Calendar } from "lucide-react";
import ApiService from "@/services/Api";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNavigation } from "@/context/NavigationContext";

interface Year {
    ID: number;
    Name: string;
}

interface Term {
    ID: number;
    Name: string;
    Year_id: number;
}

export default function CreateSubjectPage() {
    const [searchParams] = useSearchParams();
    const initialYearId = searchParams.get("year_id") || "";
    const initialTermId = searchParams.get("term_id") || "";

    const [name, setName] = useState("");
    const [yearId, setYearId] = useState(initialYearId);
    const [termId, setTermId] = useState(initialTermId);
    const [years, setYears] = useState<Year[]>([]);
    const [terms, setTerms] = useState<Term[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const { setYear, setTerm, setCurrentPathTitle } = useNavigation();

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const data = await ApiService.get<any>("/years");
                if (Array.isArray(data)) setYears(data);
                else if (data?.list) setYears(data.list);
            } catch (err) {
                console.error("Failed to fetch years:", err);
            }
        };
        fetchYears();
    }, []);

    useEffect(() => {
        const updateBreadcrumbs = async () => {
            setCurrentPathTitle("Create Subject");
            if (initialYearId) {
                try {
                    const years = await ApiService.get<any[]>("/years");
                    const list = Array.isArray(years) ? years : (years as any).list;
                    const found = list.find((y: any) => y.ID.toString() === initialYearId);
                    if (found) setYear({ id: found.ID, name: found.Name });
                    else setYear({ id: initialYearId, name: `Year ${initialYearId}` });
                } catch (e) { console.error(e); }
            }
            if (initialYearId && initialTermId) {
                try {
                    const terms = await ApiService.get<any[]>(`/terms?year_id=${initialYearId}`);
                    const list = Array.isArray(terms) ? terms : (terms as any).list;
                    const found = list.find((t: any) => t.ID.toString() === initialTermId);
                    if (found) setTerm({ id: found.ID, name: found.Name });
                    else setTerm({ id: initialTermId, name: `Term ${initialTermId}` });
                } catch (e) { console.error(e); }
            }
        };
        updateBreadcrumbs();
    }, [initialYearId, initialTermId]);

    useEffect(() => {
        const fetchTerms = async () => {
            if (!yearId) {
                setTerms([]);
                return;
            }
            try {
                const data = await ApiService.get<any>(`/terms?year_id=${yearId}`);
                if (Array.isArray(data)) setTerms(data);
                else if (data?.list) setTerms(data.list);
            } catch (err) {
                console.error("Failed to fetch terms:", err);
            }
        };
        fetchTerms();
    }, [yearId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !yearId || !termId) return;

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await ApiService.post("/subjects/create", {
                name,
                year_id: parseInt(yearId),
                term_id: parseInt(termId)
            });
            setSuccess(true);
            setName("");
            setTimeout(() => navigate(`/years/${yearId}/terms/${termId}`), 1500);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to create subject");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Create New Subject</h2>
                <p className="text-muted-foreground">
                    Enter the subject details and assign it to a term.
                </p>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-8 rounded-3xl border border-border bg-card/40 shadow-xl backdrop-blur-md relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Book className="h-24 w-24 text-primary" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label htmlFor="year-select" className="text-sm font-medium text-foreground px-1 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                Academic Year
                            </label>
                            <select
                                id="year-select"
                                value={yearId}
                                onChange={(e) => {
                                    setYearId(e.target.value);
                                    setTermId("");
                                }}
                                className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none"
                                disabled={isLoading || success || !!initialYearId}
                                required
                            >
                                <option value="">Select Year</option>
                                {years.map(y => (
                                    <option key={y.ID} value={y.ID}>{y.Name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label htmlFor="term-select" className="text-sm font-medium text-foreground px-1 flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-primary" />
                                Term
                            </label>
                            <select
                                id="term-select"
                                value={termId}
                                onChange={(e) => setTermId(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none"
                                disabled={isLoading || success || !yearId || !!initialTermId}
                                required
                            >
                                <option value="">Select Term</option>
                                {terms.map(t => (
                                    <option key={t.ID} value={t.ID}>{t.Name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="subject-name" className="text-sm font-medium text-foreground px-1">
                            Subject Name
                        </label>
                        <input
                            id="subject-name"
                            type="text"
                            placeholder="e.g. Mathematics, Advanced OOP"
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
                            <p>Subject created successfully! Redirecting...</p>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !name.trim() || !yearId || !termId || success}
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
                            "Create Subject"
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
