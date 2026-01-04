import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Presentation, ChevronRight, Loader2, AlertCircle, FileVideo } from "lucide-react";
import ApiService from "@/services/Api";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Lecture {
    ID: number;
    Name: string;
    Subject_id: number;
    User_id: number;
}

interface LecturesListProps {
    subjectId: string | number;
    onLectureSelect?: (lecture: Lecture) => void;
    className?: string;
}

export function LecturesList({ subjectId, onLectureSelect, className }: LecturesListProps) {
    const { yearId, termId } = useParams<{ yearId: string; termId: string }>();
    const navigate = useNavigate();
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLectures = async () => {
            try {
                setLoading(true);
                // API endpoint: /api/v0/lectures?subject_id=1
                const data = await ApiService.get<any>(`/lectures?subject_id=${subjectId}`);

                if (Array.isArray(data)) {
                    setLectures(data);
                } else if (data && typeof data === 'object' && Array.isArray(data.list)) {
                    setLectures(data.list);
                } else {
                    setLectures([]);
                }
                setError(null);
            } catch (err: any) {
                setError(err.message || "Failed to load lectures");
            } finally {
                setLoading(false);
            }
        };

        if (subjectId) fetchLectures();
    }, [subjectId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading lectures...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4 border border-destructive/20 bg-destructive/5 rounded-2xl text-destructive">
                <AlertCircle className="h-10 w-10" />
                <div className="text-center">
                    <h3 className="font-semibold text-lg">Error Loading Lectures</h3>
                    <p className="text-sm opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    if (lectures.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <Presentation className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold">No lectures found</h3>
                    <p className="text-sm text-muted-foreground italic">Try adding a new lecture for this subject.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
            {lectures.map((lecture, index) => (
                <motion.button
                    key={lecture.ID}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => {
                        if (onLectureSelect) {
                            onLectureSelect(lecture);
                        } else {
                            navigate(`/years/${yearId}/terms/${termId}/subjects/${subjectId}/lectures/${lecture.ID}/questions`);
                        }
                    }}
                    className={cn(
                        "group relative flex items-center justify-between p-6",
                        "bg-card hover:bg-accent/50 border border-border/50 hover:border-primary/30",
                        "rounded-2xl transition-all duration-300 shadow-sm active:scale-[0.98]"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <FileVideo className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                {lecture.Name}
                            </h3>
                            <p className="text-xs text-muted-foreground">Lecture ID: {lecture.ID}</p>
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
