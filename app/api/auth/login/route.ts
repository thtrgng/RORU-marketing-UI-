import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password } = body;

  if (
    username !== process.env.AUTH_USERNAME ||
    password !== process.env.AUTH_PASSWORD
  ) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session = await getSession();
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({ ok: true });
}
