import { useState } from "react";
import { motion } from "framer-motion";
import { ListTodo, MessageSquare, FileQuestion, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/question";
import { SmartQuestionText } from "./SmartQuestionText";
import { ResourceGallery } from "./ResourceGallery";
import { ChoiceGrid } from "./ChoiceGrid";
import { ActionMenu } from "./ActionMenu";

interface QuestionCardProps {
    question: Question;
    index: number;
    onEdit?: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
    onClick?: () => void;
    hideActions?: boolean;
    selected?: boolean;
}

const difficultyConfig = {
    1: { label: "Easy", color: "bg-success/15 text-success border-success/30" },
    2: { label: "Medium", color: "bg-warning/15 text-warning border-warning/30" },
    3: { label: "Hard", color: "bg-destructive/15 text-destructive border-destructive/30" },
};

const typeConfig = {
    0: { label: "MCQ (1)", icon: ListTodo, color: "text-blue-500" },
    1: { label: "MCQ (N)", icon: ListTodo, color: "text-indigo-500" },
    2: { label: "Written", icon: MessageSquare, color: "text-green-500" },
    3: { label: "Complex", icon: FileQuestion, color: "text-purple-500" },
};

export const QuestionCard = ({
    question,
    index,
    onEdit,
    onDuplicate,
    onDelete,
    onClick,
    hideActions,
    selected
}: QuestionCardProps) => {
    const [highlightedAttachment, setHighlightedAttachment] = useState<number | null>(null);

    const handleChipClick = (attachmentIndex: number) => {
        const element = document.getElementById(`attachment-${question.ID || question.id}-${attachmentIndex}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    const difficulty = (question.ease ?? 1) as 1 | 2 | 3;
    const diffConfig = difficultyConfig[difficulty] || difficultyConfig[1];
    const qType = typeConfig[question.questionType as keyof typeof typeConfig] || { label: "Unknown", icon: HelpCircle, color: "text-gray-500" };
    const TypeIcon = qType.icon;

    const correctAnswers = question.answers.split(',').filter(x => x.trim() !== "").map(s => parseInt(s.trim()));

    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", damping: 25 }}
            onClick={onClick}
            className={cn(
                "glass-card p-6 md:p-8 transition-all duration-300",
                onClick && !selected && "cursor-pointer hover:shadow-xl hover:shadow-primary/5 border-primary/10",
                selected && "opacity-60 grayscale-[0.5] border-primary/40 bg-primary/5 pointer-events-none"
            )}
        >
            {selected && (
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg animate-in fade-in zoom-in">
                    Added
                </div>
            )}
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ${qType.color}`}>
                            <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">{qType.label}</span>
                            <h3 className="text-lg font-bold text-foreground">#{question.ID || question.id || index + 1}</h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${diffConfig.color}`}>
                            {diffConfig.label}
                        </span>
                        {question.degree !== undefined && (
                            <span className="px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs font-bold">
                                {question.degree} Marks
                            </span>
                        )}
                    </div>
                </div>

                {!hideActions && <ActionMenu onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} />}
            </div>

            {/* Question Text */}
            <SmartQuestionText
                text={question.question}
                attachments={question.attachments}
                highlightedIndex={highlightedAttachment}
                onChipHover={setHighlightedAttachment}
                onChipClick={handleChipClick}
            />

            {/* Choices */}
            {question.choices && question.choices.length > 0 && (
                <ChoiceGrid choices={question.choices} correctAnswers={correctAnswers} />
            )}

            {/* Resource Gallery */}
            <ResourceGallery
                attachments={question.attachments}
                questionId={question.ID || question.id || index}
                highlightedIndex={highlightedAttachment}
                onItemHover={setHighlightedAttachment}
            />
        </motion.article>
    );
};
