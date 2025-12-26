import { YearsList } from "@/components/Years/YearsList";

export default function YearsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight">Academic Years</h2>
                <p className="text-muted-foreground">
                    Browse and manage all registered academic years.
                </p>
            </div>
            <div className="p-6 rounded-2xl border border-border bg-card/50 shadow-sm backdrop-blur-sm">
                <YearsList onYearSelect={(year) => console.log("Selected:", year)} />
            </div>
        </div>
    );
}
