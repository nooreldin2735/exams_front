import { useParams, useNavigate } from "react-router-dom";
import { LecturesList } from "@/components/Lectures/LecturesList";
import { PlusCircle } from "lucide-react";
import { useNavigation } from "@/context/NavigationContext";
import { useEffect } from "react";
import ApiService from "@/services/Api";

export default function LecturesPage() {
    const { yearId, termId, subjectId } = useParams<{ yearId: string; termId: string; subjectId: string }>();
    const navigate = useNavigate();
    const { setYear, setTerm, setSubject, setCurrentPathTitle } = useNavigation();

    useEffect(() => {
        const fetchContext = async () => {
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

            } catch (e) {
                console.error(e);
            }
        };

        fetchContext();
        setCurrentPathTitle("Lectures");
    }, [yearId, termId, subjectId]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Lectures</h2>
                    <p className="text-muted-foreground italic">
                        Manage lectures for this subject.
                    </p>
                </div>

                <button
                    onClick={() => navigate(`/years/${yearId}/terms/${termId}/subjects/${subjectId}/lectures/create`)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20"
                >
                    <PlusCircle className="h-5 w-5" />
                    <span>Add Lecture</span>
                </button>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-card/40 shadow-xl backdrop-blur-md">
                {subjectId && (
                    <LecturesList
                        subjectId={subjectId}
                    />
                )}
            </div>
        </div>
    );
}
