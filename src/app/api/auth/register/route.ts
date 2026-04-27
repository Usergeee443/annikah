import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Email yoki parol noto‘g‘ri." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ ok: false, error: "Bu email bilan hisob bor." }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await db.user.create({
    data: { email, passwordHash, authProvider: "email" },
  });

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}

