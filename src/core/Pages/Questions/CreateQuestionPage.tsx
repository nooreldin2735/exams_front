import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, FileQuestion, MessageSquare, ListTodo, Plus, Trash2, Image, Video, Music, Youtube, HelpCircle } from "lucide-react";
import ApiService from "@/services/Api";
import { useNavigation } from "@/context/NavigationContext";
import { useEffect } from "react";

const QUESTION_TYPES = [
    { value: "0", label: "MCQ", icon: ListTodo, color: "text-blue-500", bg: "bg-blue-50" },
    { value: "1", label: "Written", icon: MessageSquare, color: "text-green-500", bg: "bg-green-50" },
    { value: "2", label: "Complex", icon: FileQuestion, color: "text-purple-500", bg: "bg-purple-50" },
];

interface Attachment {
    type: "img" | "video" | "audio" | "youtube";
    link: string;
}

const ATTACHMENT_TYPES = [
    { value: "img", label: "Image", icon: Image },
    { value: "video", label: "Video", icon: Video },
    { value: "audio", label: "Audio", icon: Music },
    { value: "youtube", label: "YouTube", icon: Youtube },
];

export default function CreateQuestionPage() {
    const { yearId, termId, subjectId, lectureId } = useParams<{ yearId: string; termId: string; subjectId: string; lectureId: string }>();
    const navigate = useNavigate();
    const { setYear, setTerm, setSubject, setLecture, setCurrentPathTitle } = useNavigation();

    useEffect(() => {
        const fetchContext = async () => {
            setCurrentPathTitle("Add Question");
            if (!yearId || !termId || !subjectId || !lectureId) return;
            try {
                // Fetch Year & Term & Subject (Similar to others, can we refactor? duplicating logic for now)
                // In production, I would make a helper or custom hook, but for now explicit is safer.
                // Fetch Year
                const years = await ApiService.get<any[]>("/years");
                const yList = Array.isArray(years) ? years : (years as any).list;
                const foundYear = yList.find((y: any) => y.ID.toString() === yearId);
                if (foundYear) setYear({ id: foundYear.ID, name: foundYear.Name });
                else setYear({ id: yearId, name: `Year ${yearId}` });

                // Fetch Term
                const terms = await ApiService.get<any[]>(`/terms?year_id=${yearId}`);
                const tList = Array.isArray(terms) ? terms : (terms as any).list;
                const foundTerm = tList.find((t: any) => t.ID.toString() === termId);
                if (foundTerm) setTerm({ id: foundTerm.ID, name: foundTerm.Name });
                else setTerm({ id: termId, name: `Term ${termId}` });

                // Fetch Subject
                const subjects = await ApiService.get<any[]>(`/subjects?term_id=${termId}`);
                const sList = Array.isArray(subjects) ? subjects : (subjects as any).list;
                const foundSubject = sList.find((s: any) => s.ID.toString() === subjectId);
                if (foundSubject) setSubject({ id: foundSubject.ID, name: foundSubject.Name });
                else setSubject({ id: subjectId, name: `Subject ${subjectId}` });

                // Fetch Lecture
                const lectures = await ApiService.get<any[]>(`/lectures?subject_id=${subjectId}`);
                const lList = Array.isArray(lectures) ? lectures : (lectures as any).list;
                const foundLecture = lList.find((l: any) => l.ID.toString() === lectureId);
                if (foundLecture) setLecture({ id: foundLecture.ID, name: foundLecture.Name });
                else setLecture({ id: lectureId, name: `Lecture ${lectureId}` });

            } catch (e) { console.error(e); }
        };
        fetchContext();
    }, [yearId, termId, subjectId, lectureId]);

    const [textUrl, setTextUrl] = useState("");
    const [type, setType] = useState("0");
    const [ans, setAns] = useState("");
    const [choices, setChoices] = useState<string[]>(["", "", "", ""]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [ease, setEase] = useState(2);

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

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!textUrl.trim() || !ans.trim()) {
            setError("Both question text and answer are required");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Format Answers
            // For MCQ (0 or 1), answer should be index/indices.
            // But user currently types text in 'ans'.
            // For now, let's keep it simple: WE TRUST THE USER TO TYPE "0" or "0,2" in the answer field for MCQs if that's what they want.
            // OR we could try to validate/map it.
            // Given the prompt didn't ask for a UI to select the correct choice, just "Add 'Choices' list",
            // I will leave the Answer field as a text input but add a helper hint.

            const payload = {
                title: `Question Entry - ${new Date().toISOString().split('T')[0]}`,
                lecture_id: parseInt(lectureId || "0"),
                subject_id: parseInt(subjectId || "0"),
                questions: [
                    {
                        sectionName: "General",
                        question: textUrl.trim(), // User must handle #$ escaping manually as per plan
                        questionType: parseInt(type),
                        answers: ans.trim(),
                        ease: ease,
                        choices: (type === "0" || type === "1") ? choices.filter(c => c.trim() !== "") : null,
                        attachments: attachments.map((a) => ({ ...a, link: a.link.trim() })).filter(a => a.link !== "")

                    }
                ],
                settings: {
                    Locations: null,
                    PassKey: "kill",
                    PreventOtherTabs: true,
                    Duration_min: 60,
                    AutoCorrect: true,
                    QuestionByQuestion: false,
                    ShareWith: 0,
                    AllowDownload: false,
                    StartAt: new Date().toISOString(),
                    EndAt: new Date(Date.now() + 3600000).toISOString() // +1 hour
                }
            };

            await ApiService.post("/question/create", payload);

            // Redirect back to questions list
            navigate(`/years/${yearId}/terms/${termId}/subjects/${subjectId}/lectures/${lectureId}/questions`);
        } catch (err: any) {
            setError(err.message || "Failed to create question");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Add Question</h2>
                    <p className="text-muted-foreground">Create a new question for this lecture.</p>
                </div>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-card/40 shadow-xl backdrop-blur-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Question Type Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium ml-1">Question Type</label>
                        <div className="grid grid-cols-3 gap-4">
                            {QUESTION_TYPES.map((qType) => {
                                const Icon = qType.icon;
                                const isSelected = type === qType.value;
                                return (
                                    <button
                                        key={qType.value}
                                        type="button"
                                        onClick={() => setType(qType.value)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${isSelected
                                            ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                                            : "border-border bg-transparent hover:border-border/80"
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? qType.bg : "bg-secondary"}`}>
                                            <Icon className={`h-6 w-6 ${isSelected ? qType.color : "text-muted-foreground"}`} />
                                        </div>
                                        <span className={`text-sm font-bold ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                                            {qType.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Ease Level */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Difficulty (Ease)</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="5"
                                step="1"
                                value={ease}
                                onChange={(e) => setEase(parseInt(e.target.value))}
                                className="w-full max-w-sm"
                            />
                            <span className="font-bold text-lg text-primary">{ease}</span>
                        </div>
                    </div>

                    {/* Choices (Only for MCQ) */}
                    {(type === "0" || type === "1") && (
                        <div className="space-y-4 border-t border-border pt-6">
                            <div className="flex items-center justify-between">
                                <label className="text-lg font-bold">Choices</label>
                                <button type="button" onClick={addChoice} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                                    <Plus className="h-4 w-4" /> Add Choice
                                </button>
                            </div>
                            <div className="space-y-3">
                                {choices.map((choice, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <div className="flex items-center justify-center w-8 font-mono text-muted-foreground">{idx}</div>
                                        <input
                                            value={choice}
                                            onChange={(e) => handleChoiceChange(idx, e.target.value)}
                                            placeholder={`Choice ${idx + 1}`}
                                            className="flex-1 px-4 py-2 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeChoice(idx)}
                                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Attachments */}
                    <div className="space-y-4 border-t border-border pt-6">
                        <div className="flex items-center justify-between">
                            <label className="text-lg font-bold">Attachments</label>
                            <button type="button" onClick={addAttachment} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                                <Plus className="h-4 w-4" /> Add Attachment
                            </button>
                        </div>
                        <div className="space-y-3">
                            {attachments.map((att, idx) => (
                                <div key={idx} className="flex gap-2 items-start flex-col sm:flex-row bg-card/50 p-3 rounded-xl border border-border/50">
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <div className="flex items-center justify-center w-8 pt-2 font-mono text-muted-foreground self-start">{`$${idx}`}</div>
                                        <select
                                            value={att.type}
                                            onChange={(e) => handleAttachmentChange(idx, 'type', e.target.value as any)}
                                            className="h-10 px-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                                        >
                                            {ATTACHMENT_TYPES.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <input
                                        value={att.link}
                                        onChange={(e) => handleAttachmentChange(idx, 'link', e.target.value)}
                                        placeholder="Attachment URL (e.g. image link, youtube url)"
                                        className="flex-1 w-full h-10 px-4 rounded-lg bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeAttachment(idx)}
                                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors self-end sm:self-auto"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Question Text */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="textUrl" className="text-sm font-medium ml-1">
                                Question Text
                            </label>
                            <div className="group relative flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                                <HelpCircle className="h-3 w-3" />
                                <span>Syntax Help</span>
                                <div className="absolute bottom-full right-0 mb-2 w-64 p-3 rounded-xl bg-popover border border-border shadow-lg text-popover-foreground text-xs hidden group-hover:block z-50">
                                    <p className="font-bold mb-1">Special Characters:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li><code>$</code> is a control character.</li>
                                        <li>Use <code>#$</code> for a literal dollar sign (e.g. Price is #$10).</li>
                                        <li>Attachments are indexed as <code>$0</code>, <code>$1</code> etc.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <textarea
                            id="textUrl"
                            value={textUrl}
                            onChange={(e) => setTextUrl(e.target.value)}
                            placeholder="Enter the question text... Use $i for attachments."
                            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-lg min-h-[120px] resize-none"
                            disabled={loading}
                        />
                    </div>

                    {/* Answer Text */}
                    <div className="space-y-2">
                        <label htmlFor="ans" className="text-sm font-medium ml-1">
                            Correct Answer
                        </label>
                        <p className="text-xs text-muted-foreground ml-1 mb-1">
                            {(type === "0" || type === "1")
                                ? "For MCQ, enter the 0-based index of the correct choice (e.g. '0' for first choice, '0,2' for multiple)."
                                : "Enter the text answer."}
                        </p>
                        <textarea
                            id="ans"
                            value={ans}
                            onChange={(e) => setAns(e.target.value)}
                            placeholder={(type === "0" || type === "1") ? "0" : "Enter correct answer..."}
                            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-lg min-h-[80px] resize-none"
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 px-6 py-3 rounded-xl border border-border font-semibold hover:bg-accent transition-all active:scale-95"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Save className="h-5 w-5" />
                            )}
                            <span>Create Question</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
