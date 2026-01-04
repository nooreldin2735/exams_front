import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, ChevronRight, Loader2, AlertCircle, MessageSquare, ListTodo, FileQuestion } from "lucide-react";
import ApiService from "@/services/Api";
import { cn } from "@/lib/utils";

interface Question {
    ID: number;
    text_url: string;
    type: string; // "0" | "1" | "2"
    ans: string;
    lecture_id: number;
}

interface QuestionsListProps {
    lectureId: string | number;
    onQuestionSelect?: (question: Question) => void;
    className?: string;
}

export function QuestionsList({ lectureId, onQuestionSelect, className }: QuestionsListProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                // API endpoint: /api/v0/questions?lecture_id=1
                const data = await ApiService.get<any>(`/questions?lecture_id=${lectureId}`);

                if (Array.isArray(data)) {
                    setQuestions(data);
                } else if (data && typeof data === 'object' && Array.isArray(data.list)) {
                    setQuestions(data.list);
                } else {
                    setQuestions([]);
                }
                setError(null);
            } catch (err: any) {
                setError(err.message || "Failed to load questions");
            } finally {
                setLoading(false);
            }
        };

        if (lectureId) fetchQuestions();
    }, [lectureId]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "0": return <ListTodo className="h-5 w-5 text-blue-500" />; // MCQ
            case "1": return <MessageSquare className="h-5 w-5 text-green-500" />; // Written
            case "2": return <FileQuestion className="h-5 w-5 text-purple-500" />; // Complex
            default: return <HelpCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    const getTypeName = (type: string) => {
        switch (type) {
            case "0": return "MCQ";
            case "1": return "Written";
            case "2": return "Complex";
            default: return "Unknown";
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading questions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4 border border-destructive/20 bg-destructive/5 rounded-2xl text-destructive">
                <AlertCircle className="h-10 w-10" />
                <div className="text-center">
                    <h3 className="font-semibold text-lg">Error Loading Questions</h3>
                    <p className="text-sm opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <HelpCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold">No questions found</h3>
                    <p className="text-sm text-muted-foreground italic">Try adding a new question for this lecture.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {questions.map((question, index) => (
                <motion.div
                    key={question.ID}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={cn(
                        "group relative flex flex-col p-6",
                        "bg-card hover:bg-accent/30 border border-border/50 hover:border-primary/30",
                        "rounded-2xl transition-all duration-300 shadow-sm"
                    )}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                                {getTypeIcon(question.type)}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                                        {getTypeName(question.type)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">ID: {question.ID}</span>
                                </div>
                                <h3 className="font-semibold text-lg leading-tight">
                                    {question.text_url}
                                </h3>
                                <div className="p-3 bg-secondary/50 rounded-xl border border-border/50">
                                    <p className="text-sm font-medium">
                                        <span className="text-primary mr-2 italic">Answer:</span>
                                        {question.ans}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => onQuestionSelect?.(question)}
                            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
