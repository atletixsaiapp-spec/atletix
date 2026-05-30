"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { ProfileAvatar } from "@/components/ui/atoms/profile-avatar";

type ProfileAvatarPreviewButtonProps = {
  alt?: string;
  avatarUrl: string | null;
  className: string;
  imageSize?: number;
  initials: string;
};

export function ProfileAvatarPreviewButton({
  alt = "Foto de perfil",
  avatarUrl,
  className,
  imageSize = 80,
  initials,
}: ProfileAvatarPreviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!avatarUrl) {
    return (
      <ProfileAvatar
        alt={alt}
        avatarUrl={avatarUrl}
        className={className}
        imageSize={imageSize}
        initials={initials}
      />
    );
  }

  return (
    <>
      <button
        className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#ff8bd8] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        onClick={() => setIsOpen(true)}
        title="Ver foto completa"
        type="button"
      >
        <ProfileAvatar
          alt={alt}
          avatarUrl={avatarUrl}
          className={className}
          imageSize={imageSize}
          initials={initials}
        />
        <span className="sr-only">Ver foto completa</span>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Foto de perfil completa"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d10] p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full border border-white/15 bg-black/65 text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8bd8]"
              onClick={() => setIsOpen(false)}
              title="Cerrar"
              type="button"
            >
              <X size={20} />
              <span className="sr-only">Cerrar</span>
            </button>
            <div className="relative min-h-[65vh] overflow-hidden rounded-2xl bg-black">
              <Image
                alt={alt}
                className="object-contain"
                fill
                sizes="(max-width: 768px) 92vw, 768px"
                src={avatarUrl}
                unoptimized
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
