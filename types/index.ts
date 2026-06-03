export type MessageRole = "user" | "assistant";

export interface ImageAttachment {
  dataUrl: string;
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  name: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  images?: ImageAttachment[];
  createdAt: number;
}

export type ModelId =
  | "claude-sonnet-4-6"
  | "claude-opus-4-6"
  | "claude-opus-4-7";

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  model: ModelId;
  createdAt: number;
  updatedAt: number;
}

export interface SessionData {
  isLoggedIn: boolean;
}
