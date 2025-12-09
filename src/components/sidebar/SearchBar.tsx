import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    isExpanded: boolean;
}

export function SearchBar({ value, onChange, isExpanded }: SearchBarProps) {
    return (
        <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 transition-all duration-200 focus-within:border-primary/50 focus-within:bg-secondary">
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                <AnimatePresence>
                    {isExpanded && (
                        <motion.input
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "100%" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            type="text"
                            placeholder="Search..."
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 min-w-0"
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {value && isExpanded && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => onChange("")}
                            className="p-0.5 rounded-full hover:bg-muted transition-colors"
                        >
                            <X className="h-3 w-3 text-muted-foreground" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
