import type { Chat, ModelId } from "@/types";

const STORAGE_KEY = "roru_chats";

export function loadChats(): Chat[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Chat[]) : [];
  } catch {
    return [];
  }
}

export function saveChats(chats: Chat[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

export function createChat(model: ModelId): Chat {
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    messages: [],
    model,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
