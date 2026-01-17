import { useMemo } from "react";
import { AttachmentChip } from "./AttachmentChip";
import type { Attachment } from "@/types/question";

interface SmartQuestionTextProps {
    text: string;
    attachments?: Attachment[] | null;
    highlightedIndex: number | null;
    onChipHover: (index: number | null) => void;
    onChipClick: (index: number) => void;
}

export const SmartQuestionText = ({
    text,
    attachments = [],
    highlightedIndex,
    onChipHover,
    onChipClick,
}: SmartQuestionTextProps) => {
    const safeAttachments = attachments || [];

    const parsedContent = useMemo(() => {
        const parts: (string | { type: "chip"; index: number })[] = [];
        const regex = /\$(\d+)/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.slice(lastIndex, match.index));
            }
            const attachmentIndex = parseInt(match[1], 10);
            if (attachmentIndex < safeAttachments.length) {
                parts.push({ type: "chip", index: attachmentIndex });
            } else {
                parts.push(match[0]);
            }
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }

        return parts;
    }, [text, safeAttachments]);

    return (
        <p className="text-lg leading-relaxed text-foreground">
            {parsedContent.map((part, i) => {
                if (typeof part === "string") {
                    return <span key={i}>{part}</span>;
                }
                return (
                    <AttachmentChip
                        key={i}
                        index={part.index}
                        attachment={safeAttachments[part.index]}
                        isActive={highlightedIndex === part.index}
                        onHover={onChipHover}
                        onClick={() => onChipClick(part.index)}
                    />
                );
            })}
        </p>
    );
};
