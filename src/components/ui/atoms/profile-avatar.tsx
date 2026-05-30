import Image from "next/image";

type ProfileAvatarProps = {
  alt?: string;
  avatarUrl: string | null;
  className: string;
  imageSize?: number;
  initials: string;
  quality?: number;
};

export function ProfileAvatar({
  alt = "Foto de perfil",
  avatarUrl,
  className,
  imageSize = 80,
  initials,
  quality = 100,
}: ProfileAvatarProps) {
  return (
    <div className={className}>
      {avatarUrl ? (
        <Image
          alt={alt}
          className="h-full w-full object-cover"
          height={imageSize}
          quality={quality}
          src={avatarUrl}
          width={imageSize}
        />
      ) : (
        initials || "A"
      )}
    </div>
  );
}
