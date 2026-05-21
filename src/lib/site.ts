export function getSiteUrl() {
  if (process.env.ATLETIX_SITE_URL) {
    return process.env.ATLETIX_SITE_URL;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (vercelProductionUrl?.startsWith("http")) {
    return vercelProductionUrl;
  }

  if (vercelProductionUrl) {
    return `https://${vercelProductionUrl}`;
  }

  return "https://atletix.vercel.app";
}
