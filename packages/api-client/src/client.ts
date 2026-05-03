import { ApiError } from "./errors";

export interface ClientConfig {
  baseUrl: string;
  /**
   * Returns headers to attach to every request.
   * On mobile: { Cookie: "<session-cookie-from-secure-store>" }
   * On web: {} (browser handles cookies automatically)
   */
  getHeaders?: () => Promise<Record<string, string>> | Record<string, string>;
}

export function createApiClient(config: ClientConfig) {
  async function request<T>(
    path: string,
    init?: RequestInit
  ): Promise<T> {
    const extraHeaders = config.getHeaders
      ? await config.getHeaders()
      : {};

    const res = await fetch(`${config.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...extraHeaders,
        ...init?.headers,
      },
    });

    // 204 No Content — return undefined cast to T
    if (res.status === 204) return undefined as T;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(
        (body as { error?: string }).error ?? `HTTP ${res.status}`,
        res.status
      );
    }

    return res.json() as Promise<T>;
  }

  return { request };
}

export type ApiClient = ReturnType<typeof createApiClient>;
