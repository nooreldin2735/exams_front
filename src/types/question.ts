export interface Attachment {
    type: "img" | "video" | "audio" | "youtube" | "link";
    link: string;
    title?: string;
    thumbnail?: string;
}

export interface Question {
    ID?: number;
    id?: number;
    question: string;
    questionType: number; // 0: MCQ_ONE, 1: MCQ_MORE, 2: WRITTEN, 3: COMPLEX
    answers: string;
    choices?: string[] | null;
    ease?: number;
    lecture_id: number | null;
    attachments?: Attachment[] | null;
    sectionName?: string | null;
    degree?: number | null;
    isExisting?: boolean;
    // UI-specific or mapped fields if needed
    difficulty?: "easy" | "medium" | "hard";
    category?: string;
}

export interface ExamSettings {
    Locations: string[] | null;
    PassKey: string;
    PreventOtherTabs: boolean;
    Duration_min: number;
    AutoCorrect: boolean;
    QuestionByQuestion: boolean;
    ShareWith: number;
    AllowDownload: boolean;
    StartAt: string;
    EndAt: string;
}

export interface ExamSummary {
    ID: number;
    Title: string;
    CreatedAt: string;
    Subject_id: number;
    Owner_id: number;
    PreventOtherTabs: boolean;
    Duration_min: number;
    AutoCorrect: boolean;
    QuestionByQuestion: boolean;
    ShareWith: number;
    AllowDownLoad: boolean;
    StartAt: string | null;
    EndAt: string | null;
}

export interface CreateExamPayload {
    title: string;
    subject_id: number;
    questions: (Question | number)[]; // Can be full objects or IDs of existing questions
    settings: ExamSettings;
}
