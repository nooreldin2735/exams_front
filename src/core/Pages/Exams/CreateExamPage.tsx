import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Loader2, AlertCircle, Settings2, ClipboardList, Clock, ShieldCheck, Share2, Download, TableProperties, MonitorOff, X } from "lucide-react";
import ApiService from "@/services/Api";
import { useNavigation } from "@/context/NavigationContext";
import { QuestionModal } from "@/components/Questions/components/QuestionModal";
import { QuestionCard } from "@/components/Questions/components/QuestionCard";
import type { Question, ExamSettings, CreateExamPayload } from "@/types/question";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateExamPage() {
    const { yearId, termId, subjectId } = useParams<{ yearId: string; termId: string; subjectId: string }>();
    const navigate = useNavigate();
    const { setYear, setTerm, setSubject, setCurrentPathTitle } = useNavigation();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Exam Data
    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [settings, setSettings] = useState<ExamSettings>({
        Locations: null,
        PassKey: "",
        PreventOtherTabs: true,
        Duration_min: 60,
        AutoCorrect: true,
        QuestionByQuestion: false,
        ShareWith: 0,
        AllowDownload: false,
        StartAt: new Date().toISOString().slice(0, 16) + ":00",
        EndAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16) + ":00"
    });

    useEffect(() => {
        const fetchContext = async () => {
            setCurrentPathTitle("Create Exam");
            if (!yearId || !termId || !subjectId) return;
            try {
                const years = await ApiService.get<any[]>("/years");
                const yList = Array.isArray(years) ? years : (years as any).list;
                const foundYear = yList.find((y: any) => y.ID.toString() === yearId);
                if (foundYear) setYear({ id: foundYear.ID, name: foundYear.Name });

                const terms = await ApiService.get<any[]>(`/terms?year_id=${yearId}`);
                const tList = Array.isArray(terms) ? terms : (terms as any).list;
                const foundTerm = tList.find((t: any) => t.ID.toString() === termId);
                if (foundTerm) setTerm({ id: foundTerm.ID, name: foundTerm.Name });

                const subjects = await ApiService.get<any[]>(`/subjects?term_id=${termId}`);
                const sList = Array.isArray(subjects) ? subjects : (subjects as any).list;
                const foundSubject = sList.find((s: any) => s.ID.toString() === subjectId);
                if (foundSubject) setSubject({ id: foundSubject.ID, name: foundSubject.Name });
            } catch (e) { console.error(e); }
        };
        fetchContext();
    }, [yearId, termId, subjectId]);

    useEffect(() => {
        console.log("=== QUESTIONS POOL UPDATED ===");
        console.log("Count:", questions.length);
        console.log("Full State:", questions);
    }, [questions]);

    const handleAddQuestion = (q: Question | Question[]) => {
        console.log("ON_SUBMIT_RECEIVED:", q);
        const incoming = Array.isArray(q) ? q : [q];
        setQuestions(prev => {
            const next = [...prev, ...incoming];
            console.log("Setting questions to:", next.length, "items");
            return next;
        });
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSettingChange = (key: keyof ExamSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Raw questions state before submission:", questions);
        if (!title.trim()) return setError("Exam title is required");
        if (questions.length === 0) return setError("Add at least one question");
        if (!settings.Duration_min || isNaN(settings.Duration_min) || settings.Duration_min <= 0) {
            return setError("Exam duration must be a valid number of minutes (e.g., 60)");
        }

        try {
            setLoading(true);
            setError(null);

            console.log("Processing questions for payload...", questions);
            const mappedQuestions = questions.map((q, idx) => {
                const id = q.ID ?? q.id;

                // If it's explicitly marked existing, it MUST have an ID
                if (q.isExisting) {
                    if (id !== undefined && id !== null) {
                        console.log(`[Item ${idx}] Mapping as existing ID: ${id}`);
                        return id as number;
                    } else {
                        console.warn(`[Item ${idx}] Question marked 'isExisting' but missing ID! Falling back to full object.`, q);
                    }
                }
                console.log(`Mapping new question:`, q);
                return {
                    ...q,
                    degree: q.degree ?? 1
                };
            }).filter(q => q !== null && q !== undefined);

            const payload: CreateExamPayload = {
                title: title.trim(),
                subject_id: parseInt(subjectId || "0"),
                questions: mappedQuestions,
                settings: {
                    ...settings,
                    Duration_min: settings.Duration_min || 0, // Ensure no NaN
                    StartAt: settings.StartAt.length === 16 ? `${settings.StartAt}:00` : settings.StartAt,
                    EndAt: settings.EndAt.length === 16 ? `${settings.EndAt}:00` : settings.EndAt
                }
            };

            console.log("Submitting Exam Payload:", payload);
            await ApiService.post("/exams/create", payload);
            navigate(`/years/${yearId}/terms/${termId}/subjects/${subjectId}/lectures`); // Redirect back
        } catch (err: any) {
            setError(err.message || "Failed to create exam");
        } finally {
            setLoading(false);
        }
    };

    const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-accent rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Create Exam</h2>
                        <p className="text-muted-foreground">Configure settings and build your question pool.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        <span>Save Exam</span>
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2.5 rounded-xl border border-border hover:bg-accent transition-colors font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Questions */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Exam Identity */}
                    <div className="p-8 rounded-[2rem] border border-border bg-card/40 shadow-sm backdrop-blur-md space-y-6">
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <ClipboardList className="h-5 w-5" />
                            <h3 className="font-bold text-lg uppercase tracking-wider">Exam Identity</h3>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Exam Title</label>
                            <input
                                autoFocus
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Final Physics Exam - Term 1"
                                className="w-full px-5 py-4 rounded-2xl bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-xl font-bold italic shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <TableProperties className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-bold text-xl">Questions Pool ({questions.length})</h3>
                            </div>
                            <button
                                onClick={() => setModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-semibold"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Add New Question</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <AnimatePresence mode="popLayout">
                                {questions.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[2rem] bg-accent/20 text-center p-8 space-y-4"
                                    >
                                        <div className="p-4 bg-background rounded-full shadow-sm">
                                            <ClipboardList className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">No questions added yet</p>
                                            <p className="text-sm text-muted-foreground">Click the button above to start building your exam.</p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    questions.map((q, idx) => (
                                        <motion.div
                                            key={idx}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            className="relative group"
                                        >
                                            <QuestionCard question={q} index={idx} />
                                            <button
                                                onClick={() => handleRemoveQuestion(idx)}
                                                className="absolute -top-3 -right-3 p-2 bg-destructive text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110 active:scale-95"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Settings */}
                <div className="space-y-8">
                    <div className="p-8 rounded-[2rem] border border-border bg-card shadow-xl sticky top-8 space-y-8">
                        <div className="flex items-center gap-3 text-secondary border-b border-border pb-4 mb-2">
                            <Settings2 className="h-5 w-5" />
                            <h3 className="font-bold text-lg uppercase tracking-wider">Exam Settings</h3>
                        </div>

                        {/* Timing */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                <Clock className="h-3.5 w-3.5" /> Timing
                            </h4>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground">Duration (Minutes)</label>
                                    <input
                                        type="number"
                                        value={isNaN(settings.Duration_min) ? "" : settings.Duration_min}
                                        onChange={(e) => {
                                            const val = e.target.value === "" ? NaN : parseInt(e.target.value);
                                            handleSettingChange('Duration_min', val);
                                        }}
                                        placeholder="60"
                                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary transition-all outline-none font-mono"
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground">Start Date/Time</label>
                                        <input
                                            type="datetime-local"
                                            value={settings.StartAt}
                                            onChange={(e) => handleSettingChange('StartAt', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary transition-all outline-none text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground">End Date/Time</label>
                                        <input
                                            type="datetime-local"
                                            value={settings.EndAt}
                                            onChange={(e) => handleSettingChange('EndAt', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary transition-all outline-none text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="space-y-4 pt-4 border-t border-border">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                <ShieldCheck className="h-3.5 w-3.5" /> Security
                            </h4>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground tracking-tighter">Proctor Passkey</label>
                                    <input
                                        type="text"
                                        value={settings.PassKey}
                                        onChange={(e) => handleSettingChange('PassKey', e.target.value)}
                                        placeholder="e.g. SECRET_123"
                                        className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary transition-all outline-none font-bold uppercase placeholder:font-normal placeholder:normal-case"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                                    <div className="flex items-center gap-2">
                                        <MonitorOff className="h-4 w-4 text-orange-500" />
                                        <span className="text-xs font-semibold">Strict Tab Mode</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSettingChange('PreventOtherTabs', !settings.PreventOtherTabs)}
                                        className={cn(
                                            "w-10 h-5 rounded-full transition-colors relative",
                                            settings.PreventOtherTabs ? "bg-primary" : "bg-muted-foreground/30"
                                        )}
                                    >
                                        <div className={cn("absolute top-1 w-3 h-3 rounded-full bg-white transition-all", settings.PreventOtherTabs ? "right-1" : "left-1")} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Distribution */}
                        <div className="space-y-4 pt-4 border-t border-border">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                <Share2 className="h-3.5 w-3.5" /> Distribution
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                                    <div className="flex items-center gap-2">
                                        <Download className="h-4 w-4 text-blue-500" />
                                        <span className="text-xs font-semibold">Allow Download</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSettingChange('AllowDownload', !settings.AllowDownload)}
                                        className={cn(
                                            "w-10 h-5 rounded-full transition-colors relative",
                                            settings.AllowDownload ? "bg-primary" : "bg-muted-foreground/30"
                                        )}
                                    >
                                        <div className={cn("absolute top-1 w-3 h-3 rounded-full bg-white transition-all", settings.AllowDownload ? "right-1" : "left-1")} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <QuestionModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleAddQuestion}
                subjectId={subjectId || ""}
                selectedQuestions={questions}
            />
        </div>
    );
}
