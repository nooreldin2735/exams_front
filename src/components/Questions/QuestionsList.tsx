import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, ChevronRight, Loader2, AlertCircle, MessageSquare, ListTodo, FileQuestion, Video, Youtube, Link as LinkIcon, Music } from "lucide-react";
import ApiService from "@/services/Api";
import { cn } from "@/lib/utils";

interface Attachment {
    type: "img" | "video" | "audio" | "youtube";
    link: string;
}

interface Question {
    ID?: number;
    id?: number;
    question: string;
    questionType: number; // 0 | 1 | 2 | 3
    answers: string;
    choices?: string[] | null;
    ease?: number;
    lecture_id: number;
    attachments?: Attachment[] | null;
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
                const data = await ApiService.get<any>(`/questions?lecture_id=${lectureId}`);
                console.log("Fetched questions:", data);

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

    const getTypeIcon = (type: number) => {
        switch (type) {
            case 0: return <ListTodo className="h-5 w-5 text-blue-500" />; // MCQ One
            case 1: return <ListTodo className="h-5 w-5 text-indigo-500" />; // MCQ Multi
            case 2: return <MessageSquare className="h-5 w-5 text-green-500" />; // Written
            case 3: return <FileQuestion className="h-5 w-5 text-purple-500" />; // Complex
            default: return <HelpCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    const getTypeName = (type: number) => {
        switch (type) {
            case 0: return "MCQ (1)";
            case 1: return "MCQ (N)";
            case 2: return "Written";
            case 3: return "Complex";
            default: return "Unknown";
        }
    };

    const getEaseLabel = (ease?: number) => {
        switch (ease) {
            case 0: return { label: "Easy", color: "bg-green-100 text-green-700" };
            case 1: return { label: "Medium", color: "bg-yellow-100 text-yellow-700" };
            case 2: return { label: "Hard", color: "bg-red-100 text-red-700" };
            default: return { label: "Unknown", color: "bg-gray-100 text-gray-700" };
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
        <div className={cn("space-y-6", className)}>
            {questions.map((question, index) => {
                const ease = getEaseLabel(question.ease);
                const correctIndices = question.answers.split(',').map(s => parseInt(s.trim()));

                return (
                    <motion.div
                        key={question.ID || question.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={cn(
                            "group relative flex flex-col p-6",
                            "bg-card hover:bg-accent/20 border border-border hover:border-primary/20",
                            "rounded-3xl transition-all duration-300 shadow-sm"
                        )}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                    {getTypeIcon(question.questionType)}
                                </div>
                                <div className="space-y-4 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                            {getTypeName(question.questionType)}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${ease.color}`}>
                                            {ease.label}
                                        </span>
                                        {(question.ID || question.id) && (
                                            <span className="text-[10px] text-muted-foreground font-mono">#{question.ID || question.id}</span>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-xl leading-tight text-foreground break-words">
                                            {question.question}
                                        </h3>

                                        {/* Attachments Section */}
                                        {question.attachments && question.attachments.length > 0 && (
                                            <div className="flex flex-wrap gap-4 py-2">
                                                {question.attachments.map((att, attIdx) => (
                                                    <div key={attIdx} className="group/att relative flex flex-col p-3 rounded-2xl border border-border bg-secondary/20 hover:border-primary/30 transition-all select-none min-w-[140px] max-w-[200px]">
                                                        <div className="relative aspect-video rounded-xl bg-background border border-border overflow-hidden flex items-center justify-center mb-2">
                                                            {att.type === 'img' ? (
                                                                <img src={att.link} className="w-full h-full object-cover" alt="" />
                                                            ) : att.type === 'video' ? (
                                                                <Video className="w-8 h-8 opacity-40" />
                                                            ) : att.type === 'youtube' ? (
                                                                <Youtube className="w-8 h-8 text-red-500" />
                                                            ) : att.type === 'audio' ? (
                                                                <Music className="w-8 h-8 opacity-40" />
                                                            ) : (
                                                                <LinkIcon className="w-8 h-8 opacity-40" />
                                                            )}
                                                            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md font-mono">
                                                                ${attIdx}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">{att.type}</p>
                                                            <a href={att.link} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary hover:underline truncate">
                                                                Open Attachment
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Choices Section */}
                                        {question.choices && question.choices.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                {question.choices.map((choice, cIdx) => {
                                                    const isCorrect = correctIndices.includes(cIdx);
                                                    return (
                                                        <div
                                                            key={cIdx}
                                                            className={cn(
                                                                "flex items-center gap-4 p-4 rounded-3xl border transition-all duration-300",
                                                                isCorrect
                                                                    ? "border-green-500 bg-green-500/5 text-green-900 shadow-sm"
                                                                    : "border-border bg-background/50 text-muted-foreground"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "flex-shrink-0 w-8 h-8 rounded-2xl flex items-center justify-center font-bold text-sm border shadow-sm",
                                                                isCorrect ? "bg-green-500 text-white border-green-400" : "bg-card text-muted-foreground border-border"
                                                            )}>
                                                                {cIdx}
                                                            </div>
                                                            <span className="text-sm font-semibold">{choice}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => onQuestionSelect?.(question)}
                                className="flex-shrink-0 w-10 h-10 rounded-2xl bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
