import { env } from "cloudflare:workers";
import { timingSafeEqual } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { getDb } from "@/db";
import { adminSessions, loginWindows } from "@/db/schema";

export const sessionCookieName = "nati_admin";
export const sessionSeconds = 8 * 60 * 60;
const windowSeconds = 15 * 60;
const maxAttempts = 6;
const encoder = new TextEncoder();
const nowSeconds = () => Math.floor(Date.now() / 1000);
const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
const bytesOf = (value: string) =>
  Uint8Array.from(value.match(/../g)!, (byte) => parseInt(byte, 16));

function verifier() {
  const value = env.BEGOAT_ADMIN_VERIFIER ?? "";
  return /^v1:[a-f0-9]{32}:[a-f0-9]{64}$/.test(value) ? value : null;
}

async function digest(text: string) {
  return hex(
    new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(text))),
  );
}

export async function hasAdminSession(token?: string) {
  const credential = verifier();
  if (!credential || !token || !/^[a-f0-9]{64}$/.test(token)) return false;
  const id = await digest(credential + "/" + token);
  const [row] = await getDb()
    .select({ id: adminSessions.digest })
    .from(adminSessions)
    .where(
      and(
        eq(adminSessions.digest, id),
        gt(adminSessions.expiresAt, nowSeconds()),
      ),
    )
    .limit(1);
  return !!row;
}

export async function revokeSession(token?: string) {
  const credential = verifier();
  if (credential && token && /^[a-f0-9]{64}$/.test(token)) {
    await getDb()
      .delete(adminSessions)
      .where(eq(adminSessions.digest, await digest(credential + "/" + token)));
  }
}

export function cookieHeader(req: Request, value: string, lifetime: number) {
  const url = new URL(req.url);
  const loopback =
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
    url.protocol === "http:";
  return (
    sessionCookieName +
    "=" +
    value +
    "; Path=/; HttpOnly; SameSite=Strict; Max-Age=" +
    lifetime +
    (loopback ? "" : "; Secure")
  );
}

export async function signIn(
  username: string,
  password: string,
  clientIP: string,
) {
  const credential = verifier();
  if (!credential) return { status: 503 } as const;
  const now = nowSeconds();
  const client = await digest(credential + "/client/" + clientIP);
  // Reservar a tentativa no banco mantém o limite mesmo com pedidos simultâneos.
  const reservation = await env
    .DB!.prepare(
      [
        "INSERT INTO login_windows (client, resets_at, attempts) VALUES (?, ?, 1)",
        "ON CONFLICT(client) DO UPDATE SET",
        "attempts = CASE WHEN resets_at <= ? THEN 1 ELSE attempts + 1 END,",
        "resets_at = CASE WHEN resets_at <= ? THEN excluded.resets_at ELSE resets_at END",
        "WHERE resets_at <= ? OR attempts < ? RETURNING attempts",
      ].join(" "),
    )
    .bind(client, now + windowSeconds, now, now, now, maxAttempts)
    .first();
  if (!reservation) return { status: 429 } as const;

  const [, salt, expected] = credential.split(":");
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const value = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: bytesOf(salt),
      iterations: 100000,
    },
    key,
    256,
  );
  const matches = timingSafeEqual(new Uint8Array(value), bytesOf(expected));
  if (!matches || username !== "admin") return { status: 401 } as const;

  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  const db = getDb();
  await db.batch([
    db.delete(adminSessions).where(lt(adminSessions.expiresAt, now)),
    db.delete(loginWindows).where(lt(loginWindows.resetsAt, now)),
    db.delete(loginWindows).where(eq(loginWindows.client, client)),
    db
      .insert(adminSessions)
      .values({
        digest: await digest(credential + "/" + token),
        expiresAt: now + sessionSeconds,
      }),
  ]);
  return { status: 200, token } as const;
}
