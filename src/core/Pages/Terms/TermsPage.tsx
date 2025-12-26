import { useParams } from "react-router-dom";
import { TermsList } from "@/components/Terms/TermsList";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Calendar } from "lucide-react";

export default function TermsPage() {
    const { yearId } = useParams<{ yearId: string }>();
    const navigate = useNavigate();

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <Calendar className="h-4 w-4" />
                        <span>Year ID: {yearId}</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Academic Terms</h2>
                    <p className="text-muted-foreground italic">
                        Select a term to view subjects or add a new one.
                    </p>
                </div>

                <button
                    onClick={() => navigate(`/create-term?year_id=${yearId}`)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20"
                >
                    <PlusCircle className="h-5 w-5" />
                    <span>Add Term</span>
                </button>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-card/40 shadow-xl backdrop-blur-md">
                {yearId && <TermsList yearId={yearId} onTermSelect={(term) => console.log("Term:", term)} />}
            </div>
        </div>
    );
}
