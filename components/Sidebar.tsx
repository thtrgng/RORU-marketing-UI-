"use client";

import { PlusIcon, MessageSquareIcon } from "lucide-react";
import type { Chat } from "@/types";
import { clsx } from "clsx";

interface Props {
  chats: Chat[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
}

export default function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
}: Props) {
  return (
    <aside className="w-64 flex flex-col bg-roru-surface border-r border-roru-border h-full">
      <div className="p-3 border-b border-roru-border">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-roru-text hover:bg-roru-border transition-colors"
        >
          <PlusIcon size={16} />
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {chats.length === 0 && (
          <p className="px-3 py-4 text-xs text-roru-muted text-center">
            No chats yet
          </p>
        )}
        {chats
          .slice()
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={clsx(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors truncate",
                chat.id === activeChatId
                  ? "bg-roru-border text-roru-text"
                  : "text-roru-muted hover:bg-roru-border hover:text-roru-text"
              )}
            >
              <MessageSquareIcon size={14} className="shrink-0" />
              <span className="truncate">{chat.title}</span>
            </button>
          ))}
      </div>
    </aside>
  );
}
