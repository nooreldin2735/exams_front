import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Download, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface MediaModalProps {
    isOpen: boolean;
    onClose: () => void;
    src: string;
    type: "img" | "video" | "youtube" | "link";
    title?: string;
    coverImage?: string;
}

const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return videoIdMatch
        ? `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1`
        : url;
};

export const MediaModal = ({ isOpen, onClose, src, type, title, coverImage }: MediaModalProps) => {
    const [showCover, setShowCover] = useState(!!coverImage);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            setShowCover(!!coverImage);
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen, coverImage]);

    const isYouTube = src.includes("youtube.com") || src.includes("youtu.be");
    const embedUrl = isYouTube ? getYouTubeEmbedUrl(src) : src;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-8"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-6xl aspect-video bg-background rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Ultra-Premium Header */}
                        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-30 flex items-start justify-between px-8 pt-6 pointer-events-none">
                            <div className="flex flex-col gap-1 pointer-events-auto">
                                {title && (
                                    <motion.h2
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-white text-xl md:text-2xl font-bold tracking-tight drop-shadow-lg"
                                    >
                                        {title}
                                    </motion.h2>
                                )}
                                <span className="text-white/50 text-xs md:text-sm font-medium truncate max-w-[300px] md:max-w-xl font-mono">
                                    {src}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 pointer-events-auto">
                                <a
                                    href={src}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-xl border border-white/10 hover:scale-105 active:scale-95"
                                    title="Open in new tab"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                                {type === 'img' && (
                                    <a
                                        href={src}
                                        download
                                        className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-xl border border-white/10 hover:scale-105 active:scale-95"
                                        title="Download"
                                    >
                                        <Download className="w-5 h-5" />
                                    </a>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-xl border border-white/10 hover:scale-105 active:scale-95"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content & Cover Layer */}
                        <div className="w-full h-full relative bg-black">
                            <AnimatePresence>
                                {showCover && coverImage && (
                                    <motion.div
                                        initial={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-20 cursor-pointer group"
                                        onClick={() => setShowCover(false)}
                                    >
                                        <img
                                            src={coverImage}
                                            alt="Cover"
                                            className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <PlayCircle className="w-20 h-20 text-white/90 drop-shadow-2xl" />
                                            </motion.div>
                                            <span className="text-white font-semibold text-lg tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                                                Click to play
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <iframe
                                src={embedUrl}
                                className="w-full h-full border-none"
                                title={title || "Media content"}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
