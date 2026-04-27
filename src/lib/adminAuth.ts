import { cookies } from "next/headers";
import { sha256 } from "@/lib/crypto";

const ADMIN_COOKIE = "annikah_admin";

function getSecret() {
  return process.env.ADMINPANEL_SECRET || "dev-admin-secret-change-me";
}

function sign(v: string) {
  const mac = sha256(`${v}:${getSecret()}`);
  return `${v}.${mac}`;
}

function verify(signed: string) {
  const [v, mac] = signed.split(".");
  if (!v || !mac) return null;
  const expected = sha256(`${v}:${getSecret()}`);
  if (expected !== mac) return null;
  return v;
}

export async function isAdminAuthed() {
  const jar = await cookies();
  const raw = jar.get(ADMIN_COOKIE)?.value;
  if (!raw) return false;
  return Boolean(verify(raw));
}

export async function setAdminSession() {
  const jar = await cookies();
  const signed = sign("1");
  jar.set(ADMIN_COOKIE, signed, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "", { path: "/", expires: new Date(0) });
}

export async function requireAdmin() {
  const ok = await isAdminAuthed();
  if (!ok) {
    // API route: return 401 and let caller handle
    throw new Error("ADMIN_AUTH_REQUIRED");
  }
}

export function verifyAdminCredentials(username: string, password: string) {
  const u = (process.env.ADMINPANEL_USERNAME || "admin").trim();
  const p = (process.env.ADMINPANEL_PASSWORD || "admin").trim();
  return username === u && password === p;
}

