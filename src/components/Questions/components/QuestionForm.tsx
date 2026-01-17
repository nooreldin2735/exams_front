import { useState, useRef, useCallback, useEffect } from "react";
import { HelpCircle, Trash2, Plus, X, Image, Video, Music, Youtube, CheckCircle2, Save, Loader2, ListTodo, MessageSquare, FileQuestion } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Question, Attachment } from "@/types/question";

interface QuestionFormProps {
    onSubmit: (data: Question) => void;
    lectureId: number | null;
    initialData?: Partial<Question>;
    isModal?: boolean;
    onCancel?: () => void;
    loading?: boolean;
}

const QUESTION_TYPES = [
    { value: 0, label: "MCQ (One Answer)", icon: ListTodo, color: "text-blue-500", bg: "bg-blue-50" },
    { value: 1, label: "MCQ (Multi Answer)", icon: ListTodo, color: "text-indigo-500", bg: "bg-indigo-50" },
    { value: 2, label: "Written", icon: MessageSquare, color: "text-green-500", bg: "bg-green-50" },
    { value: 3, label: "Complex", icon: FileQuestion, color: "text-purple-500", bg: "bg-purple-50" },
] as const;

const EASE_LEVELS = [
    { value: 1, label: "Easy", color: "text-green-600", bg: "bg-green-100" },
    { value: 2, label: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" },
    { value: 3, label: "Hard", color: "text-red-600", bg: "bg-red-100" },
] as const;

const ATTACHMENT_TYPES = [
    { value: "img", label: "Image", icon: Image },
    { value: "video", label: "Video", icon: Video },
    { value: "audio", label: "Audio", icon: Music },
    { value: "youtube", label: "YouTube", icon: Youtube },
] as const;

export function QuestionForm({ onSubmit, lectureId, initialData, isModal, onCancel, loading }: QuestionFormProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [showAtMenu, setShowAtMenu] = useState(false);
    const [atMenuPos, setAtMenuPos] = useState({ top: 0, left: 0 });

    const [type, setType] = useState<number>(initialData?.questionType ?? 0);
    const [ans, setAns] = useState(initialData?.answers ?? "");
    const [choices, setChoices] = useState<string[]>(initialData?.choices ?? ["", ""]);
    const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments ?? []);
    const [ease, setEase] = useState<number>(initialData?.ease ?? 1);
    const [sectionName, setSectionName] = useState(initialData?.sectionName ?? "");
    const [degree, setDegree] = useState<number>(initialData?.degree ?? 1);

    // Initialize editor content if editing
    useEffect(() => {
        if (editorRef.current && initialData?.question && editorRef.current.innerText === "") {
            // Simple mapping back: $N to chips
            let html = initialData.question.replace(/#\$/g, '[[DOLLAR]]');
            attachments.forEach((att: Attachment, idx: number) => {
                const chipHtml = `<span class="attachment-chip inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-bold text-sm border border-primary/20 cursor-default select-none shadow-sm transition-all hover:bg-primary/20" data-index="${idx}" title="Link: ${att.link}" contenteditable="false"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paperclip"><path d="M13.234 20.252 21 12.487a5 5 0 0 0-7.072-7.072l-8.554 8.553a3 3 0 0 0 4.242 4.242l6.121-6.122a1 1 0 0 0-1.414-1.414l-6.122 6.122a1 1 0 0 1-1.414-1.414l8.553-8.553a3 3 0 0 1 4.242 4.242l-7.765 7.766a5 5 0 0 1-7.072-7.072l1.415-1.414"></path></svg> Attachment ${idx}</span>`;
                html = html.replace(new RegExp(`\\$${idx}`, 'g'), chipHtml);
            });
            html = html.replace(/\[\[DOLLAR\]\]/g, '#$');
            editorRef.current.innerHTML = html;
        }
    }, []);

    const addChoice = () => setChoices([...choices, ""]);
    const removeChoice = (index: number) => {
        setChoices(choices.filter((_: string, i: number) => i !== index));
        const currentIndices = ans.split(',').filter((x: string) => x !== "").map(Number);
        const filtered = currentIndices.filter((i: number) => i !== index).map((i: number) => i > index ? i - 1 : i);
        setAns(filtered.join(','));
    };
    const handleChoiceChange = (index: number, value: string) => {
        const newChoices = [...choices];
        newChoices[index] = value;
        setChoices(newChoices);
    };

    const addAttachment = (attType: Attachment['type'] = "img", link: string = "") => {
        const newAttachments = [...attachments, { type: attType, link }];
        setAttachments(newAttachments);
        return newAttachments.length - 1;
    };

    const removeAttachment = (index: number) => setAttachments(attachments.filter((_: Attachment, i: number) => i !== index));
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
        let currentIndices = ans.split(',').filter((x: string) => x !== "").map(Number);

        if (type === 0) { // MCQ (One)
            setAns(index.toString());
        } else if (type === 1) { // MCQ (Multi)
            if (currentIndices.includes(index)) {
                currentIndices = currentIndices.filter((i: number) => i !== index);
            } else {
                currentIndices.push(index);
            }
            setAns(currentIndices.sort((a: number, b: number) => a - b).join(','));
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const text = getEditorText();

        const validChoices = (type === 0 || type === 1)
            ? choices.filter((c: string) => c.trim() !== "")
            : null;

        const validAttachments = attachments
            .map((a: Attachment) => ({ ...a, link: a.link.trim() }))
            .filter((a: Attachment) => a.link !== "");

        onSubmit({
            question: text.trim(),
            questionType: type,
            choices: validChoices && validChoices.length > 0 ? validChoices : null,
            answers: ans.trim(),
            ease: ease,
            attachments: validAttachments.length > 0 ? validAttachments : null,
            lecture_id: lectureId,
            sectionName: sectionName || null,
            degree: degree
        });
    };

    const selectedAnsIndices = ans.split(',').filter((x: string) => x !== "").map(Number);
    const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

    return (
        <form onSubmit={handleFormSubmit} className={cn("space-y-8", isModal && "max-h-[80vh] overflow-y-auto px-1")}>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-3xl border border-border bg-card/40 shadow-sm backdrop-blur-md space-y-6">
                        {/* Section Name (New field) */}
                        <div className="space-y-3">
                            <label className="text-base font-semibold">Section Name (Optional)</label>
                            <input
                                value={sectionName}
                                onChange={(e) => setSectionName(e.target.value)}
                                placeholder="e.g. MCQ, Section A, etc."
                                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-base font-semibold">Question Text</label>
                                <div className="group relative flex items-center gap-1 text-xs text-muted-foreground cursor-help bg-accent/50 px-2 py-1 rounded-full">
                                    <HelpCircle className="h-3 w-3" />
                                    <span>Syntax Help</span>
                                    <div className="absolute right-0 top-full mt-2 w-72 p-4 rounded-xl bg-popover border border-border shadow-xl text-popover-foreground text-xs hidden group-hover:block z-50">
                                        <p className="font-bold mb-2 text-sm">Formatting Guide:</p>
                                        <ul className="list-disc pl-4 space-y-2">
                                            <li>Visual <strong>Attachment Chips</strong> represent <code>$N</code> references.</li>
                                            <li>Use <code>#$</code> for a literal dollar sign.</li>
                                            <li><span className="text-primary font-bold">Fast Add:</span> Type <code>@</code> inside!</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <div
                                    ref={editorRef}
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
                                                {ATTACHMENT_TYPES.map((attType) => {
                                                    const Icon = attType.icon;
                                                    return (
                                                        <button
                                                            key={attType.value}
                                                            type="button"
                                                            onClick={() => handleInsertShortcut(attType.value)}
                                                            className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-primary/10 hover:text-primary rounded-xl transition-colors group text-left"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                                <Icon className="h-4 w-4" />
                                                            </div>
                                                            <span className="font-medium">{attType.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Attachments List */}
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
                                        No attachments. Type @ in text area to add.
                                    </div>
                                )}
                                {attachments.map((att, idx) => (
                                    <div key={idx} className="group relative flex flex-col gap-3 bg-card p-4 rounded-xl border border-border hover:border-primary/50 transition-colors">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-xs font-mono font-bold border border-primary/10">
                                                    ${idx}
                                                </span>
                                                <select
                                                    value={att.type}
                                                    onChange={(e) => handleAttachmentChange(idx, 'type', e.target.value as any)}
                                                    className="h-8 text-sm px-2 rounded-lg bg-background border border-border outline-none"
                                                >
                                                    {ATTACHMENT_TYPES.map(t => (
                                                        <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button type="button" onClick={() => removeAttachment(idx)} className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <input
                                            value={att.link}
                                            onChange={(e) => handleAttachmentChange(idx, 'link', e.target.value)}
                                            placeholder="URL"
                                            className="w-full px-3 py-2 rounded-lg bg-secondary/30 border border-transparent focus:bg-background focus:border-primary outline-none transition-all text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Choices */}
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
                                                className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none"
                                            />
                                            <button type="button" onClick={() => removeChoice(idx)} className="p-2 text-muted-foreground hover:text-destructive rounded-lg transition-colors">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 pt-6 border-t border-border">
                            <label className="text-base font-semibold block">Correct Answer(s)</label>
                            {(type === 0 || type === 1) ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {choices.map((choice, idx) => {
                                        const isSelected = selectedAnsIndices.includes(idx);
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleToggleAnswer(idx)}
                                                className={cn(
                                                    "flex items-center gap-3 p-4 rounded-2xl border transition-all text-left",
                                                    isSelected ? "border-green-500 bg-green-500/5 text-green-900" : "border-border bg-background"
                                                )}
                                            >
                                                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border", isSelected ? "bg-green-500 text-white border-green-400" : "bg-secondary text-muted-foreground border-border")}>
                                                    {idx}
                                                </div>
                                                <span className="text-sm font-semibold truncate">{choice || "Empty Choice"}</span>
                                                {isSelected && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <textarea
                                    value={ans}
                                    onChange={(e) => setAns(e.target.value)}
                                    placeholder="Answer text..."
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none min-h-[100px] resize-none"
                                    required
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
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
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-1.5 ${isSelected ? "border-primary bg-primary/5 text-primary" : "border-border bg-background"}`}
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
                                    {EASE_LEVELS.map((level) => (
                                        <button
                                            key={level.value}
                                            type="button"
                                            onClick={() => setEase(level.value)}
                                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${ease === level.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                                        >
                                            {level.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground">Degree (Points)</label>
                                <input
                                    type="number"
                                    value={degree}
                                    onChange={(e) => setDegree(Number(e.target.value))}
                                    min={0}
                                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary transition-all outline-none"
                                    placeholder="e.g. 1"
                                />
                            </div>

                            <div className="pt-4 border-t border-border flex flex-col gap-3">
                                <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:brightness-110">
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                    <span>{isModal ? "Add Question" : "Create Question"}</span>
                                </button>
                                {onCancel && (
                                    <button type="button" onClick={onCancel} className="w-full px-3 py-3 rounded-xl border border-transparent hover:bg-accent text-sm font-medium">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
