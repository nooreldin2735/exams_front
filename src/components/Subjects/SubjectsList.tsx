import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Book, ChevronRight, Loader2, AlertCircle, FileText, ClipboardList, FileStack } from "lucide-react";
import ApiService from "@/services/Api";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Subject {
    ID: number;
    Name: string;
    User_id: number;
    Term_id: number;
    Year_id: number;
}

interface SubjectsListProps {
    yearId: string | number;
    termId: string | number;
    onSubjectSelect?: (subject: Subject) => void;
    className?: string;
}

export function SubjectsList({ yearId, termId, onSubjectSelect, className }: SubjectsListProps) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setLoading(true);
                // API endpoint: /api/v0/subjects
                const data = await ApiService.get<any>("/subjects");

                let allSubjects: Subject[] = [];
                if (Array.isArray(data)) {
                    allSubjects = data;
                } else if (data && typeof data === 'object' && Array.isArray(data.list)) {
                    allSubjects = data.list;
                }

                // Filter by yearId and termId on frontend
                const filtered = allSubjects.filter(s =>
                    s.Year_id.toString() === yearId.toString() &&
                    s.Term_id.toString() === termId.toString()
                );

                setSubjects(filtered);
                setError(null);
            } catch (err: any) {
                setError(err.message || "Failed to load subjects");
            } finally {
                setLoading(false);
            }
        };

        if (yearId && termId) fetchSubjects();
    }, [yearId, termId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading subjects...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4 border border-destructive/20 bg-destructive/5 rounded-2xl text-destructive">
                <AlertCircle className="h-10 w-10" />
                <div className="text-center">
                    <h3 className="font-semibold text-lg">Error Loading Subjects</h3>
                    <p className="text-sm opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    if (subjects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <Book className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold">No subjects found</h3>
                    <p className="text-sm text-muted-foreground italic">Try adding a new subject for this term.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
            {subjects.map((subject, index) => (
                <motion.div
                    key={subject.ID}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => {
                        if (onSubjectSelect) {
                            onSubjectSelect(subject);
                        } else {
                            navigate(`/years/${yearId}/terms/${termId}/subjects/${subject.ID}/lectures`);
                        }
                    }}
                    className={cn(
                        "group relative flex items-center justify-between p-6 cursor-pointer",
                        "bg-card hover:bg-accent/50 border border-border/50 hover:border-primary/30",
                        "rounded-2xl transition-all duration-300 shadow-sm active:scale-[0.98]"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                {subject.Name}
                            </h3>
                            <p className="text-xs text-muted-foreground">Subject ID: {subject.ID}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/years/${yearId}/terms/${termId}/subjects/${subject.ID}/exams`);
                            }}
                            className="p-2 rounded-xl bg-secondary/80 text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center gap-2 border border-border/50"
                            title="View Exams"
                        >
                            <FileStack className="h-4 w-4" />
                            <span className="text-xs font-bold sm:hidden lg:block">Exams</span>
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/years/${yearId}/terms/${termId}/subjects/${subject.ID}/exams/create`);
                            }}
                            className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center gap-2"
                            title="Create Exam"
                        >
                            <ClipboardList className="h-4 w-4" />
                            <span className="text-xs font-bold sm:hidden lg:block">New</span>
                        </button>

                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0">
                            <ChevronRight className="h-4 w-4" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
