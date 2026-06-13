import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAnthropicClient } from "@/lib/anthropic";
import type { Message, ModelId, ThinkingLevel } from "@/types";

const STUB_SYSTEM_PROMPT =
  "You are the RORU caption writing assistant. Help the user craft engaging social media captions for RORU's restaurant content.";

const THINKING_CONFIG: Record<ThinkingLevel, { budgetTokens: number | null; maxTokens: number }> = {
  low:    { budgetTokens: null,  maxTokens: 4096  },
  medium: { budgetTokens: 3000,  maxTokens: 8000  },
  high:   { budgetTokens: 8000,  maxTokens: 16000 },
  max:    { budgetTokens: 16000, maxTokens: 24000 },
};

function buildAnthropicMessages(messages: Message[]) {
  return messages.map((msg) => {
    if (msg.role === "user" && msg.images && msg.images.length > 0) {
      return {
        role: "user" as const,
        content: [
          ...msg.images.map((img) => ({
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: img.mediaType,
              data: img.dataUrl.split(",")[1],
            },
          })),
          ...(msg.content
            ? [{ type: "text" as const, text: msg.content }]
            : []),
        ],
      };
    }

    return {
      role: msg.role as "user" | "assistant",
      content: msg.content,
    };
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { messages: Message[]; model: ModelId; thinkingLevel?: ThinkingLevel };
  try {
    body = await req.json();
  } catch {
    return new Response("Request body too large or malformed.", { status: 413 });
  }

  const { messages, model, thinkingLevel = "low" } = body;
  const { budgetTokens, maxTokens } = THINKING_CONFIG[thinkingLevel];

  let systemPrompt: string;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("@/lib/content-system/system-prompt");
    systemPrompt = mod.SYSTEM_PROMPT ?? STUB_SYSTEM_PROMPT;
  } catch {
    systemPrompt = STUB_SYSTEM_PROMPT;
  }

  const anthropic = getAnthropicClient();
  const recentMessages = messages.slice(-10);
  const anthropicMessages = buildAnthropicMessages(recentMessages);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const streamParams: any = {
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: anthropicMessages,
  };

  if (budgetTokens !== null) {
    streamParams.thinking = { type: "enabled", budget_tokens: budgetTokens };
  }

  let stream: Awaited<ReturnType<typeof anthropic.messages.stream>>;
  try {
    stream = await anthropic.messages.stream(streamParams);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Anthropic API error";
    return new Response(msg, { status: 502 });
  }

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          // Only forward text deltas — thinking_delta blocks are silently skipped
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Stream error";
        controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
