"use client";

import { SquarePenIcon } from "lucide-react";
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
    <aside className="w-[260px] flex flex-col bg-roru-sidebar h-full">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-roru-text">RORU</span>
        <button
          onClick={onNewChat}
          title="New chat"
          className="p-1.5 rounded-md text-roru-muted hover:text-roru-text hover:bg-roru-surface transition-colors"
        >
          <SquarePenIcon size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {chats.length === 0 && (
          <p className="px-3 py-4 text-xs text-roru-muted text-center">No chats yet</p>
        )}
        {chats
          .slice()
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={clsx(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate",
                chat.id === activeChatId
                  ? "bg-roru-surface text-roru-text"
                  : "text-roru-muted hover:bg-roru-surface hover:text-roru-text"
              )}
            >
              {chat.title}
            </button>
          ))}
      </div>
    </aside>
  );
}
