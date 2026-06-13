"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Message } from "@/types";
import { BookmarkIcon } from "lucide-react";

interface Props {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  onSaveCaption: (content: string) => void;
}

// Anthropic-style 6-arm asterisk logo
function ClaudeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <rect
          key={angle}
          x="11"
          y="1.5"
          width="2"
          height="9"
          rx="1"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </svg>
  );
}

function StreamingIndicator({ content }: { content: string }) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = `${mins}:${String(secs).padStart(2, "0")}`;
  const tokens = content ? Math.ceil(content.length / 3.5) : 0;

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-2">
        <ClaudeIcon className="w-5 h-5 text-roru-accent animate-pulse" />
        <span className="text-sm text-roru-muted tabular-nums">{timeStr}</span>
        {tokens > 0 && (
          <>
            <span className="text-roru-border select-none">·</span>
            <span className="text-sm text-roru-muted">{tokens} tokens</span>
          </>
        )}
      </div>
      {content && (
        <div className="prose prose-sm max-w-none text-roru-text prose-headings:text-roru-text prose-strong:text-roru-text prose-code:text-roru-text prose-pre:bg-roru-surface prose-pre:border prose-pre:border-roru-border prose-blockquote:border-roru-border prose-blockquote:text-roru-muted prose-a:text-roru-accent leading-relaxed">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

function AssistantMessage({
  content,
  onSave,
}: {
  content: string;
  onSave: () => void;
}) {
  return (
    <div className="w-full">
      <div className="prose prose-sm max-w-none text-roru-text prose-headings:text-roru-text prose-strong:text-roru-text prose-code:text-roru-text prose-pre:bg-roru-surface prose-pre:border prose-pre:border-roru-border prose-blockquote:border-roru-border prose-blockquote:text-roru-muted prose-a:text-roru-accent leading-relaxed">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
      {content && (
        <button
          onClick={onSave}
          className="mt-2 flex items-center gap-1.5 px-2 py-1 text-xs text-roru-muted hover:text-roru-text transition-colors rounded-md hover:bg-roru-surface"
        >
          <BookmarkIcon size={12} />
          Save caption
        </button>
      )}
    </div>
  );
}

export default function ChatArea({
  messages,
  isStreaming,
  streamingContent,
  onSaveCaption,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-roru-muted text-sm">Start a conversation to generate captions.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((msg) =>
        msg.role === "user" ? (
          <div key={msg.id} className="flex justify-end w-full">
            <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-roru-user-bubble px-4 py-3 text-chat text-roru-text">
              {msg.images && msg.images.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {msg.images.map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={img.dataUrl}
                      alt={img.name}
                      className="h-24 w-auto rounded-xl object-cover"
                    />
                  ))}
                </div>
              )}
              {msg.content && (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              )}
            </div>
          </div>
        ) : (
          <AssistantMessage
            key={msg.id}
            content={msg.content}
            onSave={() => onSaveCaption(msg.content)}
          />
        )
      )}

      {isStreaming && <StreamingIndicator content={streamingContent} />}

      <div ref={bottomRef} />
    </div>
  );
}
