import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, Video } from "lucide-react";
import ApiService from "@/services/Api";
import { useNavigation } from "@/context/NavigationContext";
import { useEffect } from "react";

export default function CreateLecturePage() {
    const { yearId, termId, subjectId } = useParams<{ yearId: string; termId: string; subjectId: string }>();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setYear, setTerm, setSubject, setCurrentPathTitle } = useNavigation();

    useEffect(() => {
        const fetchContext = async () => {
            setCurrentPathTitle("Add Lecture");
            if (!yearId || !termId || !subjectId) return;
            try {
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
            } catch (e) { console.error(e); }
        };
        fetchContext();
    }, [yearId, termId, subjectId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Lecture name is required");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await ApiService.post("/lectures/create", {
                name: name.trim(),
                subject_id: subjectId
            });

            // Redirect back to lectures list
            navigate(`/years/${yearId}/terms/${termId}/subjects/${subjectId}/lectures`);
        } catch (err: any) {
            setError(err.message || "Failed to create lecture");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Add Lecture</h2>
                    <p className="text-muted-foreground">Create a new lecture for this subject.</p>
                </div>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-card/40 shadow-xl backdrop-blur-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium ml-1">
                            Lecture Name
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <Video className="h-5 w-5" />
                            </div>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter lecture name (e.g., Intro to Algorithms)"
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-lg"
                                disabled={loading}
                            />
                        </div>
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
                            <span>Create Lecture</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
