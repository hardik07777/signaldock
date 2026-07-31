import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000",
});

export async function getEvent(id: string) {
  const response = await api.get(
    `/v1/webhook-events/${id}`
  );

  return response.data;
}