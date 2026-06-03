import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAnthropicClient } from "@/lib/anthropic";
import type { Message, ModelId } from "@/types";

const STUB_SYSTEM_PROMPT =
  "You are the RORU caption writing assistant. Help the user craft engaging social media captions for RORU's restaurant content.";

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

  const body = await req.json();
  const { messages, model } = body as { messages: Message[]; model: ModelId };

  let systemPrompt: string;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("@/lib/content-system/system-prompt");
    systemPrompt = mod.SYSTEM_PROMPT ?? STUB_SYSTEM_PROMPT;
  } catch {
    systemPrompt = STUB_SYSTEM_PROMPT;
  }

  const anthropic = getAnthropicClient();
  const anthropicMessages = buildAnthropicMessages(messages);

  const stream = await anthropic.messages.stream({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: anthropicMessages,
  });

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        controller.error(err);
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
