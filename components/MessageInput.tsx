"use client";

import {
  useRef, useState, useEffect,
  KeyboardEvent, ChangeEvent, ClipboardEvent, DragEvent,
} from "react";
import { ImageIcon, ArrowUpIcon, XIcon, ChevronDownIcon } from "lucide-react";
import type { ImageAttachment, ModelId, ThinkingLevel } from "@/types";

interface Props {
  onSend: (content: string, images: ImageAttachment[]) => void;
  disabled: boolean;
  selectedModel: ModelId;
  onModelChange: (model: ModelId) => void;
  thinkingLevel: ThinkingLevel;
  onThinkingChange: (level: ThinkingLevel) => void;
}

const MODELS: { id: ModelId; label: string }[] = [
  { id: "claude-sonnet-4-6", label: "Sonnet 4.6" },
  { id: "claude-opus-4-6",   label: "Opus 4.6"   },
  { id: "claude-opus-4-7",   label: "Opus 4.7"   },
];

const EFFORT_LEVELS: { value: ThinkingLevel; label: string }[] = [
  { value: "low",    label: "Fastest" },
  { value: "medium", label: "Normal"  },
  { value: "high",   label: "High"    },
  { value: "max",    label: "Max"     },
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
const MAX_DIMENSION = 1120;

function compressImage(file: File): Promise<ImageAttachment> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      reject(new Error("Unsupported image type"));
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) { height = Math.round((height * MAX_DIMENSION) / width); width = MAX_DIMENSION; }
        else { width = Math.round((width * MAX_DIMENSION) / height); height = MAX_DIMENSION; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not available")); URL.revokeObjectURL(objectUrl); return; }
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);
      resolve({ dataUrl: canvas.toDataURL("image/jpeg", 0.85), mediaType: "image/jpeg", name: file.name || "image.jpg" });
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Failed to load image")); };
    img.src = objectUrl;
  });
}

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

