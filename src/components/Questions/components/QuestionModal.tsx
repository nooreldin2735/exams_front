import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Presentation, PlusSquare, Search } from "lucide-react";
import { LecturesList } from "@/components/Lectures/LecturesList";
import { QuestionsList } from "../QuestionsList";
import { QuestionForm } from "./QuestionForm";
import type { Question } from "@/types/question";

interface QuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (question: Question) => void;
    subjectId: number | string;
    selectedQuestions?: Question[];
}

export function QuestionModal({ isOpen, onClose, onSubmit, subjectId, selectedQuestions = [] }: QuestionModalProps) {
    const [step, setStep] = useState<"lecture" | "choice" | "form" | "pick_existing">("lecture");
    const [selectedLecture, setSelectedLecture] = useState<{ ID: number, Name: string } | null>(null);

    const handleLectureSelect = (lecture: any) => {
        setSelectedLecture(lecture);
        setStep("choice");
    };

    const handleExistingSelect = (question: Question) => {
        onSubmit({ ...question, isExisting: true });
        // Don't close or reset, so user can pick more
    };

    const handleQuestionSubmit = (data: Question) => {
        onSubmit(data);
        reset();
        onClose();
    };

    const reset = () => {
        setStep("lecture");
        setSelectedLecture(null);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl bg-background rounded-[2rem] border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex items-center justify-between bg-card/50">
                            <div className="flex items-center gap-4">
                                {step !== "lecture" && (
                                    <button
                                        onClick={() => {
                                            if (step === "choice") setStep("lecture");
                                            else if (step === "form" || step === "pick_existing") {
                                                if (selectedLecture) setStep("choice");
                                                else setStep("lecture");
                                            }
                                        }}
                                        className="p-2 hover:bg-accent rounded-full transition-colors"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </button>
                                )}
                                <div>
                                    <h3 className="text-xl font-bold">
                                        {step === "lecture" && "Select Lecture"}
                                        {step === "choice" && "What would you like to do?"}
                                        {step === "form" && "Add New Question"}
                                        {step === "pick_existing" && "Pick Existing Question"}
                                    </h3>
                                    {step !== "lecture" && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Presentation className="h-3 w-3" />
                                            Target: {selectedLecture ? selectedLecture.Name : "General Subject Pool"}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-accent rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {step === "lecture" && (
                                <div className="space-y-6">
                                    <div className="text-center space-y-2 mb-8">
                                        <p className="text-muted-foreground">Which lecture should this question belong to?</p>
                                        <button
                                            onClick={() => { setSelectedLecture(null); setStep("form"); }}
                                            className="text-primary text-sm font-semibold hover:underline"
                                        >
                                            Skip: Add a general question to this subject
                                        </button>
                                    </div>
                                    <LecturesList
                                        subjectId={subjectId || ""}
                                        onLectureSelect={handleLectureSelect}
                                        className="sm:grid-cols-2 lg:grid-cols-2" // Adjust grid for modal
                                    />
                                </div>
                            )}

                            {step === "choice" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto py-12">
                                    <button
                                        onClick={() => setStep("form")}
                                        className="flex flex-col items-center justify-center p-8 rounded-3xl border border-border bg-card/40 hover:bg-primary/5 hover:border-primary/30 transition-all group"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <PlusSquare className="h-8 w-8 text-primary" />
                                        </div>
                                        <h4 className="text-lg font-bold">Create New</h4>
                                        <p className="text-sm text-muted-foreground text-center mt-2">Write a fresh question for this lecture.</p>
                                    </button>

                                    <button
                                        onClick={() => setStep("pick_existing")}
                                        className="flex flex-col items-center justify-center p-8 rounded-3xl border border-border bg-card/40 hover:bg-primary/5 hover:border-primary/30 transition-all group"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Search className="h-8 w-8 text-primary" />
                                        </div>
                                        <h4 className="text-lg font-bold">Select Existing</h4>
                                        <p className="text-sm text-muted-foreground text-center mt-2">Pick from already available questions.</p>
                                    </button>
                                </div>
                            )}

                            {step === "form" && (
                                <QuestionForm
                                    onSubmit={handleQuestionSubmit}
                                    lectureId={selectedLecture ? selectedLecture.ID : null}
                                    isModal={true}
                                    onCancel={handleClose}
                                />
                            )}

                            {step === "pick_existing" && selectedLecture && (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <p className="text-muted-foreground">Select a question to add to your exam pool.</p>
                                    </div>
                                    <QuestionsList
                                        lectureId={selectedLecture.ID}
                                        onQuestionSelect={handleExistingSelect}
                                        className="max-h-[50vh] overflow-y-auto px-2"
                                        selectedQuestionIds={selectedQuestions.map(q => q.ID ?? q.id).filter((id): id is number => id !== undefined)}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
