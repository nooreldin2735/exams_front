import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Edit3, Copy, Trash2 } from "lucide-react";

interface ActionMenuProps {
    onEdit?: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
}

export const ActionMenu = ({ onEdit, onDuplicate, onDelete }: ActionMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { icon: Edit3, label: "Edit", onClick: onEdit, color: "text-foreground" },
        { icon: Copy, label: "Duplicate", onClick: onDuplicate, color: "text-foreground" },
        { icon: Trash2, label: "Delete", onClick: onDelete, color: "text-destructive" },
    ];

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="action-menu-trigger"
            >
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 z-50 w-44 rounded-xl border bg-popover p-1.5 shadow-lg"
                        >
                            {menuItems.map((item) => (
                                <motion.button
                                    key={item.label}
                                    whileHover={{ x: 4 }}
                                    onClick={() => {
                                        item.onClick?.();
                                        setIsOpen(false);
                                    }}
                                    className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors hover:bg-muted ${item.color}
                  `}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </motion.button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
