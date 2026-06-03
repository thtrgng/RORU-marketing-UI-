"use client";

import { useRef, useState, KeyboardEvent, ChangeEvent } from "react";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";
import type { ImageAttachment } from "@/types";

interface Props {
  onSend: (content: string, images: ImageAttachment[]) => void;
  disabled: boolean;
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export default function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const valid = files.filter((f) =>
      ALLOWED_TYPES.includes(f.type as (typeof ALLOWED_TYPES)[number])
    );

    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [
          ...prev,
          {
            dataUrl: reader.result as string,
            mediaType: file.type as ImageAttachment["mediaType"],
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function send() {
    const trimmed = text.trim();
    if (!trimmed && images.length === 0) return;
    onSend(trimmed, images);
    setText("");
    setImages([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function handleTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  return (
    <div className="border-t border-roru-border bg-roru-bg p-4">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img.dataUrl}
                alt={img.name}
                className="h-16 w-auto rounded-lg object-cover border border-roru-border"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 bg-roru-border rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XIcon size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 bg-roru-surface border border-roru-border rounded-2xl px-3 py-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="text-roru-muted hover:text-roru-text transition-colors shrink-0 mb-1"
          title="Upload image"
        >
          <ImageIcon size={18} />
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-sm text-roru-text placeholder-roru-muted resize-none focus:outline-none leading-6 max-h-[200px] overflow-y-auto disabled:opacity-50"
        />

        <button
          onClick={send}
          disabled={disabled || (!text.trim() && images.length === 0)}
          className="text-roru-accent hover:text-roru-accent-light disabled:opacity-30 transition-colors shrink-0 mb-1"
          title="Send"
        >
          <SendIcon size={18} />
        </button>
      </div>

      <p className="mt-2 text-center text-xs text-roru-muted">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
