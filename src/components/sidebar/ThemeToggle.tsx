import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
    isExpanded: boolean;
}

export function ThemeToggle({ isExpanded }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark";

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark");
    };

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={toggleTheme}
                className="theme-toggle focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
                <motion.div
                    className="theme-toggle-thumb flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground"
                    animate={{
                        rotate: isDark ? 360 : 0,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 10,
                    }}
                >
                    {isDark ? (
                        <Moon className="h-4 w-4" />
                    ) : (
                        <Sun className="h-4 w-4" />
                    )}
                </motion.div>
            </button>

            <motion.span
                initial={false}
                animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? "auto" : 0 }}
                className="text-xs font-medium text-muted-foreground whitespace-nowrap overflow-hidden"
            >
                {isDark ? "Dark" : "Light"} Mode
            </motion.span>
        </div>
    );
}
