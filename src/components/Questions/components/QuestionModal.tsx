import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Presentation, PlusSquare, Search, FileStack, Trash2, Check, Loader2, HelpCircle, ChevronRight, FileText } from "lucide-react";
import { LecturesList } from "@/components/Lectures/LecturesList";
import { QuestionsList } from "../QuestionsList";
import { QuestionCard } from "./QuestionCard";
import { QuestionForm } from "./QuestionForm";
import { Drawer } from "./Drawer";
import ApiService from "@/services/Api";
import type { Question, ExamSummary } from "@/types/question";
import { cn } from "@/lib/utils";

interface QuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (question: Question | Question[]) => void;
    subjectId: number | string;
    selectedQuestions?: Question[]; // Already in the exam pool
}

export function QuestionModal({ isOpen, onClose, onSubmit, subjectId, selectedQuestions = [] }: QuestionModalProps) {
    const [step, setStep] = useState<"lecture" | "choice" | "form" | "pick_existing" | "pick_from_exam">("lecture");
    const [selectedLecture, setSelectedLecture] = useState<{ ID: number, Name: string } | null>(null);

    // Selection state for the current modal session
    const [modalSelections, setModalSelections] = useState<Question[]>([]);

    // Exams state
    const [exams, setExams] = useState<ExamSummary[]>([]);
    const [examsLoading, setExamsLoading] = useState(false);
    const [previewExam, setPreviewExam] = useState<ExamSummary | null>(null);
    const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [bulkLoadingExams, setBulkLoadingExams] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (isOpen) {
            setModalSelections([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (step === "pick_from_exam" && exams.length === 0) {
            fetchExams();
        }
    }, [step]);

    const fetchExams = async () => {
        try {
            setExamsLoading(true);
            const data = await ApiService.get<{ list: ExamSummary[] }>("/exams");
            const filtered = (data.list || []).filter(e => e.Subject_id.toString() === subjectId.toString());
            setExams(filtered);
        } catch (e) { console.error(e); }
        finally { setExamsLoading(false); }
    };

    const fetchPreviewQuestions = async (examId: number) => {
        try {
            setPreviewLoading(true);
            const data = await ApiService.get<any>(`/exam/show?exam_id=${examId}`);
            const qList = Array.isArray(data) ? data : (data.list || []);
            console.log("Exam Preview Questions:", qList);
            setPreviewQuestions(qList.map((q: any) => ({ ...q, isExisting: true })));
        } catch (e) { console.error(e); }
        finally { setPreviewLoading(false); }
    };

    const handleLectureSelect = (lecture: any) => {
        setSelectedLecture(lecture);
        setStep("choice");
    };

    const toggleSelection = (question: Question) => {
        const id = question.ID ?? question.id;
        if (id === undefined || id === null) {
            console.error("Attempted to select question without ID:", question);
            return;
        }

        console.log(`Toggling selection for question ${id}`);
        const exists = modalSelections.find(q => (q.ID ?? q.id) === id);
        if (exists) {
            console.log(`Removing question ${id} from selections`);
            setModalSelections(modalSelections.filter(q => (q.ID ?? q.id) !== id));
        } else {
            console.log(`Adding question ${id} to selections`);
            setModalSelections([...modalSelections, { ...question, isExisting: true }]);
        }
    };

    const toggleExamQuestions = async (exam: ExamSummary) => {
        try {
            setBulkLoadingExams(prev => new Set(prev).add(exam.ID));
            // Check if we already have these questions in previewQuestions (if drawer was opened)
            // Or fetch them now
            let qList = previewExam?.ID === exam.ID ? previewQuestions : [];
            if (qList.length === 0) {
                const data = await ApiService.get<any>(`/exam/show?exam_id=${exam.ID}`);
                qList = Array.isArray(data) ? data : (data.list || []);
            }

            const newSelections = [...modalSelections];
            const examQIds = qList.map((q: any) => q.ID ?? q.id);
            const allSelectedFromThisExam = examQIds.length > 0 && examQIds.every(id =>
                newSelections.find(s => (s.ID ?? s.id) === id) || selectedInPoolIds.includes(id as number)
            );

            if (allSelectedFromThisExam) {
                // Unselect all FROM THIS EXAM that are in modalSelections
                setModalSelections(newSelections.filter(s => !examQIds.includes(s.ID ?? s.id)));
            } else {
                // Select all FROM THIS EXAM that are NOT in pool
                qList.forEach((q: any) => {
                    const id = q.ID ?? q.id;
                    if (!newSelections.find(s => (s.ID ?? s.id) === id) && !selectedInPoolIds.includes(id as number)) {
                        newSelections.push({ ...q, isExisting: true });
                    }
                });
                setModalSelections(newSelections);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setBulkLoadingExams(prev => {
                const next = new Set(prev);
                next.delete(exam.ID);
                return next;
            });
        }
    };

    const handleConfirmSelections = () => {
        console.log("Confirming Import for selections:", modalSelections);
        if (modalSelections.length > 0) {
            onSubmit([...modalSelections]);
            setModalSelections([]);
            setStep("choice");
        }
    };

    const reset = () => {
        setStep("lecture");
        setSelectedLecture(null);
        setModalSelections([]);
        setPreviewExam(null);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const selectedInPoolIds = selectedQuestions.map(q => q.ID ?? q.id).filter(id => id !== undefined && id !== null);

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
                                            else setStep("choice");
                                        }}
                                        className="p-2 hover:bg-accent rounded-full transition-colors"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </button>
                                )}
                                <div>
                                    <h3 className="text-xl font-bold">
                                        {step === "lecture" && "Select Lecture"}
                                        {step === "choice" && "Import Questions"}
                                        {step === "form" && "New Question"}
                                        {step === "pick_existing" && "Lecture Repository"}
                                        {step === "pick_from_exam" && "Exams Repository"}
                                    </h3>
                                    {step !== "lecture" && selectedLecture && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Presentation className="h-3 w-3" />
                                            {selectedLecture.Name}
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
                        <div className="flex-1 overflow-y-auto p-6 relative">
                            {step === "lecture" && (
                                <div className="space-y-6">
                                    <div className="text-center space-y-2 mb-8">
                                        <p className="text-muted-foreground font-medium">Choose a source lecture for your questions.</p>
                                        <button
                                            onClick={() => { setSelectedLecture(null); setStep("choice"); }}
                                            className="text-primary text-sm font-bold hover:underline"
                                        >
                                            Skip & Browse all subject exams
                                        </button>
                                    </div>
                                    <LecturesList
                                        subjectId={subjectId || ""}
                                        onLectureSelect={handleLectureSelect}
                                        className="sm:grid-cols-2 lg:grid-cols-2"
                                    />
                                </div>
                            )}

                            {step === "choice" && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto py-12">
                                    <button
                                        onClick={() => setStep("form")}
                                        className="flex flex-col items-center justify-center p-8 rounded-3xl border border-border bg-card/40 hover:bg-primary/5 hover:border-primary/30 transition-all group"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <PlusSquare className="h-7 w-7 text-primary" />
                                        </div>
                                        <h4 className="text-base font-bold text-center">Create New</h4>
                                        <p className="text-xs text-muted-foreground text-center mt-2">Write a fresh question.</p>
                                    </button>

                                    <button
                                        onClick={() => setStep("pick_existing")}
                                        disabled={!selectedLecture}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-8 rounded-3xl border border-border bg-card/40 hover:bg-primary/5 hover:border-primary/30 transition-all group",
                                            !selectedLecture && "opacity-50 grayscale cursor-not-allowed"
                                        )}
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Search className="h-7 w-7 text-primary" />
                                        </div>
                                        <h4 className="text-base font-bold text-center">From Lecture</h4>
                                        <p className="text-xs text-muted-foreground text-center mt-2">Pick from this lecture.</p>
                                    </button>

                                    <button
                                        onClick={() => setStep("pick_from_exam")}
                                        className="flex flex-col items-center justify-center p-8 rounded-3xl border border-border bg-card/40 hover:bg-primary/5 hover:border-primary/30 transition-all group font-bold"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <FileStack className="h-7 w-7 text-primary" />
                                        </div>
                                        <h4 className="text-base font-bold text-center uppercase tracking-tighter">Existing Exams</h4>
                                        <p className="text-xs text-muted-foreground text-center mt-2 font-normal">Import from other exams.</p>
                                    </button>
                                </div>
                            )}

                            {step === "form" && (
                                <QuestionForm
                                    onSubmit={(q) => { onSubmit(q); handleClose(); }}
                                    lectureId={selectedLecture ? selectedLecture.ID : null}
                                    isModal={true}
                                    onCancel={() => setStep("choice")}
                                />
                            )}

                            {step === "pick_existing" && selectedLecture && (
                                <QuestionsList
                                    lectureId={selectedLecture.ID}
                                    onQuestionSelect={toggleSelection}
                                    className="px-2"
                                    permanentQuestionIds={selectedInPoolIds as number[]}
                                    selectedQuestionIds={modalSelections.map(q => q.ID ?? q.id) as number[]}
                                />
                            )}

                            {step === "pick_from_exam" && (
                                <div className="space-y-4">
                                    {examsLoading ? (
                                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            <p className="text-muted-foreground animate-pulse">Loading exams...</p>
                                        </div>
                                    ) : exams.length === 0 ? (
                                        <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                                            <HelpCircle className="h-12 w-12 text-muted-foreground" />
                                            <p className="text-muted-foreground">No exams found for this subject.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3">
                                            {exams.map(exam => {
                                                const isExamSelected = false; // Simplified for now
                                                const isLoading = bulkLoadingExams.has(exam.ID);
                                                return (
                                                    <div
                                                        key={exam.ID}
                                                        className="flex items-center gap-3 group"
                                                    >
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toggleExamQuestions(exam); }}
                                                            disabled={isLoading}
                                                            className={cn(
                                                                "w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0",
                                                                "hover:border-primary/50 group-hover:bg-accent/50",
                                                                isExamSelected ? "bg-primary border-primary text-primary-foreground" : "border-border"
                                                            )}
                                                        >
                                                            {isLoading ? (
                                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                            ) : isExamSelected ? (
                                                                <Check className="h-5 w-5" />
                                                            ) : (
                                                                <PlusSquare className="h-5 w-5 text-muted-foreground" />
                                                            )}
                                                        </button>
                                                        <div
                                                            onClick={() => { setPreviewExam(exam); fetchPreviewQuestions(exam.ID); }}
                                                            className="flex-1 flex items-center justify-between p-4 rounded-2xl border border-border bg-card/50 hover:bg-accent/50 cursor-pointer transition-all"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                                    <FileText className="h-5 w-5" />
                                                                </div>
                                                                <div className="text-left">
                                                                    <h4 className="font-bold">{exam.Title}</h4>
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-black">{exam.Duration_min} MIN • {new Date(exam.CreatedAt).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer (Selection Summary) */}
                        <AnimatePresence>
                            {modalSelections.length > 0 && (
                                <motion.div
                                    initial={{ y: 100 }}
                                    animate={{ y: 0 }}
                                    exit={{ y: 100 }}
                                    className="p-4 border-t border-border bg-primary/5 backdrop-blur-md flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-lg shadow-primary/20">
                                            {modalSelections.length}
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-bold">Questions Picked</p>
                                            <p className="text-xs text-muted-foreground">Click the button to confirm import</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setModalSelections([])}
                                            className="p-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                                            title="Clear All"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={handleConfirmSelections}
                                            className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-all"
                                        >
                                            <Check className="h-5 w-5" />
                                            Import Selected ({modalSelections.length})
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Drawer for Exam Preview */}
                    <Drawer
                        isOpen={!!previewExam}
                        onClose={() => setPreviewExam(null)}
                        title={previewExam?.Title || "Exam Preview"}
                    >
                        {previewLoading ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">Fetching questions...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Bulk Action</p>
                                        <p className="text-[10px] text-muted-foreground italic">Add all questions from this exam at once</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newSelections = [...modalSelections];
                                            previewQuestions.forEach(q => {
                                                const id = q.ID ?? q.id;
                                                if (!newSelections.find(s => (s.ID ?? s.id) === id) && !selectedInPoolIds.includes(id as number)) {
                                                    newSelections.push(q);
                                                }
                                            });
                                            setModalSelections(newSelections);
                                        }}
                                        className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-xs shadow-md"
                                    >
                                        Select All
                                    </button>
                                </div>
                                {previewQuestions.map((q, i) => {
                                    const id = q.ID ?? q.id;
                                    const isSelectedInModal = !!modalSelections.find(s => (s.ID ?? s.id) === id);
                                    const isAlreadyInPool = selectedInPoolIds.includes(id as number);

                                    return (
                                        <div key={id || i} className="relative group">
                                            <QuestionCard
                                                question={q}
                                                index={i}
                                                hideActions
                                                selected={isSelectedInModal || isAlreadyInPool}
                                                isPermanent={isAlreadyInPool}
                                            />
                                            {!isAlreadyInPool && (
                                                <button
                                                    onClick={() => toggleSelection(q)}
                                                    className={cn(
                                                        "absolute top-4 right-4 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shadow-md",
                                                        isSelectedInModal
                                                            ? "bg-primary border-primary text-primary-foreground"
                                                            : "bg-background border-border text-transparent hover:border-primary"
                                                    )}
                                                >
                                                    <Check className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Drawer>
                </div>
            )}
        </AnimatePresence>
    );
}
