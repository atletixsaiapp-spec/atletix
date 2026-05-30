import type { NextConfig } from "next";

const supabaseStorageHost = getSupabaseStorageHost();

const nextConfig: NextConfig = {
  htmlLimitedBots: /.*/,
  images: {
    remotePatterns: [
      {
        hostname: supabaseStorageHost,
        pathname: "/storage/v1/object/public/profile-avatars/**",
        protocol: "https",
      },
      {
        hostname: supabaseStorageHost,
        pathname: "/storage/v1/object/public/payment-proofs/**",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;

function getSupabaseStorageHost() {
  const fallbackHost = "wxbqipkajhpxqrrcvyus.supabase.co";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return fallbackHost;
  }

  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return fallbackHost;
  }
}
