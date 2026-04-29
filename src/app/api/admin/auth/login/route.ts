import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticateAdmin,
  setAdminSessionEnv,
  setAdminSessionForUser,
} from "@/lib/adminAuth";

const Body = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Login yoki parol noto‘g‘ri." }, { status: 400 });
  }

  const result = await authenticateAdmin(parsed.data.username, parsed.data.password);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "Login yoki parol noto‘g‘ri." }, { status: 401 });
  }

  if (result.kind === "env") {
    await setAdminSessionEnv();
  } else {
    await setAdminSessionForUser(result.adminUserId);
  }
  return NextResponse.json({ ok: true });
}
