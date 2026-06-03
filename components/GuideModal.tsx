"use client";

import { useEffect } from "react";
import { XIcon } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function GuideModal({ onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative flex flex-col w-full max-w-6xl mx-auto my-4 rounded-xl overflow-hidden bg-roru-bg border border-roru-border shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-roru-border shrink-0 bg-roru-sidebar">
          <span className="text-xs font-medium tracking-widest text-roru-muted uppercase">
            Hướng dẫn sử dụng
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-roru-muted hover:text-roru-text hover:bg-roru-surface transition-colors"
            title="Đóng (Esc)"
          >
            <XIcon size={15} />
          </button>
        </div>
        <iframe
          src="/guide.html"
          className="flex-1 w-full border-0"
          title="Hướng dẫn sử dụng RORU Content Writer"
        />
      </div>
    </div>
  );
}
