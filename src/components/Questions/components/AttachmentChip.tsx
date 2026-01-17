import { Image, Video, Music, Youtube, Link as LinkIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { Attachment } from "@/types/question";

interface AttachmentChipProps {
    index: number;
    attachment: Attachment;
    isActive: boolean;
    onHover: (index: number | null) => void;
    onClick: () => void;
}

const mediaIcons = {
    img: Image,
    video: Video,
    audio: Music,
    youtube: Youtube,
    link: LinkIcon,
};

const mediaLabels = {
    img: "Image",
    video: "Video",
    audio: "Audio",
    youtube: "YouTube",
    link: "Link",
};

export const AttachmentChip = ({
    index,
    attachment,
    isActive,
    onHover,
    onClick,
}: AttachmentChipProps) => {
    const Icon = mediaIcons[attachment.type] || LinkIcon;

    return (
        <motion.span
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => onHover(index)}
            onMouseLeave={() => onHover(null)}
            onClick={onClick}
            className={`attachment-chip ${isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                    : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                } mx-1 my-0.5 align-middle select-none font-mono text-[13px]`}
        >
            <Icon className="w-3.5 h-3.5" />
            <span className="tracking-tighter">${index}</span>
            <span className="text-[10px] opacity-60 ml-0.5 hidden xs:inline">{mediaLabels[attachment.type]}</span>
        </motion.span>
    );
};
