import type { Desk } from "@/types/domain";

async function request<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export function createDesk(name: string): Promise<Desk> {
  return request("/api/desks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export function updateDesk(id: string, fields: { name?: string; isActive?: boolean }): Promise<Desk> {
  return request(`/api/desks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
}

export async function deleteDesk(id: string): Promise<void> {
  const res = await fetch(`/api/desks/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Delete failed");
  }
}
