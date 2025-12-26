import { useParams, useNavigate } from "react-router-dom";
import { SubjectsList } from "@/components/Subjects/SubjectsList";
import { PlusCircle, Calendar, GraduationCap } from "lucide-react";

export default function SubjectsPage() {
    const { yearId, termId } = useParams<{ yearId: string; termId: string }>();
    const navigate = useNavigate();

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-4 text-primary font-medium text-sm">
                        <button
                            onClick={() => navigate('/years')}
                            className="flex items-center gap-1 hover:bg-primary/10 px-2 py-1 rounded-md transition-colors"
                            title="Back to Years"
                        >
                            <Calendar className="h-4 w-4" />
                            <span>Year: {yearId}</span>
                        </button>
                        <button
                            onClick={() => navigate(`/years/${yearId}`)}
                            className="flex items-center gap-1 hover:bg-primary/10 px-2 py-1 rounded-md transition-colors"
                            title="Back to Terms"
                        >
                            <GraduationCap className="h-4 w-4" />
                            <span>Term: {termId}</span>
                        </button>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Subjects</h2>
                    <p className="text-muted-foreground italic">
                        Manage course subjects for this term.
                    </p>
                </div>

                <button
                    onClick={() => navigate(`/create-subject?year_id=${yearId}&term_id=${termId}`)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20"
                >
                    <PlusCircle className="h-5 w-5" />
                    <span>Add Subject</span>
                </button>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-card/40 shadow-xl backdrop-blur-md">
                {yearId && termId && (
                    <SubjectsList
                        yearId={yearId}
                        termId={termId}
                        onSubjectSelect={(subject) => console.log("Subject:", subject)}
                    />
                )}
            </div>
        </div>
    );
}
