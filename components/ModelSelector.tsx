"use client";

import type { ModelId } from "@/types";

const MODELS: { id: ModelId; label: string }[] = [
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
  { id: "claude-opus-4-6", label: "Claude Opus 4.6" },
  { id: "claude-opus-4-7", label: "Claude Opus 4.7" },
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
      className="bg-roru-surface border border-roru-border text-roru-text text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-roru-accent transition-colors cursor-pointer"
    >
      {MODELS.map((m) => (
        <option key={m.id} value={m.id}>
          {m.label}
        </option>
      ))}
    </select>
  );
}
