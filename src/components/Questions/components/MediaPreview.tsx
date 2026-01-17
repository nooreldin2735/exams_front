import { useState } from "react";
import { motion } from "framer-motion";
import { Image, Video, Music, Youtube, Play, Expand, Link as LinkIcon } from "lucide-react";
import type { Attachment } from "@/types/question";
import { MediaModal } from "./MediaModal";
import { AudioPlayer } from "./AudioPlayer";

interface MediaPreviewProps {
    attachment: Attachment;
    index: number;
    questionId: number | string;
    isHighlighted: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
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

const getYouTubeThumbnail = (url: string) => {
    const videoIdMatch = url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return videoIdMatch
        ? `https://img.youtube.com/vi/${videoIdMatch[1]}/hqdefault.jpg`
        : null;
};

export const MediaPreview = ({
    attachment,
    index,
    questionId,
    isHighlighted,
    onMouseEnter,
    onMouseLeave,
}: MediaPreviewProps) => {
    const [modalOpen, setModalOpen] = useState(false);
    const Icon = mediaIcons[attachment.type] || LinkIcon;

    const handleClick = () => {
        if (attachment.type !== "audio") {
            setModalOpen(true);
        }
    };

    if (attachment.type === "audio") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`media-preview p-4 ${isHighlighted ? "highlighted" : ""}`}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <div className="flex items-center gap-2 mb-3">
                    <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold"
                        style={{
                            background: `hsla(var(--media-audio), 0.15)`,
                            color: `hsl(var(--media-audio))`,
                        }}
                    >
                        ${index}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                        {mediaLabels[attachment.type]}
                    </span>
                </div>
                <AudioPlayer src={attachment.link} label={`Audio Track ${index + 1}`} />
            </motion.div>
        );
    }

    const thumbnail =
        attachment.type === "youtube"
            ? getYouTubeThumbnail(attachment.link)
            : attachment.type === "img"
                ? attachment.link
                : null;

    const typeColorKey = attachment.type === "youtube" ? "youtube" : attachment.type === 'link' ? 'primary' : attachment.type;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                id={`attachment-${questionId}-${index}`}
                className={`media-preview aspect-video group ${isHighlighted ? "highlighted" : ""}`}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={handleClick}
            >
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={`Attachment ${index}`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 border-2 border-dashed border-border/50 gap-2">
                        {attachment.type === 'link' ? (
                            <>
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${new URL(attachment.link).hostname}&sz=64`}
                                    className="w-10 h-10 rounded-lg opacity-80"
                                    alt="Favicon"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-tighter max-w-[80%] truncate">
                                    {new URL(attachment.link).hostname}
                                </span>
                            </>
                        ) : (
                            <Icon className="w-10 h-10 text-muted-foreground/50" />
                        )}
                    </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Index badge */}
                <div
                    className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-mono font-bold backdrop-blur-sm"
                    style={{
                        background: attachment.type === 'link'
                            ? 'hsl(var(--primary))'
                            : `hsla(var(--media-${typeColorKey}), 0.9)`,
                        color: "white",
                    }}
                >
                    ${index}
                </div>

                {/* Play/Expand button */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                >
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                        {attachment.type === "img" || attachment.type === 'link' ? (
                            <Expand className="w-6 h-6 text-gray-900" />
                        ) : (
                            <Play className="w-6 h-6 text-gray-900 ml-1" />
                        )}
                    </div>
                </motion.div>

                {/* Type label */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
                    <Icon className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-medium text-white">
                        {mediaLabels[attachment.type]}
                    </span>
                </div>
            </motion.div>

            {/* Unified Modal */}
            <MediaModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                src={attachment.link}
                type={attachment.type as "img" | "video" | "youtube" | "link"}
                title={attachment.title || `${mediaLabels[attachment.type]} Attachment ${index}`}
                coverImage={attachment.thumbnail || (attachment.type === 'youtube' ? getYouTubeThumbnail(attachment.link) : undefined) || undefined}
            />
        </>
    );
};
