"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import type { Message } from "@/types";
import { clsx } from "clsx";
import { BookmarkIcon } from "lucide-react";

interface Props {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  onSaveCaption: (content: string) => void;
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
        <p className="text-roru-muted text-sm">
          Start a conversation to generate captions.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={clsx(
            "flex",
            msg.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <div className={clsx("flex flex-col gap-1", msg.role === "assistant" && "max-w-[80%]")}>
            <div
              className={clsx(
                "rounded-2xl px-4 py-3 text-sm",
                msg.role === "user"
                  ? "max-w-[80%] bg-roru-accent text-white rounded-br-sm"
                  : "bg-roru-surface border border-roru-border text-roru-text rounded-bl-sm"
              )}
            >
              {msg.images && msg.images.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {msg.images.map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={img.dataUrl}
                      alt={img.name}
                      className="h-24 w-auto rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>

            {msg.role === "assistant" && msg.content && (
              <button
                onClick={() => onSaveCaption(msg.content)}
                className="self-start flex items-center gap-1.5 px-2 py-1 text-xs text-roru-muted hover:text-roru-accent transition-colors rounded"
              >
                <BookmarkIcon size={12} />
                Save caption
              </button>
            )}
          </div>
        </div>
      ))}

      {isStreaming && streamingContent && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm bg-roru-surface border border-roru-border text-roru-text">
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{streamingContent}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {isStreaming && !streamingContent && (
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-roru-surface border border-roru-border">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-roru-muted animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-roru-muted animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-roru-muted animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
