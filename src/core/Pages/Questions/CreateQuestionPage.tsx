import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, FileQuestion, MessageSquare, ListTodo, Plus, Trash2, Image, Video, Music, Youtube, HelpCircle } from "lucide-react";
import ApiService from "@/services/Api";
import { useNavigation } from "@/context/NavigationContext";

const QUESTION_TYPES = [
    { value: 0, label: "MCQ (One Answer)", icon: ListTodo, color: "text-blue-500", bg: "bg-blue-50" },
    { value: 1, label: "MCQ (Multi Answer)", icon: ListTodo, color: "text-indigo-500", bg: "bg-indigo-50" },
    { value: 2, label: "Written", icon: MessageSquare, color: "text-green-500", bg: "bg-green-50" },
    { value: 3, label: "Complex", icon: FileQuestion, color: "text-purple-500", bg: "bg-purple-50" },
] as const;

const EASE_LEVELS = [
    { value: 0, label: "Easy", color: "text-green-600", bg: "bg-green-100" },
    { value: 1, label: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" },
    { value: 2, label: "Hard", color: "text-red-600", bg: "bg-red-100" },
] as const;

interface Attachment {
    type: "img" | "video" | "audio" | "youtube";
    link: string;
}

const ATTACHMENT_TYPES = [
    { value: "img", label: "Image", icon: Image },
    { value: "video", label: "Video", icon: Video },
    { value: "audio", label: "Audio", icon: Music },
    { value: "youtube", label: "YouTube", icon: Youtube },
] as const;

export default function CreateQuestionPage() {
    const { yearId, termId, subjectId, lectureId } = useParams<{ yearId: string; termId: string; subjectId: string; lectureId: string }>();
    const navigate = useNavigate();
    const { setYear, setTerm, setSubject, setLecture, setCurrentPathTitle } = useNavigation();

    useEffect(() => {
        const fetchContext = async () => {
            setCurrentPathTitle("Add Question");
            if (!yearId || !termId || !subjectId || !lectureId) return;
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

                const lectures = await ApiService.get<any[]>(`/lectures?subject_id=${subjectId}`);
                const lList = Array.isArray(lectures) ? lectures : (lectures as any).list;
                const foundLecture = lList.find((l: any) => l.ID.toString() === lectureId);
                if (foundLecture) setLecture({ id: foundLecture.ID, name: foundLecture.Name });
            } catch (e) { console.error(e); }
        };
        fetchContext();
    }, [yearId, termId, subjectId, lectureId]);

    const [textUrl, setTextUrl] = useState("");
    const [type, setType] = useState<number>(0);
    const [ans, setAns] = useState("");
    const [choices, setChoices] = useState<string[]>(["", "", "", ""]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [ease, setEase] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addChoice = () => setChoices([...choices, ""]);
    const removeChoice = (index: number) => setChoices(choices.filter((_, i) => i !== index));
    const handleChoiceChange = (index: number, value: string) => {
        const newChoices = [...choices];
        newChoices[index] = value;
        setChoices(newChoices);
    };

    const addAttachment = () => setAttachments([...attachments, { type: "img", link: "" }]);
    const removeAttachment = (index: number) => setAttachments(attachments.filter((_, i) => i !== index));
    const handleAttachmentChange = (index: number, field: keyof Attachment, value: string) => {
        const newAttachments = [...attachments];
        newAttachments[index] = { ...newAttachments[index], [field]: value };
        setAttachments(newAttachments);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!textUrl.trim() || !ans.trim()) {
            setError("Both question text and answer are required");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const validChoices = (type === 0 || type === 1)
                ? choices.filter(c => c.trim() !== "")
                : null;

            const validAttachments = attachments
                .map((a) => ({ ...a, link: a.link.trim() }))
                .filter(a => a.link !== "");

            const payload = {
                question: textUrl.trim(),
                questionType: type,
                choices: validChoices && validChoices.length > 0 ? validChoices : null,
                answers: ans.trim(),
                ease: ease,
                attachments: validAttachments.length > 0 ? validAttachments : null,
                lecture_id: parseInt(lectureId || "0"),
                sectionName: null
            };

            await ApiService.post("/question/create", payload);
            navigate(`/years/${yearId}/terms/${termId}/subjects/${subjectId}/lectures/${lectureId}/questions`);
        } catch (err: any) {
            setError(err.message || "Failed to create question");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Add Question</h2>
                    <p className="text-muted-foreground">Create a new question for the Question Bank.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-3xl border border-border bg-card/40 shadow-sm backdrop-blur-md space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label htmlFor="textUrl" className="text-base font-semibold">
                                    Question Text
                                </label>
                                <div className="group relative flex items-center gap-1 text-xs text-muted-foreground cursor-help bg-accent/50 px-2 py-1 rounded-full">
                                    <HelpCircle className="h-3 w-3" />
                                    <span>Syntax Help</span>
                                    <div className="absolute right-0 top-full mt-2 w-72 p-4 rounded-xl bg-popover border border-border shadow-xl text-popover-foreground text-xs hidden group-hover:block z-50">
                                        <p className="font-bold mb-2 text-sm">Formatting Guide:</p>
                                        <ul className="list-disc pl-4 space-y-2">
                                            <li>Use <code>$0</code>, <code>$1</code> to refer to attachments by index.</li>
                                            <li>Use <code>#$</code> to write a literal dollar sign (e.g. <code>Price is #$10</code>).</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <textarea
                                id="textUrl"
                                value={textUrl}
                                onChange={(e) => setTextUrl(e.target.value)}
                                placeholder="Enter your question here..."
                                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-lg min-h-[140px] resize-y"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-base font-semibold">Attachments</label>
                                <button type="button" onClick={addAttachment} className="text-primary text-sm font-medium hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                    <Plus className="h-4 w-4" /> Add
                                </button>
                            </div>
                            <div className="space-y-3">
                                {attachments.length === 0 && (
                                    <div className="text-sm text-muted-foreground italic text-center py-4 bg-accent/20 rounded-xl border border-dashed border-border">
                                        No attachments added. Use $0, $1 in text if you add any.
                                    </div>
                                )}
                                {attachments.map((att, idx) => (
                                    <div key={idx} className="group relative flex flex-col gap-3 bg-card p-4 rounded-xl border border-border hover:border-primary/50 transition-colors">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs font-mono font-bold">
                                                    ${idx}
                                                </span>
                                                <select
                                                    value={att.type}
                                                    onChange={(e) => handleAttachmentChange(idx, 'type', e.target.value as any)}
                                                    className="h-8 text-sm px-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                                                >
                                                    {ATTACHMENT_TYPES.map(t => (
                                                        <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(idx)}
                                                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <input
                                            value={att.link}
                                            onChange={(e) => handleAttachmentChange(idx, 'link', e.target.value)}
                                            placeholder={att.type === 'youtube' ? "Video URL" : "Image/File URL"}
                                            className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-transparent focus:bg-background focus:border-primary outline-none transition-all text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {(type === 0 || type === 1) && (
                            <div className="space-y-4 pt-4 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <label className="text-base font-semibold">Answer Choices</label>
                                    <button type="button" onClick={addChoice} className="text-primary text-sm font-medium hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                        <Plus className="h-4 w-4" /> Add Choice
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {choices.map((choice, idx) => (
                                        <div key={idx} className="flex gap-3 items-center">
                                            <span className="text-muted-foreground font-mono text-sm w-4">{idx}</span>
                                            <input
                                                value={choice}
                                                onChange={(e) => handleChoiceChange(idx, e.target.value)}
                                                placeholder={`Option ${idx}`}
                                                className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeChoice(idx)}
                                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3 pt-4 border-t border-border">
                            <label htmlFor="ans" className="text-base font-semibold block">
                                Correct Answer
                            </label>

                            {(type === 0 || type === 1) ? (
                                <div className="space-y-2">
                                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-sm text-blue-800 flex gap-2">
                                        <HelpCircle className="h-5 w-5 shrink-0" />
                                        <span>
                                            {type === 0
                                                ? "Enter the index of the correct choice (e.g. '0' for the first option)."
                                                : "Enter comma-separated indices for correct choices (e.g. '0,2')."
                                            }
                                        </span>
                                    </div>
                                    <input
                                        id="ans"
                                        value={ans}
                                        onChange={(e) => setAns(e.target.value)}
                                        placeholder={type === 0 ? "e.g. 0" : "e.g. 0,2"}
                                        className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-mono tracking-wider"
                                        required
                                    />
                                </div>
                            ) : (
                                <textarea
                                    id="ans"
                                    value={ans}
                                    onChange={(e) => setAns(e.target.value)}
                                    placeholder="Enter the expected answer text..."
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none min-h-[100px] resize-none"
                                    required
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-3xl border border-border bg-card shadow-sm sticky top-6">
                        <h3 className="font-semibold text-lg mb-4">Settings</h3>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground">Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {QUESTION_TYPES.map((qType) => {
                                        const Icon = qType.icon;
                                        const isSelected = type === qType.value;
                                        return (
                                            <button
                                                key={qType.value}
                                                type="button"
                                                onClick={() => setType(qType.value)}
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-1.5 ${isSelected
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-border bg-background hover:bg-accent/50 text-muted-foreground"
                                                    }`}
                                            >
                                                <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "opacity-50"}`} />
                                                <span className="text-xs font-semibold text-center">{qType.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground">Difficulty</label>
                                <div className="flex bg-secondary/50 p-1 rounded-xl">
                                    {EASE_LEVELS.map((level) => {
                                        const isSelected = ease === level.value;
                                        return (
                                            <button
                                                key={level.value}
                                                type="button"
                                                onClick={() => setEase(level.value)}
                                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isSelected
                                                    ? "bg-background text-foreground shadow-sm"
                                                    : "text-muted-foreground hover:text-foreground"
                                                    }`}
                                            >
                                                {level.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Save className="h-5 w-5" />
                                    )}
                                    <span>Create Question</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="w-full px-6 py-3 rounded-xl border border-transparent hover:bg-accent text-sm font-medium transition-colors"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
