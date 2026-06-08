import { redirect } from "next/navigation";

// Booking is handled inline on the dashboard (click any available desk)
export default function BookingPage() {
  redirect("/dashboard");
}
