import { cache } from "react";
import { cookies } from "next/headers";
import { sha256 } from "@/lib/crypto";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";

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

export type AdminSession = {
  /** "env" — bootstrap super admin from env vars; otherwise AdminUser id */
  id: string;
  username: string;
  role: "admin" | "super";
};

function envAdminUsername() {
  return (process.env.ADMINPANEL_USERNAME || "admin").trim();
}

function envAdminPassword() {
  return (process.env.ADMINPANEL_PASSWORD || "admin").trim();
}

// Per-request cache — bir sahifani render qilganda layout va page bir-biriga
// dublikat DB so‘rov yubormasin uchun React.cache bilan o‘rab qo‘yamiz.
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const jar = await cookies();
  const raw = jar.get(ADMIN_COOKIE)?.value;
  if (!raw) return null;
  const value = verify(raw);
  if (!value) return null;
  // value: "env" | "id:<adminUserId>"
  if (value === "env") {
    return { id: "env", username: envAdminUsername(), role: "super" };
  }
  if (value.startsWith("id:")) {
    const id = value.slice(3);
    try {
      const u = await db.adminUser.findUnique({
        where: { id },
        select: { id: true, username: true, role: true },
      });
      if (!u) return null;
      return {
        id: u.id,
        username: u.username,
        role: (u.role as "admin" | "super") || "admin",
      };
    } catch {
      return null;
    }
  }
  return null;
});

export async function isAdminAuthed() {
  const s = await getAdminSession();
  return Boolean(s);
}

export async function setAdminSessionEnv() {
  const jar = await cookies();
  const signed = sign("env");
  jar.set(ADMIN_COOKIE, signed, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function setAdminSessionForUser(adminUserId: string) {
  const jar = await cookies();
  const signed = sign(`id:${adminUserId}`);
  jar.set(ADMIN_COOKIE, signed, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "", { path: "/", expires: new Date(0) });
}

export async function requireAdmin() {
  const s = await getAdminSession();
  if (!s) throw new Error("ADMIN_AUTH_REQUIRED");
  return s;
}

export async function requireSuperAdmin() {
  const s = await requireAdmin();
  if (s.role !== "super") throw new Error("ADMIN_SUPER_REQUIRED");
  return s;
}

/**
 * Try to authenticate an admin user. Order:
 *  1) DB AdminUser table (bcrypt verify)
 *  2) Env-based super admin fallback (legacy/bootstrap)
 *
 * Returns a discriminated result so caller can persist proper session.
 */
export async function authenticateAdmin(
  username: string,
  password: string,
): Promise<
  | { ok: true; kind: "env" }
  | { ok: true; kind: "db"; adminUserId: string }
  | { ok: false }
> {
  const u = (username || "").trim();
  const p = password || "";
  if (!u || !p) return { ok: false };

  try {
    const row = await db.adminUser.findUnique({ where: { username: u } });
    if (row) {
      const match = await verifyPassword(p, row.passwordHash);
      if (match) return { ok: true, kind: "db", adminUserId: row.id };
      return { ok: false };
    }
  } catch {
    // table may not exist; fall through to env auth
  }

  if (u === envAdminUsername() && p === envAdminPassword()) {
    return { ok: true, kind: "env" };
  }
  return { ok: false };
}

/** For internal use by /admins page to create an admin user. */
export async function createAdminUser(opts: {
  username: string;
  password: string;
  role?: "admin" | "super";
}) {
  const passwordHash = await hashPassword(opts.password);
  return db.adminUser.create({
    data: {
      username: opts.username.trim(),
      passwordHash,
      role: opts.role || "admin",
    },
    select: { id: true, username: true, role: true, createdAt: true },
  });
}
