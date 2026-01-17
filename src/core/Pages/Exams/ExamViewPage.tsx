import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    HelpCircle,
    LayoutGrid,
    Calendar,
    Clock,
    User,
    PenTool
} from "lucide-react";
import ApiService from "@/services/Api";
import { useNavigation } from "@/context/NavigationContext";
import { QuestionCard } from "@/components/Questions/components/QuestionCard";
import type { Question, ExamSummary } from "@/types/question";
import { motion, AnimatePresence } from "framer-motion";

export default function ExamViewPage() {
    const { examId } = useParams<{
        examId: string
    }>();
    const navigate = useNavigate();
    const { setCurrentPathTitle } = useNavigation();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [examInfo, setExamInfo] = useState<ExamSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExamDetails = async () => {
            if (!examId) return;
            try {
                setLoading(true);
                setCurrentPathTitle("View Exam");

                // 1. Fetch Exam Metadata for the header
                // We fetch all exams and filter to find this one as the API doc for /exams suggests list only
                const allExams = await ApiService.get<{ list: ExamSummary[] }>("/exams");
                const foundExam = allExams.list.find(e => e.ID.toString() === examId);
                if (foundExam) setExamInfo(foundExam);

                // 2. Fetch Questions (GET /api/v0/exam/show?exam_id=ID)
                const questionsData = await ApiService.get<Question[]>(`/exam/show?exam_id=${examId}`);
                console.log("Fetched exam questions:", questionsData);

                setQuestions(questionsData || []);
                setError(null);
            } catch (err: any) {
                setError(err.message || "Failed to load exam details");
            } finally {
                setLoading(false);
            }
        };

        fetchExamDetails();
    }, [examId]);

    const formatDateTime = (dateStr: string | null) => {
        if (!dateStr) return "Open Schedule";
        return new Date(dateStr).toLocaleString([], {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-semibold animate-pulse text-lg">Preparing exam review...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-20 p-8 rounded-[2rem] border border-destructive/20 bg-destructive/5 text-center space-y-6">
                <div className="p-4 bg-destructive/10 rounded-full w-fit mx-auto">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-destructive">Error Loading Exam</h3>
                    <p className="text-muted-foreground">{error}</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2.5 bg-background border border-border rounded-xl hover:bg-accent transition-colors font-medium inline-flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" /> Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header & Meta */}
            <header className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 hover:bg-accent rounded-full transition-all border border-transparent hover:border-border active:scale-95"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
                            <PenTool className="h-4 w-4" />
                            <span>Exam Preview</span>
                        </div>
                        <h2 className="text-4xl font-black italic tracking-tight">{examInfo?.Title || "Exam Details"}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="h-3 w-3" /> Duration
                        </span>
                        <p className="font-bold text-lg">{examInfo?.Duration_min || "--"} Minutes</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <LayoutGrid className="h-3 w-3" /> Questions
                        </span>
                        <p className="font-bold text-lg">{questions.length} Items</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" /> Scheduled
                        </span>
                        <p className="font-bold text-xs truncate">
                            {examInfo?.StartAt ? formatDateTime(examInfo.StartAt) : "Anytime"}
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <User className="h-3 w-3" /> Owner ID
                        </span>
                        <p className="font-bold text-lg">{examInfo?.Owner_id || "--"}</p>
                    </div>
                </div>
            </header>

            {/* Questions List */}
            <div className="space-y-8">
                {questions.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[2.5rem] bg-accent/5 text-center p-8">
                        <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-bold">No questions found in this exam</h3>
                        <p className="text-muted-foreground">The exam might be empty or restricted.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {questions.map((question, idx) => (
                            <QuestionCard
                                key={idx}
                                question={question}
                                index={idx}
                                hideActions={true}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <footer className="pt-10 border-t border-border flex justify-center">
                <button
                    onClick={() => navigate(-1)}
                    className="px-8 py-3 rounded-2xl bg-secondary hover:bg-accent font-bold transition-all active:scale-95"
                >
                    Return to Repository
                </button>
            </footer>
        </div>
    );
}
