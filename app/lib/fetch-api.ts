// Lightweight fetch-based API client to replace axios
// Reduces bundle size and improves performance

interface FetchOptions extends RequestInit {
  timeout?: number;
  /** Skip console.error for failed requests (e.g. background polling). */
  silent?: boolean;
}

class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

const createFetchApi = (baseURL: string, defaultTimeout = 30000) => {
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const devLog = (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') console.log(...args);
  };

  /** Coalesces identical concurrent GETs (e.g. Strict Mode, parallel hooks) into one network call. */
  const pendingGets = new Map<string, Promise<unknown>>();

  const request = async <T = any>(
    endpoint: string,
    options: FetchOptions = {},
    retries = 3
  ): Promise<T> => {
    const { timeout = defaultTimeout, silent = false, ...fetchOptions } = options;

    const url = endpoint.startsWith('http')
      ? endpoint
      : `${baseURL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

    const method = (fetchOptions.method || 'GET').toUpperCase();

    /** Retries (incl. 429) must stay inside this function so GET dedupe does not recurse into `request()`. */
    const execute = async (): Promise<T> => {
      let remainingRetries = retries;

      const runOnce = async (): Promise<T> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          devLog(`[fetch-api] ${method} ${url}`);

          const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              ...fetchOptions.headers,
            },
          });

          clearTimeout(timeoutId);
          devLog(`[fetch-api] Response status: ${response.status}`);

          if (!response.ok) {
            const isRetryable =
              remainingRetries > 0 &&
              (response.status === 429 || response.status >= 500);

            if (isRetryable) {
              const attempt = retries - remainingRetries;
              const baseDelay = Math.min(Math.pow(2, attempt + 1) * 1000, 5000);
              const jitter = Math.random() * 500;
              const delay = baseDelay + jitter;
              if (!silent) {
                console.warn(
                  `[fetch-api] ${response.status} for ${url}, retrying in ${Math.round(delay)}ms (${remainingRetries} left)`
                );
              }
              remainingRetries -= 1;
              await sleep(delay);
              return runOnce();
            }

            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
              const errorData = await response.json();
              if (errorData.error?.message) {
                errorMessage = errorData.error.message;
              }
            } catch {
              /* ignore */
            }

            throw new FetchError(errorMessage, response.status, response);
          }

          const contentType = response.headers.get('content-type');
          const text = await response.text();

          if (!text || text.trim() === '') {
            devLog(`[fetch-api] Empty response for ${url}`);
            return {} as T;
          }

          if (contentType && contentType.includes('application/json')) {
            return JSON.parse(text) as T;
          }

          return text as unknown as T;
        } catch (error) {
          clearTimeout(timeoutId);

          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              if (!silent) console.error(`[fetch-api] Timeout for ${url}`);
              throw new FetchError('Request timeout', undefined, undefined);
            }

            if (isNetworkError(error) && remainingRetries > 0) {
              const attempt = retries - remainingRetries;
              const delay = Math.min(Math.pow(2, attempt + 1) * 1000, 5000) + Math.random() * 500;
              if (!silent) {
                console.warn(
                  `[fetch-api] Network error for ${url}, retrying in ${Math.round(delay)}ms (${remainingRetries} left)`,
                );
              }
              remainingRetries -= 1;
              await sleep(delay);
              return runOnce();
            }

            const isNotFound =
              error.message?.includes('404') ||
              error.message?.includes('status: 404') ||
              error.message?.toLowerCase().includes('not found');
            if (!silent && !isNotFound) {
              console.error(`[fetch-api] Error for ${url}:`, error.message);
            }
            throw new FetchError(error.message, (error as FetchError).status, (error as FetchError).response);
          }

          console.error(`[fetch-api] Unknown error for ${url}:`, error);
          throw new FetchError('Unknown error occurred');
        }
      };

      return runOnce();
    };

    if (method === 'GET') {
      let shared = pendingGets.get(url);
      if (!shared) {
        shared = execute().finally(() => pendingGets.delete(url)) as Promise<unknown>;
        pendingGets.set(url, shared);
      }
      return shared as Promise<T>;
    }

    return execute();
  };

  return {
    get: <T = any>(endpoint: string, options?: FetchOptions) => 
      request<T>(endpoint, { ...options, method: 'GET' }),
    
    post: <T = any>(endpoint: string, data?: any, options?: FetchOptions) => 
      request<T>(endpoint, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      }),
    
    put: <T = any>(endpoint: string, data?: any, options?: FetchOptions) => 
      request<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      }),
    
    patch: <T = any>(endpoint: string, data?: any, options?: FetchOptions) => 
      request<T>(endpoint, {
        ...options,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      }),
    
    delete: <T = any>(endpoint: string, options?: FetchOptions) => 
      request<T>(endpoint, { ...options, method: 'DELETE' }),
  };
};

function isLoopbackHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
}

function isRemoteHttpBase(base: string): boolean {
  if (!base.startsWith('http')) return false;
  try {
    return !isLoopbackHost(new URL(base).hostname);
  } catch {
    return false;
  }
}

/** Origin of this Next app — used so SSR can hit `/api` rewrites instead of the remote host directly. */
function getNextAppOrigin(): string | null {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) {
    try {
      return new URL(siteUrl).origin;
    } catch {
      /* ignore */
    }
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  const port = process.env.PORT ?? '3000';
  const host = process.env.HOST ?? '127.0.0.1';
  return `http://${host}:${port}`;
}

function shouldProxyThroughNextApp(base: string): boolean {
  if (!isRemoteHttpBase(base)) return false;

  if (typeof window !== 'undefined') {
    try {
      return new URL(base).hostname !== window.location.hostname;
    } catch {
      return true;
    }
  }

  // Server: proxy in dev (Node fetch to remote APIs often fails locally); optional in prod via env.
  if (process.env.NODE_ENV !== 'production') return true;
  return process.env.NEXT_SERVER_API_PROXY === '1';
}

function resolveApiBaseUrl(): string {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

  const isLocalRaw = /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\b/i.test(rawBaseUrl);
  let base = rawBaseUrl.startsWith('http://') && !isLocalRaw
    ? rawBaseUrl.replace(/^http:\/\//i, 'https://')
    : rawBaseUrl;

  if (shouldProxyThroughNextApp(base)) {
    if (typeof window !== 'undefined') {
      return '/api';
    }
    const origin = getNextAppOrigin();
    if (origin) {
      return `${origin.replace(/\/$/, '')}/api`;
    }
  }

  return base;
}

function isNetworkError(error: Error): boolean {
  const msg = error.message?.toLowerCase() ?? '';
  const cause = (error as Error & { cause?: { code?: string } }).cause;
  const code = cause?.code?.toLowerCase() ?? '';
  return (
    msg === 'fetch failed' ||
    msg.includes('econnrefused') ||
    msg.includes('enotfound') ||
    msg.includes('etimedout') ||
    msg.includes('network') ||
    code === 'econnrefused' ||
    code === 'enotfound' ||
    code === 'und_err_connect_timeout'
  );
}

export const api = createFetchApi(resolveApiBaseUrl());

// Export for testing or custom instances
export { createFetchApi, FetchError };
export default api;
