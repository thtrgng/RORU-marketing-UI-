"use client";

import { useState, FormEvent } from "react";
import { XIcon, CheckIcon } from "lucide-react";

interface Props {
  defaultFolderName: string;
  pipelineOutput: string;
  finalPosted: string;
  onClose: () => void;
  onSaved: (folderName: string) => void;
}

export default function SaveDialog({
  defaultFolderName,
  pipelineOutput,
  finalPosted,
  onClose,
  onSaved,
}: Props) {
  const [folderName, setFolderName] = useState(defaultFolderName);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/save-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pipelineOutput,
          finalPosted,
          note: note.trim() || undefined,
          folderName,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      const data = await res.json();
      onSaved(data.folderName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center">
      <div className="w-full max-w-full bg-roru-surface border border-roru-border rounded-t-2xl p-6 shadow-2xl md:max-w-md md:rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-roru-text">Save caption</h2>
          <button
            onClick={onClose}
            className="text-roru-muted hover:text-roru-text transition-colors"
          >
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-roru-text mb-1">
              Folder name
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              required
              className="w-full bg-roru-bg border border-roru-border rounded-lg px-3 py-2 text-sm text-roru-text focus:outline-none focus:border-roru-accent transition-colors font-mono"
            />
            <p className="mt-1 text-xs text-roru-muted">
              Creates Posts/{folderName}/ in Repo B
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-roru-text mb-1">
              Note{" "}
              <span className="text-roru-muted font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add context about this post..."
              className="w-full bg-roru-bg border border-roru-border rounded-lg px-3 py-2 text-sm text-roru-text placeholder-roru-muted resize-none focus:outline-none focus:border-roru-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-roru-border text-roru-muted hover:text-roru-text hover:border-roru-accent rounded-lg py-2 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !folderName.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-roru-accent hover:bg-roru-accent-light disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium transition-colors"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <CheckIcon size={14} />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
