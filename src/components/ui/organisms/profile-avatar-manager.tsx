"use client";

import { Camera } from "lucide-react";
import { uploadProfileAvatar } from "@/app/profile-image/actions";
import { ProfileAvatarPreviewButton } from "@/components/ui/atoms/profile-avatar-preview-button";

type ProfileAvatarManagerProps = {
  avatarUrl: string | null;
  destination: "dashboard" | "onboarding";
  initials: string;
  showPreview?: boolean;
};

export function ProfileAvatarManager({
  avatarUrl,
  destination,
  initials,
  showPreview = true,
}: ProfileAvatarManagerProps) {
  return (
    <div className="grid gap-4">
      {showPreview ? (
        <div className="flex items-center gap-4">
          <EditableAvatarPreview
            avatarUrl={avatarUrl}
            destination={destination}
            initials={initials}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff8bd8]">
              Foto de perfil
            </p>
            <p className="mt-1 text-sm leading-6 text-zinc-400">
              {avatarUrl ? "Foto cargada" : "Sin foto"}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function EditableAvatarPreview({
  avatarUrl,
  destination,
  initials,
}: {
  avatarUrl: string | null;
  destination: "dashboard" | "onboarding";
  initials: string;
}) {
  return (
    <div className="relative size-20 shrink-0">
      <AvatarPreview avatarUrl={avatarUrl} initials={initials} />

      <form action={uploadProfileAvatar}>
        <input name="destination" type="hidden" value={destination} />
        <label
          className="absolute -bottom-1 -right-1 grid size-9 cursor-pointer place-items-center rounded-full border border-white/20 bg-[#ff2fa8] text-white shadow-[0_0_18px_rgba(255,47,168,0.35)] transition hover:bg-[#ff58b9]"
          title={avatarUrl ? "Cambiar foto" : "Subir foto"}
        >
          <Camera size={17} />
          <span className="sr-only">{avatarUrl ? "Cambiar foto" : "Subir foto"}</span>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            name="avatarImage"
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
            required
            type="file"
          />
        </label>
      </form>

    </div>
  );
}

export function AvatarPreview({
  avatarUrl,
  initials,
}: {
  avatarUrl: string | null;
  initials: string;
}) {
  return (
    <ProfileAvatarPreviewButton
      avatarUrl={avatarUrl}
      className="avatar-aura grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border border-[#ff2fa8]/50 bg-[#ff2fa8]/10 text-2xl font-black text-white"
      initials={initials}
    />
  );
}
