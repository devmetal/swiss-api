import { AppType } from "@/index";

export const rest =
  (app: AppType) =>
  (url: string) =>
  (headers: HeadersInit | null) =>
  (method: string, body: unknown = null) => {
    const init: RequestInit = { method };

    init.headers = headers ?? {};

    if (body) {
      init.headers = {
        "Content-Type": "application/json",
        ...init.headers,
      };

      init.body = JSON.stringify(body);
    }

    return app.request(url, init);
  };
