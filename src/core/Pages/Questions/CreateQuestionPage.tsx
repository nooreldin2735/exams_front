import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, FileQuestion, MessageSquare, ListTodo, Plus, Trash2, Image, Video, Music, Youtube, HelpCircle, X, CheckCircle2 } from "lucide-react";
import ApiService from "@/services/Api";
import { useNavigation } from "@/context/NavigationContext";
import { motion, AnimatePresence } from "framer-motion";

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

    const editorRef = useRef<HTMLDivElement>(null);
    const [showAtMenu, setShowAtMenu] = useState(false);
    const [atMenuPos, setAtMenuPos] = useState({ top: 0, left: 0 });

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

    const [type, setType] = useState<number>(0);
    const [ans, setAns] = useState("");
    const [choices, setChoices] = useState<string[]>(["", ""]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [ease, setEase] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addChoice = () => setChoices([...choices, ""]);
    const removeChoice = (index: number) => {
        setChoices(choices.filter((_, i) => i !== index));
        // Also update ans to remove the index if it was selected, and shift others
        const currentIndices = ans.split(',').filter(x => x !== "").map(Number);
        const filtered = currentIndices.filter(i => i !== index).map(i => i > index ? i - 1 : i);
        setAns(filtered.join(','));
    };
    const handleChoiceChange = (index: number, value: string) => {
        const newChoices = [...choices];
        newChoices[index] = value;
        setChoices(newChoices);
    };

    const addAttachment = (type: Attachment['type'] = "img", link: string = "") => {
        const newAttachments = [...attachments, { type, link }];
        setAttachments(newAttachments);
        return newAttachments.length - 1;
    };

    const removeAttachment = (index: number) => setAttachments(attachments.filter((_, i) => i !== index));
    const handleAttachmentChange = (index: number, field: keyof Attachment, value: string) => {
        const newAttachments = [...attachments];
        newAttachments[index] = { ...newAttachments[index], [field]: value };
        setAttachments(newAttachments);
    };

    const getEditorText = useCallback(() => {
        if (!editorRef.current) return "";
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = editorRef.current.innerHTML;
        const chips = tempDiv.querySelectorAll('.attachment-chip');
        chips.forEach(chip => {
            const index = chip.getAttribute('data-index');
            chip.replaceWith(`$${index}`);
        });
        const brs = tempDiv.querySelectorAll('br');
        brs.forEach(br => br.replaceWith('\n'));
        return tempDiv.innerText || tempDiv.textContent || "";
    }, []);

    const handleInput = (_e: React.FormEvent<HTMLDivElement>) => {
        const selection = window.getSelection();
        if (!selection || !selection.focusNode) return;
        const range = selection.getRangeAt(0);
        const text = selection.focusNode.textContent || "";
        const offset = selection.focusOffset;

        if (text[offset - 1] === '@') {
            const rect = range.getBoundingClientRect();
            const editorRect = editorRef.current?.getBoundingClientRect();
            if (editorRect) {
                setAtMenuPos({
                    top: rect.bottom - editorRect.top + 5,
                    left: rect.left - editorRect.left
                });
            }
            setShowAtMenu(true);
        } else {
            setShowAtMenu(false);
        }
    };

    const insertChip = (index: number, _label: string, url: string) => {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        range.setStart(range.startContainer, Math.max(0, range.startOffset - 1));
        range.deleteContents();
        const chip = document.createElement('span');
        chip.className = "attachment-chip inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-bold text-sm border border-primary/20 cursor-default select-none shadow-sm transition-all hover:bg-primary/20";
        chip.setAttribute('data-index', index.toString());
        chip.setAttribute('title', `Link: ${url}`);
        chip.setAttribute('contenteditable', 'false');
        chip.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paperclip"><path d="M13.234 20.252 21 12.487a5 5 0 0 0-7.072-7.072l-8.554 8.553a3 3 0 0 0 4.242 4.242l6.121-6.122a1 1 0 0 0-1.414-1.414l-6.122 6.122a1 1 0 0 1-1.414-1.414l8.553-8.553a3 3 0 0 1 4.242 4.242l-7.765 7.766a5 5 0 0 1-7.072-7.072l1.415-1.414"></path></svg> Attachment ${index}`;
        range.insertNode(chip);
        const space = document.createTextNode('\u00A0');
        range.collapse(false);
        range.insertNode(space);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        if (editorRef.current) editorRef.current.focus();
    };

    const handleInsertShortcut = (attType: Attachment['type']) => {
        const url = window.prompt(`Enter ${attType} URL:`, "");
        if (url === null) {
            setShowAtMenu(false);
            return;
        }
        const newIdx = addAttachment(attType, url.trim());
        insertChip(newIdx, attType, url.trim());
        setShowAtMenu(false);
    };

    const handleToggleAnswer = (index: number) => {
        let currentIndices = ans.split(',').filter(x => x !== "").map(Number);

        if (type === 0) { // MCQ (One)
            setAns(index.toString());
        } else if (type === 1) { // MCQ (Multi)
            if (currentIndices.includes(index)) {
                currentIndices = currentIndices.filter(i => i !== index);
            } else {
                currentIndices.push(index);
            }
            setAns(currentIndices.sort((a, b) => a - b).join(','));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = getEditorText();

        if (!text.trim() || !ans.trim()) {
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
                question: text.trim(),
                questionType: type,
                choices: validChoices && validChoices.length > 0 ? validChoices : null,
                answers: ans.trim(),
                ease: ease,
                attachments: validAttachments.length > 0 ? validAttachments : null,
                lecture_id: parseInt(lectureId || "0"),
                sectionName: null
            };
            console.log(payload);
            await ApiService.post("/question/create", payload);
            navigate(`/years/${yearId}/terms/${termId}/subjects/${subjectId}/lectures/${lectureId}/questions`);
        } catch (err: any) {
            setError(err.message || "Failed to create question");
        } finally {
            setLoading(false);
        }
    };

    const selectedAnsIndices = ans.split(',').filter(x => x !== "").map(Number);

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-10">
            <style>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #94a3b8;
                    cursor: text;
                }
                .attachment-chip {
                    display: inline-flex;
                    align-items: center;
                    vertical-align: middle;
                    user-select: none;
                }
                .attachment-chip svg {
                    flex-shrink: 0;
                }
            `}</style>

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
                                            <li>Visual <strong>Attachment Chips</strong> represent <code>$N</code> references.</li>
                                            <li>Use <code>#$</code> for a literal dollar sign.</li>
                                            <li><span className="text-primary font-bold">Fast Add:</span> Type <code>@</code> inside the text area!</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <div
                                    ref={editorRef}
                                    id="textUrl"
                                    contentEditable
                                    onInput={handleInput}
                                    data-placeholder="Enter your question here... (Type @ for attachment shortcuts)"
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-lg min-h-[140px] max-h-[300px] overflow-y-auto rich-editor"
                                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                                />

                                <AnimatePresence>
                                    {showAtMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            className="absolute z-50 bg-popover border border-border shadow-2xl rounded-2xl p-2 w-48 overflow-hidden"
                                            style={{ top: atMenuPos.top, left: atMenuPos.left }}
                                        >
                                            <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-border">
                                                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Add Attachment</span>
                                                <button type="button" onClick={() => setShowAtMenu(false)} className="hover:bg-accent p-0.5 rounded">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <div className="space-y-1">
                                                {ATTACHMENT_TYPES.map((type) => {
                                                    const Icon = type.icon;
                                                    return (
                                                        <button
                                                            key={type.value}
                                                            type="button"
                                                            onClick={() => handleInsertShortcut(type.value)}
                                                            className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-primary/10 hover:text-primary rounded-xl transition-colors group text-left"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                                <Icon className="h-4 w-4" />
                                                            </div>
                                                            <span className="font-medium">{type.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-base font-semibold">Attachments List</label>
                                <button type="button" onClick={() => addAttachment()} className="text-primary text-sm font-medium hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                    <Plus className="h-4 w-4" /> Add
                                </button>
                            </div>
                            <div className="space-y-3">
                                {attachments.length === 0 && (
                                    <div className="text-sm text-muted-foreground italic text-center py-4 bg-accent/20 rounded-xl border border-dashed border-border">
                                        No attachments added. Type @ in text area to add interactive chips.
                                    </div>
                                )}
                                {attachments.map((att, idx) => (
                                    <div key={idx} className="group relative flex flex-col gap-3 bg-card p-4 rounded-xl border border-border hover:border-primary/50 transition-colors">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs font-mono font-bold shadow-sm border border-primary/10">
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
                                            className="w-full px-3 py-2 rounded-lg bg-secondary/30 border border-transparent focus:bg-background focus:border-primary outline-none transition-all text-sm shadow-inner"
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
                                                className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm"
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

                        <div className="space-y-4 pt-6 border-t border-border">
                            <div className="flex items-center justify-between">
                                <label className="text-base font-semibold block">
                                    Correct Answer(s)
                                </label>
                                {(type === 0 || type === 1) && (
                                    <span className="text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded-full">
                                        Select from choices above
                                    </span>
                                )}
                            </div>

                            {(type === 0 || type === 1) ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {choices.map((choice, idx) => {
                                        const isSelected = selectedAnsIndices.includes(idx);
                                        const isEmpty = !choice.trim();

                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleToggleAnswer(idx)}
                                                disabled={isEmpty}
                                                className={cn(
                                                    "group relative flex items-center gap-3 p-4 rounded-2xl border transition-all text-left",
                                                    isSelected
                                                        ? "border-green-500 bg-green-500/5 text-green-900 shadow-sm"
                                                        : "border-border bg-background hover:border-primary/30 text-muted-foreground",
                                                    isEmpty && "opacity-50 cursor-not-allowed grayscale"
                                                )}
                                            >
                                                <div className={cn(
                                                    "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border shadow-xs transition-colors",
                                                    isSelected ? "bg-green-500 text-white border-green-400" : "bg-secondary text-muted-foreground border-border"
                                                )}>
                                                    {idx}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold truncate">
                                                        {isEmpty ? "Empty Choice" : choice}
                                                    </p>
                                                </div>
                                                {isSelected && (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <textarea
                                    id="ans"
                                    value={ans}
                                    onChange={(e) => setAns(e.target.value)}
                                    placeholder="Enter the expected answer text..."
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none min-h-[100px] resize-none shadow-sm"
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
                                                onClick={() => {
                                                    setType(qType.value);
                                                    setAns(""); // Reset answer when type changes to prevent index issues
                                                }}
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-1.5 ${isSelected
                                                    ? "border-primary bg-primary/5 text-primary shadow-sm"
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
// Helper to use cn (added back since it can be useful)
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
