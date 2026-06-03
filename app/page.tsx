"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import MessageInput from "@/components/MessageInput";
import ModelSelector from "@/components/ModelSelector";
import SaveDialog from "@/components/SaveDialog";
import Toast from "@/components/Toast";
import { loadChats, saveChats, createChat } from "@/lib/storage";
import type { Chat, Message, ImageAttachment, ModelId } from "@/types";
import { LogOutIcon } from "lucide-react";

const DEFAULT_MODEL: ModelId = "claude-sonnet-4-6";

interface SaveState {
  content: string;
  allMessages: Message[];
}

function buildFolderName(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}_caption`;
}

export default function HomePage() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [saveState, setSaveState] = useState<SaveState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadChats();
    setChats(stored);
    if (stored.length > 0) {
      setActiveChatId(stored.sort((a, b) => b.updatedAt - a.updatedAt)[0].id);
    }
  }, []);

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  function updateChats(updated: Chat[]) {
    setChats(updated);
    saveChats(updated);
  }

  function handleNewChat() {
    const chat = createChat(activeChat?.model ?? DEFAULT_MODEL);
    const updated = [chat, ...chats];
    updateChats(updated);
    setActiveChatId(chat.id);
  }

  function handleSelectChat(id: string) {
    setActiveChatId(id);
  }

  function handleModelChange(model: ModelId) {
    if (!activeChatId) return;
    const updated = chats.map((c) =>
      c.id === activeChatId ? { ...c, model } : c
    );
    updateChats(updated);
  }

  function handleSaveCaption(content: string) {
    setSaveState({
      content,
      allMessages: activeChat?.messages ?? [],
    });
  }

  function handleSaved(folderName: string) {
    setSaveState(null);
    setToast(`Saved to Posts/${folderName}/`);
  }

  const handleSend = useCallback(
    async (content: string, images: ImageAttachment[]) => {
      let chat = activeChat;
      if (!chat) {
        chat = createChat(DEFAULT_MODEL);
        const updated = [chat, ...chats];
        updateChats(updated);
        setActiveChatId(chat.id);
      }

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        images: images.length > 0 ? images : undefined,
        createdAt: Date.now(),
      };

      const updatedMessages = [...chat.messages, userMsg];
      const title =
        chat.messages.length === 0
          ? content.slice(0, 40) || "Image upload"
          : chat.title;

      const updatedChat: Chat = {
        ...chat,
        messages: updatedMessages,
        title,
        updatedAt: Date.now(),
      };

      const newChats = chats.some((c) => c.id === updatedChat.id)
        ? chats.map((c) => (c.id === updatedChat.id ? updatedChat : c))
        : [updatedChat, ...chats];
      updateChats(newChats);

      setIsStreaming(true);
      setStreamingContent("");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages,
            model: updatedChat.model,
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || "API error");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setStreamingContent(accumulated);
        }

        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: accumulated,
          createdAt: Date.now(),
        };

        const finalChat: Chat = {
          ...updatedChat,
          messages: [...updatedMessages, assistantMsg],
          updatedAt: Date.now(),
        };

        const finalChats = newChats.map((c) =>
          c.id === finalChat.id ? finalChat : c
        );
        updateChats(finalChats);
      } catch (err) {
        const errorMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : "Something went wrong."}`,
          createdAt: Date.now(),
        };
        const errChats = newChats.map((c) =>
          c.id === updatedChat.id
            ? { ...updatedChat, messages: [...updatedMessages, errorMsg] }
            : c
        );
        updateChats(errChats);
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
      }
    },
    [activeChat, chats]
  );

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const pipelineOutput =
    saveState?.allMessages.map((m) => `**${m.role}**: ${m.content}`).join("\n\n") ?? "";

  return (
    <div className="flex h-screen bg-roru-bg overflow-hidden">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center justify-between px-4 py-3 border-b border-roru-border bg-roru-bg shrink-0">
          <h1 className="text-sm font-semibold text-roru-text tracking-tight">
            RORU Marketing
          </h1>
          <div className="flex items-center gap-3">
            {activeChat && (
              <ModelSelector
                value={activeChat.model}
                onChange={handleModelChange}
              />
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-roru-muted hover:text-roru-text transition-colors"
            >
              <LogOutIcon size={14} />
              Logout
            </button>
          </div>
        </header>

        <ChatArea
          messages={activeChat?.messages ?? []}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
          onSaveCaption={handleSaveCaption}
        />

        <MessageInput onSend={handleSend} disabled={isStreaming} />
      </div>

      {saveState && (
        <SaveDialog
          defaultFolderName={buildFolderName()}
          pipelineOutput={pipelineOutput}
          finalPosted={saveState.content}
          onClose={() => setSaveState(null)}
          onSaved={handleSaved}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
