import crypto from "node:crypto";
import { createQrSvg } from "@/lib/qr-code";

const tokenVersion = "v1";
const tokenLifetimeMs = 30 * 24 * 60 * 60 * 1000;

export function createAttendanceQr(memberId: string) {
  const expiresAt = new Date(Date.now() + tokenLifetimeMs);
  const token = createAttendanceToken(memberId, expiresAt);

  return {
    expiresAt: expiresAt.toISOString(),
    svg: createQrSvg(token),
    token,
  };
}

export function verifyAttendanceToken(token: string) {
  const [version, memberId, expiresAtSeconds, signature] = token.split(".");

  if (
    version !== tokenVersion ||
    !isUuid(memberId) ||
    !expiresAtSeconds ||
    !signature
  ) {
    return null;
  }

  const expiresAtMs = Number(expiresAtSeconds) * 1000;

  if (!Number.isFinite(expiresAtMs) || expiresAtMs < Date.now()) {
    return null;
  }

  const payload = `${version}.${memberId}.${expiresAtSeconds}`;
  const expectedSignature = signPayload(payload);

  if (!secureCompare(signature, expectedSignature)) {
    return null;
  }

  return { memberId };
}

function createAttendanceToken(memberId: string, expiresAt: Date) {
  const expiresAtSeconds = Math.floor(expiresAt.getTime() / 1000);
  const payload = `${tokenVersion}.${memberId}.${expiresAtSeconds}`;

  return `${payload}.${signPayload(payload)}`;
}

function signPayload(payload: string) {
  return crypto
    .createHmac("sha256", getQrSecret())
    .update(payload)
    .digest()
    .subarray(0, 16)
    .toString("base64url");
}

function getQrSecret() {
  return (
    process.env.ATLETIX_ATTENDANCE_QR_SECRET ??
    process.env.ATLETIX_ADMIN_SESSION_SECRET ??
    process.env.ATLETIX_ADMIN_PASSWORD ??
    "missing-atletix-attendance-secret"
  );
}

function secureCompare(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  return (
    valueBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(valueBuffer, expectedBuffer)
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
