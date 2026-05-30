import { expireOverdueMemberships } from "@/lib/expire-memberships";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return Response.json(
      { message: "Missing CRON_SECRET.", ok: false },
      { status: 500 },
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json(
      { message: "Unauthorized.", ok: false },
      { status: 401 },
    );
  }

  const result = await expireOverdueMemberships();

  return Response.json(result, { status: result.ok ? 200 : 500 });
}
