import crypto from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "atletix_admin_session";
const sessionDurationMs = 12 * 60 * 60 * 1000;

type CookieStore = Awaited<ReturnType<typeof cookies>>;

type AdminSessionPayload = {
  exp: number;
  username: string;
};

export function getAdminCredentials() {
  const username = process.env.ATLETIX_ADMIN_USERNAME;
  const password = process.env.ATLETIX_ADMIN_PASSWORD;

  if (!username || !password) {
    return null;
  }

  return { username, password };
}

export function isAdminCredentialMatch({
  password,
  username,
}: {
  password: string;
  username: string;
}) {
  const credentials = getAdminCredentials();

  if (!credentials) {
    return false;
  }

  return (
    secureCompare(username.trim(), credentials.username) &&
    secureCompare(password, credentials.password)
  );
}

export function createAdminSessionCookie(cookieStore: CookieStore) {
  const credentials = getAdminCredentials();

  if (!credentials) {
    return false;
  }

  const payload: AdminSessionPayload = {
    exp: Date.now() + sessionDurationMs,
    username: credentials.username,
  };

  cookieStore.set(cookieName, signPayload(payload), {
    httpOnly: true,
    maxAge: sessionDurationMs / 1000,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return true;
}

export function getAdminSession(cookieStore: CookieStore) {
  const rawCookie = cookieStore.get(cookieName)?.value;

  if (!rawCookie) {
    return null;
  }

  const payload = verifyPayload(rawCookie);
  const credentials = getAdminCredentials();

  if (!payload || !credentials) {
    return null;
  }

  if (payload.exp < Date.now() || payload.username !== credentials.username) {
    return null;
  }

  return payload;
}

function signPayload(payload: AdminSessionPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

function verifyPayload(value: string) {
  const [encodedPayload, signature] = value.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");

  if (!secureCompare(signature, expectedSignature)) {
    return null;
  }

  try {
    return JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as AdminSessionPayload;
  } catch {
    return null;
  }
}

function getSessionSecret() {
  return (
    process.env.ATLETIX_ADMIN_SESSION_SECRET ??
    process.env.ATLETIX_ADMIN_PASSWORD ??
    "missing-atletix-admin-secret"
  );
}

function secureCompare(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(valueBuffer, expectedBuffer);
}
