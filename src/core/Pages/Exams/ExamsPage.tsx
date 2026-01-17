import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Plus,
    Loader2,
    AlertCircle,
    FileStack,
    Calendar,
    Clock,
    ChevronRight,
    TableProperties,
    Search
} from "lucide-react";
import ApiService from "@/services/Api";
import { useNavigation } from "@/context/NavigationContext";
import type { ExamSummary } from "@/types/question";
import { motion, AnimatePresence } from "framer-motion";

export default function ExamsPage() {
    const { yearId, termId, subjectId } = useParams<{ yearId: string; termId: string; subjectId: string }>();
    const navigate = useNavigate();
    const { setCurrentPathTitle, setSubject } = useNavigation();

    const [exams, setExams] = useState<ExamSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchExams = async () => {
            try {
                setLoading(true);
                setCurrentPathTitle("Subject Exams");

                // Fetch context for breadcrumbs if not already set
                if (subjectId) {
                    const subjects = await ApiService.get<any>(`/subjects?term_id=${termId}`);
                    const sList = Array.isArray(subjects) ? subjects : subjects.list || [];
                    const found = sList.find((s: any) => s.ID.toString() === subjectId);
                    if (found) setSubject({ id: found.ID, name: found.Name });
                }

                // API Doc says GET /api/v0/exams returns { list: ExamSummary[] }
                const data = await ApiService.get<{ list: ExamSummary[] }>("/exams");

                // Filter by Subject_id on frontend as per API structure
                const filtered = (data.list || [])
                    .filter(exam => exam.Subject_id.toString() === subjectId)
                    .sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());

                setExams(filtered);
                setError(null);
            } catch (err: any) {
                setError(err.message || "Failed to load exams");
            } finally {
                setLoading(false);
            }
        };

        if (subjectId) fetchExams();
    }, [subjectId, termId]);

    const filteredExams = exams.filter(e =>
        e.Title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDateTime = (dateStr: string | null) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleString([], {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 hover:bg-accent rounded-full transition-all border border-transparent hover:border-border active:scale-95"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Exams Repository</h2>
                        <p className="text-muted-foreground">Manage and monitor exams for this subject.</p>
                    </div>
                </div>

                <button
                    onClick={() => navigate(`/years/${yearId}/terms/${termId}/subjects/${subjectId}/exams/create`)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20"
                >
                    <Plus className="h-5 w-5" />
                    <span>Create New Exam</span>
                </button>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search exams by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-card border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    />
                </div>
                <div className="p-3 px-6 rounded-2xl bg-card border border-border flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total</span>
                    <span className="text-2xl font-black italic">{exams.length}</span>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium animate-pulse">Fetching exams data...</p>
                </div>
            ) : filteredExams.length === 0 ? (
                <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[2.5rem] bg-accent/10 text-center p-12 space-y-6">
                    <div className="p-6 bg-background rounded-3xl shadow-sm border border-border">
                        <FileStack className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="max-w-sm">
                        <h3 className="text-xl font-bold mb-2">No exams found</h3>
                        <p className="text-muted-foreground">
                            {searchQuery ? `No results for "${searchQuery}"` : "This subject doesn't have any exams yet. Start by creating your first one."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredExams.map((exam, idx) => (
                            <motion.button
                                key={exam.ID}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => navigate(`/years/${yearId}/terms/${termId}/subjects/${subjectId}/exams/${exam.ID}`)}
                                className="group relative flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] border border-border bg-card hover:bg-accent/40 active:scale-[0.99] transition-all duration-300 shadow-sm"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors text-primary group-hover:text-primary-foreground">
                                        <TableProperties className="h-7 w-7" />
                                    </div>
                                    <div className="text-left space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold">{exam.Title}</h3>                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium">
                                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {exam.Duration_min} min</span>
                                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(exam.CreatedAt).toLocaleDateString()}</span>
                                            {exam.AutoCorrect && <span className="text-green-500 flex items-center gap-1">Auto-Correct</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 md:mt-0 flex items-center gap-4">
                                    <div className="hidden md:flex flex-col items-end text-right">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Timing Schedule</div>
                                        <div className="text-xs font-semibold">
                                            {exam.StartAt ? `${formatDateTime(exam.StartAt)}` : "Open Start"}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-secondary/50 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        <ChevronRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
