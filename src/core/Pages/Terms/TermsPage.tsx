import { useParams } from "react-router-dom";
import { TermsList } from "@/components/Terms/TermsList";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { useNavigation } from "@/context/NavigationContext";
import { useEffect } from "react";
import ApiService from "@/services/Api";

export default function TermsPage() {
    const { yearId } = useParams<{ yearId: string }>();
    const navigate = useNavigate();
    const { setYear, setCurrentPathTitle } = useNavigation();

    useEffect(() => {
        const fetchYearValues = async () => {
            if (!yearId) return;
            try {
                // We need an endpoint to get single year or we can get from list if cached/available
                // For now, let's fetch lists or assume we can get it.
                // Since there is no "get single year" endpoint documented, we might need to filter from list
                // OR just use the ID if name isn't critical immediately, but user asked for "Year Name"
                // Let's assume /years returns list and we find it.
                const years = await ApiService.get<any[]>("/years");
                const list = Array.isArray(years) ? years : (years as any).list;
                const foundYear = list.find((y: any) => y.ID.toString() === yearId);

                if (foundYear) {
                    setYear({ id: foundYear.ID, name: foundYear.Name });
                } else {
                    setYear({ id: yearId, name: `Year ${yearId}` });
                }
            } catch (e) {
                console.error(e);
                setYear({ id: yearId, name: `Year ${yearId}` });
            }
        };

        fetchYearValues();
        setCurrentPathTitle("Terms");
    }, [yearId]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="space-y-1">
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
                    {yearId && <TermsList yearId={yearId} />}
                </div>
            </div>
        </div>

    );
}
