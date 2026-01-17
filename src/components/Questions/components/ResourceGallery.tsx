import { motion } from "framer-motion";
import type { Attachment } from "@/types/question";
import { MediaPreview } from "./MediaPreview";

interface ResourceGalleryProps {
    attachments?: Attachment[] | null;
    questionId: number | string;
    highlightedIndex: number | null;
    onItemHover: (index: number | null) => void;
}

export const ResourceGallery = ({
    attachments = [],
    questionId,
    highlightedIndex,
    onItemHover,
}: ResourceGalleryProps) => {
    const safeAttachments = attachments || [];
    if (safeAttachments.length === 0) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    return (
        <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2 mb-4">
                <h4 className="text-sm font-semibold text-foreground">Resources</h4>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {safeAttachments.length}
                </span>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
                {safeAttachments.map((attachment, index) => (
                    <MediaPreview
                        key={index}
                        attachment={attachment}
                        index={index}
                        questionId={questionId}
                        isHighlighted={highlightedIndex === index}
                        onMouseEnter={() => onItemHover(index)}
                        onMouseLeave={() => onItemHover(null)}
                    />
                ))}
            </motion.div>
        </div>
    );
};
