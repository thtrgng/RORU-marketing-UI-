"use client";

import { useEffect } from "react";
import { CheckCircleIcon } from "lucide-react";

interface Props {
  message: string;
  onDismiss: () => void;
}

export default function Toast({ message, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-roru-surface border border-roru-border rounded-xl px-4 py-3 shadow-xl text-sm text-roru-text">
      <CheckCircleIcon size={16} className="text-green-400 shrink-0" />
      {message}
    </div>
  );
}
