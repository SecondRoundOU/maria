/**
 * Get the base URL for the API
 * Uses API_BASE_URL env var in production, otherwise constructs from request headers
 */
export function getBaseUrl(request?: Request): string {
  // If API_BASE_URL is set, use it
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }

  // Otherwise, construct from request headers
  if (request) {
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    return `${protocol}://${host}`;
  }

  // Fallback
  return 'http://localhost:3000';
}

/**
 * Get the base URL for client-side usage
 */
export function getPublicBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
}
