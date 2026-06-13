"use client";

import type { ModelId } from "@/types";

const MODELS: { id: ModelId; label: string }[] = [
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
  { id: "claude-opus-4-6", label: "Claude Opus 4.6" },
  { id: "claude-opus-4-7", label: "Claude Opus 4.7" },
  { id: "claude-opus-4-8", label: "Claude Opus 4.8" },
];

interface Props {
  value: ModelId;
  onChange: (model: ModelId) => void;
}

export default function ModelSelector({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ModelId)}
      className="bg-transparent border-none text-roru-text text-sm font-medium focus:outline-none cursor-pointer hover:text-roru-text transition-colors appearance-none pr-1"
    >
      {MODELS.map((m) => (
        <option key={m.id} value={m.id} className="bg-roru-sidebar text-roru-text">
          {m.label}
        </option>
      ))}
    </select>
  );
}
