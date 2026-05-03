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
