import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, GraduationCap } from "lucide-react";
import { navigationData } from "@/data/navigationData";
import { SidebarItem } from "./SidebarItem";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

interface SidebarProps {
    onItemSelect?: (id: string, label: string) => void;
}

export function Sidebar({ onItemSelect }: SidebarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeId, setActiveId] = useState<string | null>(null);

    const shouldExpand = isExpanded || isPinned;

    const handleSelect = (id: string, label?: string) => { // Updated signature
        setActiveId(id);

        // Find the label if not provided (though SidebarItem passes only ID usually, let's look it up if needed)
        // Actually simplicity: Pass ID up, we can find it or just trust logic.
        // For now let's just use the ID as the key driver.

        if (onItemSelect) {
            onItemSelect(id, label || id); // Ideally look up, but for now ID is sufficient
        }
    };


    return (
        <>
            {/* Hover trigger zone when collapsed */}
            {!isPinned && (
                <div
                    className="fixed left-0 top-0 w-4 h-full z-40"
                    onMouseEnter={() => setIsExpanded(true)}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: shouldExpand ? 280 : 56,
                }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                }}
                onMouseEnter={() => !isPinned && setIsExpanded(true)}
                onMouseLeave={() => !isPinned && setIsExpanded(false)}
                className={cn(
                    "fixed left-0 top-0 h-full z-50",
                    "sidebar-glass",
                    "flex flex-col"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-border/50">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="h-4 w-4 text-primary" />
                        </div>
                        <AnimatePresence>
                            {shouldExpand && (
                                <motion.span
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -8 }}
                                    className="font-semibold text-sm whitespace-nowrap"
                                >
                                    Course Explorer
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Toggle button */}
                    <motion.button
                        onClick={() => setIsPinned(!isPinned)}
                        className={cn(
                            "p-1.5 rounded-md transition-colors",
                            "hover:bg-secondary text-muted-foreground hover:text-foreground",
                            isPinned && "bg-primary/10 text-primary"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isPinned ? (
                            <X className="h-4 w-4" />
                        ) : (
                            <Menu className="h-4 w-4" />
                        )}
                    </motion.button>
                </div>

                {/* Search */}
                <div className="p-3 border-b border-border/50">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        isExpanded={shouldExpand}
                    />
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-0.5 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                    {navigationData.map((item) => (
                        <SidebarItem
                            key={item.id}
                            item={item}
                            isExpanded={shouldExpand}
                            searchQuery={searchQuery}
                            activeId={activeId}
                            onSelect={(id) => handleSelect(id)}
                        />
                    ))}
                </nav>

                {/* Footer with Theme Toggle */}
                <div className="p-3 border-t border-border/50">
                    <ThemeToggle isExpanded={shouldExpand} />
                </div>
            </motion.aside>
        </>
    );
}
