import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { randomToken, sha256 } from "@/lib/crypto";

const SESSION_COOKIE = "annikah_session";

function getSessionSecret() {
  return process.env.AUTH_SESSION_SECRET || "dev-secret-change-me";
}

function signToken(token: string) {
  // simple HMAC so raw token isn't stored directly in cookie
  const h = sha256(`${token}:${getSessionSecret()}`);
  return `${token}.${h}`;
}

function verifySignedToken(signed: string) {
  const [token, mac] = signed.split(".");
  if (!token || !mac) return null;
  const expected = sha256(`${token}:${getSessionSecret()}`);
  if (expected !== mac) return null;
  return token;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = randomToken(32);
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
  await db.session.create({
    data: { userId, tokenHash, expiresAt },
  });

  const signed = signToken(token);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, signed, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession() {
  const jar = await cookies();
  const signed = jar.get(SESSION_COOKIE)?.value;
  if (signed) {
    const token = verifySignedToken(signed);
    if (token) {
      const tokenHash = sha256(token);
      await db.session.deleteMany({ where: { tokenHash } });
    }
  }
  jar.set(SESSION_COOKIE, "", { path: "/", expires: new Date(0) });
}

export async function getCurrentUser() {
  const jar = await cookies();
  const signed = jar.get(SESSION_COOKIE)?.value;
  if (!signed) return null;
  const token = verifySignedToken(signed);
  if (!token) return null;
  const tokenHash = sha256(token);
  const session = await db.session.findUnique({
    where: { tokenHash },
    include: { user: { include: { profile: true } } },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: session.id } });
    return null;
  }
  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("AUTH_REQUIRED");
  }
  return user;
}

