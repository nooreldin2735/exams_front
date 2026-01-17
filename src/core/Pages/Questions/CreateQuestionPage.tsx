import { useNavigate, useParams } from "react-router-dom";
import ApiService from "@/services/Api";
import { useNavigation } from "@/context/NavigationContext";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { QuestionForm } from "@/components/Questions/components/QuestionForm";
import type { Question } from "@/types/question";

export default function CreateQuestionPage() {
    const { yearId, termId, subjectId, lectureId } = useParams<{ yearId: string; termId: string; subjectId: string; lectureId: string }>();
    const navigate = useNavigate();
    const { setYear, setTerm, setSubject, setLecture, setCurrentPathTitle } = useNavigation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const handleSubmit = async (data: Question) => {
        if (!data.question.trim() || !data.answers.trim()) {
            setError("Both question text and answer are required");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await ApiService.post("/question/create", data);
            navigate(`/years/${yearId}/terms/${termId}/subjects/${subjectId}/lectures/${lectureId}/questions`);
        } catch (err: any) {
            setError(err.message || "Failed to create question");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
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

            {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
                    {error}
                </div>
            )}

            <QuestionForm
                onSubmit={handleSubmit}
                lectureId={parseInt(lectureId || "0")}
                loading={loading}
                onCancel={() => navigate(-1)}
            />
        </div>
    );
}
