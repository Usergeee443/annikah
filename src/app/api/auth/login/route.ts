import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { normalizePhoneDigits } from "@/lib/telegram";

const BodySchema = z.object({
  login: z.string().min(3).optional(),
  email: z.string().optional(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Login yoki parol noto‘g‘ri." }, { status: 400 });
  }

  const rawLogin =
    (typeof parsed.data.login === "string" && parsed.data.login.trim()) ||
    (typeof parsed.data.email === "string" && parsed.data.email.trim()) ||
    "";

  if (!rawLogin) {
    return NextResponse.json({ ok: false, error: "Email yoki telefon kiriting." }, { status: 400 });
  }

  let user = null;
  if (rawLogin.includes("@")) {
    user = await db.user.findUnique({ where: { email: rawLogin.toLowerCase() } });
  } else {
    const phone = normalizePhoneDigits(rawLogin);
    if (phone.length < 9) {
      return NextResponse.json({ ok: false, error: "Telefon raqam noto‘g‘ri." }, { status: 400 });
    }
    user = await db.user.findUnique({ where: { phone } });
  }

  if (!user) {
    return NextResponse.json({ ok: false, error: "Hisob topilmadi." }, { status: 401 });
  }
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Parol noto‘g‘ri." }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}

