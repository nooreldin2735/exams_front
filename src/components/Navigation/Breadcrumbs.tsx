import { useNavigate } from "react-router-dom";
import { ChevronRight, Home, Calendar, GraduationCap, Book, Presentation } from "lucide-react";
import { useNavigation } from "@/context/NavigationContext";
import { cn } from "@/lib/utils";

export function Breadcrumbs() {
    const navigate = useNavigate();
    const { year, term, subject, lecture, currentPathTitle } = useNavigation();

    const items = [
        { id: 'home', label: 'Home', icon: Home, path: '/' },
        ...(year ? [{ id: 'year', label: year.name, icon: Calendar, path: `/years/${year.id}` }] : []),
        ...(term ? [{ id: 'term', label: term.name, icon: GraduationCap, path: `/years/${year?.id}/terms/${term.id}/subjects` }] : []),
        ...(subject ? [{ id: 'subject', label: subject.name, icon: Book, path: `/years/${year?.id}/terms/${term?.id}/subjects/${subject.id}/lectures` }] : []),
        ...(lecture ? [{ id: 'lecture', label: lecture.name, icon: Presentation, path: `/years/${year?.id}/terms/${term?.id}/subjects/${subject?.id}/lectures/${lecture.id}/questions` }] : []),
    ];

    return (
        <nav className="flex items-center space-x-1 text-sm font-medium text-muted-foreground overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
            {items.map((item, index) => (
                <div key={item.id} className="flex items-center">
                    {index > 0 && <ChevronRight className="h-4 w-4 mx-1 opacity-40 shrink-0" />}
                    <button
                        onClick={() => navigate(item.path)}
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors hover:bg-secondary hover:text-foreground",
                            index === items.length - 1 && !currentPathTitle ? "text-foreground font-bold" : ""
                        )}
                    >
                        <item.icon className="h-3.5 w-3.5 shrink-0" />
                        <span>{item.label}</span>
                    </button>
                </div>
            ))}
            {currentPathTitle && (
                <div className="flex items-center">
                    <ChevronRight className="h-4 w-4 mx-1 opacity-40 shrink-0" />
                    <span className="px-2 py-1 text-foreground font-bold">
                        {currentPathTitle}
                    </span>
                </div>
            )}
        </nav>
    );
}
