
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function request(
  path: string,
  method: string,
  body?: unknown
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(body !== undefined
      ? { body: JSON.stringify(body) }
      : {}),
    cache: "no-store",
  });

  const text = await response.text();
  let data: any = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message || `API request failed: ${response.status}`
    );
  }

  return { data };
}

export const api = {
  get: (path: string) => request(path, "GET"),

  post: (path: string, body?: unknown) =>
    request(path, "POST", body),

  delete: (path: string) => request(path, "DELETE"),
};

export async function getEvent(id: string) {
  const response = await api.get(
    `/v1/webhook-events/${id}`
  );

  return response.data;
}
