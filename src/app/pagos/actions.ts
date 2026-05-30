"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth";
import { getMemberPayments } from "@/lib/payments";
import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/utils/supabase/admin";

const proofBucket = "payment-proofs";
const maxProofBytes = 8 * 1024 * 1024;
const allowedProofTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function submitPaymentProof(formData: FormData) {
  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice("missing_supabase_admin");
  }

  const paidAt = requiredText(formData.get("paidAt"));
  const file = formData.get("paymentProof");

  if (
    !isDateKey(paidAt) ||
    !(file instanceof File) ||
    !isValidProofFile(file)
  ) {
    redirectWithNotice("invalid_payment_proof");
  }

  const { member, user } = await requireOnboardedUser();

  if (!member) {
    redirect("/onboarding");
  }

  const supabase = createAdminClient();
  const bucketError = await ensureProofBucket();

  if (bucketError) {
    console.error("ATLETIX payment proof bucket failed", bucketError);
    redirectWithNotice("payment_proof_upload_failed");
  }

  const extension = allowedProofTypes.get(file.type) ?? "jpg";
  const path = `members/${member.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const uploadResult = await supabase.storage
    .from(proofBucket)
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (uploadResult.error) {
    console.error("ATLETIX payment proof upload failed", uploadResult.error);
    redirectWithNotice("payment_proof_upload_failed");
  }

  const { data } = supabase.storage.from(proofBucket).getPublicUrl(path);
  const screenshotUrl = data.publicUrl;
  const { error: paymentError } = await supabase.from("payments").insert({
    member_id: member.id,
    method: "transfer",
    paid_at: paidAt,
    screenshot_url: screenshotUrl,
    source: "manual",
    status: "pending",
    submitted_by: user.id,
  });

  if (paymentError) {
    await supabase.storage.from(proofBucket).remove([path]);
    console.error("ATLETIX pending payment insert failed", paymentError);
    redirectWithNotice("payment_proof_failed");
  }

  revalidatePaymentPaths();
  redirectWithNotice("payment_proof_submitted");
}

export async function loadMoreMemberPayments(offset: number) {
  const { member } = await requireOnboardedUser();

  if (!member) {
    redirect("/onboarding");
  }

  const safeOffset = Number.isInteger(offset) && offset > 0 ? offset : 0;

  return getMemberPayments({
    limit: 10,
    memberId: member.id,
    offset: safeOffset,
  });
}

async function ensureProofBucket() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.getBucket(proofBucket);

  if (!error && data) {
    if (!data.public) {
      const { error: updateError } = await supabase.storage.updateBucket(
        proofBucket,
        { public: true },
      );

      return updateError;
    }

    return null;
  }

  const { error: createError } = await supabase.storage.createBucket(
    proofBucket,
    {
      allowedMimeTypes: Array.from(allowedProofTypes.keys()),
      fileSizeLimit: maxProofBytes,
      public: true,
    },
  );

  return createError;
}

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function isDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidProofFile(file: File) {
  return (
    file.size > 0 &&
    file.size <= maxProofBytes &&
    allowedProofTypes.has(file.type)
  );
}

function revalidatePaymentPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/pagos");
  revalidatePath("/pagos/agregar");
  revalidatePath("/admin/pagos");
}

function redirectWithNotice(notice: string): never {
  redirect(`/pagos/agregar?notice=${notice}`);
}
