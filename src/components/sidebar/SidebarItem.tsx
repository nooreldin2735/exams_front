import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    Calendar,
    Folder,
    Book,
    File,
    FileText,
    Video,
    Clipboard,
    Library,
    Home,
    List,
    PlusCircle,
} from "lucide-react";
import type { NavigationItem } from "@/data/navigationData";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    calendar: Calendar,
    folder: Folder,
    book: Book,
    file: File,
    "file-text": FileText,
    video: Video,
    clipboard: Clipboard,
    library: Library,
    code: FileText, // Default mapping
    home: Home,
    list: List,
    "plus-circle": PlusCircle,
};

interface SidebarItemProps {
    item: NavigationItem;
    depth?: number;
    isExpanded: boolean;
    searchQuery: string;
    activeId: string | null;
    onSelect: (id: string) => void;
}

export function SidebarItem({
    item,
    depth = 0,
    isExpanded: sidebarExpanded,
    searchQuery,
    activeId,
    onSelect,
}: SidebarItemProps) {
    const [isOpen, setIsOpen] = useState(depth < 1);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon && iconMap[item.icon] ? iconMap[item.icon] : File;
    const isActive = activeId === item.id;

    // Filter logic for search
    const matchesSearch = useMemo(() => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();

        const matchesSelf = item.label.toLowerCase().includes(query);

        const matchesDescendant = (items: NavigationItem[] | undefined): boolean => {
            if (!items) return false;
            return items.some(
                (child) =>
                    child.label.toLowerCase().includes(query) ||
                    matchesDescendant(child.children)
            );
        };

        return matchesSelf || matchesDescendant(item.children);
    }, [item, searchQuery]);

    // If searching and this item has children that match, open it automatically
    if (searchQuery && matchesSearch && hasChildren && !isOpen) {
        setIsOpen(true);
    }

    if (!matchesSearch) return null;

    const handleClick = () => {
        if (hasChildren) {
            setIsOpen(!isOpen);
        } else {
            onSelect(item.id);
        }
    };

    return (
        <div className="relative">
            {/* Tree line for nested items */}
            {depth > 0 && sidebarExpanded && (
                <div
                    className="absolute left-3 top-0 bottom-0 w-px bg-border/50"
                    style={{ left: `${depth * 12 + 12}px` }}
                />
            )}

            <motion.button
                onClick={handleClick}
                className={cn(
                    "w-full sidebar-item group relative",
                    isActive && "sidebar-item-active",
                    !sidebarExpanded && "justify-center px-2"
                )}
                style={{ paddingLeft: sidebarExpanded ? `${depth * 12 + 12}px` : undefined }}
                whileHover={{ x: sidebarExpanded ? 2 : 0 }}
                whileTap={{ scale: 0.98 }}
            >
                {/* Chevron for expandable items */}
                {hasChildren && sidebarExpanded && (
                    <motion.div
                        initial={false}
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1 flex-shrink-0"
                        style={{ left: `${depth * 12 + 4}px` }}
                    >
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </motion.div>
                )}

                {/* Icon */}
                <div className={cn(
                    "flex-shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}>
                    <Icon className="h-4 w-4" />
                </div>

                {/* Label */}
                <AnimatePresence>
                    {sidebarExpanded && (
                        <motion.span
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.15 }}
                            className="truncate text-left flex-1"
                        >
                            {item.label}
                        </motion.span>
                    )}
                </AnimatePresence>

                {/* Active indicator dot */}
                {isActive && (
                    <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                )}
            </motion.button>

            {/* Children */}
            <AnimatePresence initial={false}>
                {hasChildren && isOpen && sidebarExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        {item.children?.map((child) => (
                            <SidebarItem
                                key={child.id}
                                item={child}
                                depth={depth + 1}
                                isExpanded={sidebarExpanded}
                                searchQuery={searchQuery}
                                activeId={activeId}
                                onSelect={onSelect}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
