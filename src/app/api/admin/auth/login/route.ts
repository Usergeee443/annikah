import { NextResponse } from "next/server";
import { z } from "zod";
import { setAdminSession, verifyAdminCredentials } from "@/lib/adminAuth";

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

  const ok = verifyAdminCredentials(parsed.data.username, parsed.data.password);
  if (!ok) return NextResponse.json({ ok: false, error: "Login yoki parol noto‘g‘ri." }, { status: 401 });

  await setAdminSession();
  return NextResponse.json({ ok: true });
}