export default function MessageInput({
  onSend, disabled,
  selectedModel, onModelChange,
  thinkingLevel, onThinkingChange,
}: Props) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showEffortMenu, setShowEffortMenu] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const effortMenuRef = useRef<HTMLDivElement>(null);

  useOutsideClick(modelMenuRef, () => setShowModelMenu(false));
  useOutsideClick(effortMenuRef, () => setShowEffortMenu(false));

  async function addFiles(files: File[]) {
    const results = await Promise.allSettled(files.map(compressImage));
    const attachments = results
      .filter((r): r is PromiseFulfilledResult<ImageAttachment> => r.status === "fulfilled")
      .map((r) => r.value);
    if (attachments.length > 0) setImages((prev) => [...prev, ...attachments]);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files ?? []));
    if (fileRef.current) fileRef.current.value = "";
  }

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const items = Array.from(e.clipboardData.items);
    const imageFiles = items
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((f): f is File => f !== null);
    if (imageFiles.length > 0) { e.preventDefault(); addFiles(imageFiles); }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) { e.preventDefault(); setIsDragging(true); }
  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  }
  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault(); setIsDragging(false); addFiles(Array.from(e.dataTransfer.files));
  }

  function removeImage(index: number) { setImages((prev) => prev.filter((_, i) => i !== index)); }

  function send() {
    const trimmed = text.trim();
    if (!trimmed && images.length === 0) return;
    onSend(trimmed, images);
    setText(""); setImages([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function handleTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    const el = e.target; el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  const canSend = !disabled && (!!text.trim() || images.length > 0);
  const modelLabel = MODELS.find((m) => m.id === selectedModel)?.label ?? selectedModel;
  const effortLabel = EFFORT_LEVELS.find((l) => l.value === thinkingLevel)?.label ?? thinkingLevel;
  const effortDisplay = EFFORT_LEVELS.find((l) => l.value === thinkingLevel);

  return (
    <div
      className="px-4 pb-4 pt-2"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="mb-2 flex items-center justify-center rounded-2xl border-2 border-dashed border-roru-border py-4 text-sm text-roru-muted">
          Drop images here
        </div>
      )}

      <div className="rounded-2xl bg-roru-input-bg border border-roru-border focus-within:border-roru-muted transition-colors">
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.dataUrl} alt={img.name} className="h-16 w-auto rounded-xl object-cover border border-roru-border" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 bg-roru-surface border border-roru-border rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <XIcon size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef} rows={1} value={text}
          onChange={handleTextChange} onKeyDown={handleKeyDown} onPaste={handlePaste}
          disabled={disabled} placeholder="Message RORU..."
          className="w-full bg-transparent text-[15px] text-roru-text placeholder-roru-muted resize-none focus:outline-none leading-relaxed px-4 pt-3 pb-2 max-h-[200px] overflow-y-auto disabled:opacity-50"
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 pb-2.5">
          {/* Left: attach */}
          <button type="button" onClick={() => fileRef.current?.click()}
            className="p-1.5 rounded-lg text-roru-muted hover:text-roru-text hover:bg-roru-surface transition-colors" title="Upload image">
            <ImageIcon size={16} />
          </button>

          {/* Right: model | effort + send */}
          <div className="flex items-center gap-2">
            {/* Model | Effort selector */}
            <div className="flex items-center text-xs text-roru-muted">
              {/* Model picker */}
              <div className="relative" ref={modelMenuRef}>
                <button type="button" onClick={() => { setShowModelMenu((v) => !v); setShowEffortMenu(false); }}
                  className="flex items-center gap-0.5 hover:text-roru-text transition-colors px-1 py-0.5 rounded">
                  {modelLabel}
                  <ChevronDownIcon size={11} className="opacity-60" />
                </button>
                {showModelMenu && (
                  <div className="absolute bottom-full right-0 mb-1 w-44 rounded-xl bg-roru-surface border border-roru-border shadow-lg py-1 z-50">
                    {MODELS.map((m) => (
                      <button key={m.id} type="button"
                        onClick={() => { onModelChange(m.id); setShowModelMenu(false); }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-roru-border ${m.id === selectedModel ? "text-roru-text font-medium" : "text-roru-muted"}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="mx-1 text-roru-border select-none">|</span>

              {/* Effort picker */}
              <div className="relative" ref={effortMenuRef}>
                <button type="button" onClick={() => { setShowEffortMenu((v) => !v); setShowModelMenu(false); }}
                  className="flex items-center gap-0.5 hover:text-roru-text transition-colors px-1 py-0.5 rounded">
                  {effortLabel}
                  <ChevronDownIcon size={11} className="opacity-60" />
                </button>
                {showEffortMenu && (
                  <div className="absolute bottom-full right-0 mb-1 w-56 rounded-xl bg-roru-surface border border-roru-border shadow-lg p-3 z-50">
                    <p className="text-xs text-roru-muted mb-2">
                      Effort: <span className="text-roru-text font-medium">{effortDisplay?.label}</span>
                    </p>
                    <div className="flex items-center gap-1">
                      {EFFORT_LEVELS.map((l) => (
                        <button key={l.value} type="button"
                          onClick={() => { onThinkingChange(l.value); setShowEffortMenu(false); }}
                          className={`flex-1 py-1 text-xs rounded-lg transition-colors text-center ${
                            l.value === thinkingLevel
                              ? "bg-roru-border text-roru-text font-medium"
                              : "text-roru-muted hover:text-roru-text hover:bg-roru-border"
                          }`}>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Send */}
            <button type="button" onClick={send} disabled={!canSend}
              className="p-1.5 rounded-lg bg-roru-accent text-white disabled:opacity-25 hover:bg-roru-accent-hover transition-colors" title="Send">
              <ArrowUpIcon size={17} />
            </button>
          </div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple className="hidden" onChange={handleFileChange} />
    </div>
  );
}
