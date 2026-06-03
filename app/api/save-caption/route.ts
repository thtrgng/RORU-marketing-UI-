import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getOctokit, getRepoConfig } from "@/lib/github";

interface SaveCaptionBody {
  pipelineOutput: string;
  finalPosted: string;
  note?: string;
  folderName: string;
}

async function createFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  commitMessage: string
): Promise<void> {
  const kit = getOctokit();
  const encoded = Buffer.from(content, "utf-8").toString("base64");

  await kit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: commitMessage,
    content: encoded,
  });
}

function buildFolderName(raw: string): string {
  return raw.trim().replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 80);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: SaveCaptionBody = await req.json();
  const { pipelineOutput, finalPosted, note, folderName: rawFolder } = body;

  if (!pipelineOutput || !finalPosted || !rawFolder) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { owner, repo } = getRepoConfig();
  const folderName = buildFolderName(rawFolder);
  const basePath = `Posts/${folderName}`;
  const commitMsg = `caption: ${folderName}`;

  try {
    await createFile(owner, repo, `${basePath}/PIPELINE_OUTPUT.md`, pipelineOutput, commitMsg);
    await createFile(owner, repo, `${basePath}/FINAL_POSTED.md`, finalPosted, commitMsg);
    if (note) {
      await createFile(owner, repo, `${basePath}/USER_INPUT.md`, note, commitMsg);
    }

    return NextResponse.json({ ok: true, folderName });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "GitHub API error";
    console.error("[save-caption]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
