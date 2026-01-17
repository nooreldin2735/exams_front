import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[110]"
                    />

                    {/* Drawer Content */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 h-full w-full max-w-lg bg-background border-l border-border shadow-2xl z-[120] flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-border bg-card/30">
                            <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-accent rounded-full transition-colors active:scale-95"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
