"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createAdminClient, hasSupabaseAdminConfig } from "@/utils/supabase/admin";

const avatarBucket = "profile-avatars";
const maxAvatarBytes = 5 * 1024 * 1024;
const allowedAvatarTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function uploadProfileAvatar(formData: FormData) {
  const destination = getDestination(formData);

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice(destination, "missing_supabase_admin");
  }

  const file = formData.get("avatarImage");

  if (!(file instanceof File) || !isValidAvatarFile(file)) {
    redirectWithNotice(destination, "avatar_invalid_file");
  }

  const { user } = await requireUser();
  const supabase = createAdminClient();
  const profile = await getProfileAvatar(user.id);
  const bucketError = await ensureAvatarBucket();

  if (bucketError) {
    console.error("ATLETIX avatar bucket failed", bucketError);
    redirectWithNotice(destination, "avatar_upload_failed");
  }

  const extension = allowedAvatarTypes.get(file.type) ?? "jpg";
  const path = `users/${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const uploadResult = await supabase.storage.from(avatarBucket).upload(
    path,
    Buffer.from(await file.arrayBuffer()),
    {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    },
  );

  if (uploadResult.error) {
    console.error("ATLETIX avatar upload failed", uploadResult.error);
    redirectWithNotice(destination, "avatar_upload_failed");
  }

  const { data } = supabase.storage.from(avatarBucket).getPublicUrl(path);
  const publicUrl = data.publicUrl;
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    await supabase.storage.from(avatarBucket).remove([path]);
    console.error("ATLETIX avatar profile update failed", profileError);
    redirectWithNotice(destination, "avatar_profile_update_failed");
  }

  await updateAuthAvatarMetadata(user.id, {
    ...(user.user_metadata ?? {}),
    avatar_url: publicUrl,
  });
  await removeExistingAvatar(profile?.avatar_url, user.id);
  revalidateAvatarPaths();
  redirectWithNotice(destination, "avatar_uploaded");
}

export async function deleteProfileAvatar(formData: FormData) {
  const destination = getDestination(formData);

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice(destination, "missing_supabase_admin");
  }

  const { user } = await requireUser();
  const supabase = createAdminClient();
  const profile = await getProfileAvatar(user.id);
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    console.error("ATLETIX avatar delete update failed", profileError);
    redirectWithNotice(destination, "avatar_profile_update_failed");
  }

  const metadata: Record<string, unknown> = { ...(user.user_metadata ?? {}) };
  delete metadata.avatar_url;

  await updateAuthAvatarMetadata(user.id, metadata);
  await removeExistingAvatar(profile?.avatar_url, user.id);
  revalidateAvatarPaths();
  redirectWithNotice(destination, "avatar_deleted");
}

async function ensureAvatarBucket() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.getBucket(avatarBucket);

  if (!error && data) {
    if (!data.public) {
      const { error: updateError } = await supabase.storage.updateBucket(
        avatarBucket,
        { public: true },
      );

      return updateError;
    }

    return null;
  }

  const { error: createError } = await supabase.storage.createBucket(avatarBucket, {
    allowedMimeTypes: Array.from(allowedAvatarTypes.keys()),
    fileSizeLimit: maxAvatarBytes,
    public: true,
  });

  return createError;
}

async function getProfileAvatar(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

async function updateAuthAvatarMetadata(
  userId: string,
  userMetadata: Record<string, unknown>,
) {
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: userMetadata,
  });

  if (error) {
    console.error("ATLETIX avatar metadata update failed", error);
  }
}

async function removeExistingAvatar(avatarUrl: string | null | undefined, userId: string) {
  const path = getAvatarStoragePath(avatarUrl, userId);

  if (!path) {
    return;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(avatarBucket).remove([path]);

  if (error) {
    console.error("ATLETIX avatar cleanup failed", error);
  }
}

function getAvatarStoragePath(avatarUrl: string | null | undefined, userId: string) {
  if (!avatarUrl) {
    return null;
  }

  const marker = `/storage/v1/object/public/${avatarBucket}/`;
  const markerIndex = avatarUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const path = avatarUrl.slice(markerIndex + marker.length).split("?")[0] ?? "";
  const decodedPath = decodeURIComponent(path);

  return decodedPath.startsWith(`users/${userId}/`) ? decodedPath : null;
}

function isValidAvatarFile(file: File) {
  return (
    file.size > 0 &&
    file.size <= maxAvatarBytes &&
    allowedAvatarTypes.has(file.type)
  );
}

function getDestination(formData: FormData) {
  return formData.get("destination") === "onboarding" ? "onboarding" : "dashboard";
}

function revalidateAvatarPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
}

function redirectWithNotice(destination: string, notice: string): never {
  redirect(`/${destination}?notice=${notice}`);
}
