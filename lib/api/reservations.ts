export interface Reservation {
  id: string;
  deskId: string;
  userId: string;
  status: string;
}

export function createReservation(deskId: string, date: string): Promise<Reservation> {
  return fetch("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deskId, date }),
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Booking failed");
    return data as Reservation;
  });
}

export function cancelReservation(id: string): Promise<void> {
  return fetch(`/api/reservations?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  }).then(async (res) => {
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string }).error ?? "Cancel failed");
    }
  });
}
