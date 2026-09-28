const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const api = {
  async get(path: string) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return {
      data: await response.json(),
    };
  },
};

export async function getEvent(id: string) {
  const response = await api.get(`/v1/webhook-events/${id}`);
  return response.data;
}
