import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface ChoiceGridProps {
    choices: string[];
    correctAnswers?: number[];
}

const choiceLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

export const ChoiceGrid = ({ choices, correctAnswers = [] }: ChoiceGridProps) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6 space-y-3"
        >
            {choices.map((choice, index) => {
                const isCorrect = correctAnswers.includes(index);
                return (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        className={`choice-option ${isCorrect ? "correct" : ""}`}
                    >
                        {/* Label circle */}
                        <div
                            className={`
                w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-semibold text-sm
                ${isCorrect
                                    ? "bg-success text-success-foreground"
                                    : "bg-muted text-muted-foreground"
                                }
              `}
                        >
                            {isCorrect ? (
                                <Check className="w-4 h-4" strokeWidth={3} />
                            ) : (
                                choiceLabels[index] || index
                            )}
                        </div>

                        {/* Choice text */}
                        <div className="flex-1 pt-0.5">
                            <p className={`text-base ${isCorrect ? "font-medium text-success" : "text-foreground"}`}>
                                {choice}
                            </p>
                        </div>

                        {/* Correct indicator */}
                        {isCorrect && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                                className="px-3 py-1.5 rounded-full bg-success/20 text-success text-xs font-semibold flex items-center gap-1.5"
                            >
                                <Check className="w-3 h-3" />
                                Correct
                            </motion.div>
                        )}
                    </motion.div>
                );
            })}
        </motion.div>
    );
};
