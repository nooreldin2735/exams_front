import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Loader2, AlertCircle } from "lucide-react";
import ApiService from "@/services/Api";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/question";
import { QuestionCard } from "./components/QuestionCard";

interface QuestionsListProps {
    lectureId: string | number;
    onQuestionSelect?: (question: Question) => void;
    className?: string;
    selectedQuestionIds?: number[];
    permanentQuestionIds?: number[];
}

export function QuestionsList({
    lectureId,
    onQuestionSelect,
    className,
    selectedQuestionIds = [],
    permanentQuestionIds = []
}: QuestionsListProps) {
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
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
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn("space-y-6", className)}
        >
            {questions.map((question, index) => {
                const id = question.ID ?? question.id;
                const isPermanent = permanentQuestionIds.includes(id as number);
                const isSelected = selectedQuestionIds.includes(id as number) || isPermanent;

                // console.log(`Question List Item ${index}: id=${id}, isSelected=${isSelected}, isPermanent=${isPermanent}`);

                return (
                    <QuestionCard
                        key={id || index}
                        question={question}
                        index={index}
                        onClick={() => onQuestionSelect?.(question)}
                        hideActions={!!onQuestionSelect}
                        selected={isSelected}
                        isPermanent={isPermanent}
                    />
                );
            })}
        </motion.div>
    );
}
