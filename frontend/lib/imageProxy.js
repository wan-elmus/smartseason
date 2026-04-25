const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOSTNAME;

export function getProxiedImageUrl(originalUrl) {
  if (!originalUrl) return null;

  try {
    const url = new URL(originalUrl);
    if (url.hostname !== BACKEND_HOST) {
      return originalUrl;
    }

    return `/api/proxy/image?url=${encodeURIComponent(originalUrl)}`;
  } catch {
    return originalUrl;
  }
}

export function isProxiedImage(url) {
  return url?.startsWith('/api/proxy/');
}