import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import type { SessionData } from "@/types";

const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "roru_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
