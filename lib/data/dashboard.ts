import { prisma } from "@/lib/db";
import { toUtcMidnight } from "@/lib/validation";

export type DashboardDesk = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
};

export type DashboardReservation = {
  id: string;
  deskId: string;
  userId: string;
  status: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

export type WeekDay = {
  date: Date;
  label: string; // e.g. "Today", "Tomorrow", "Wed"
  dateLabel: string; // e.g. "Tue, 29 Mar"
  percent: number;
  reservationCount: number;
};

/**
 * Fetch all active desks for a company.
 */
export async function getDashboardDesks(
  companyId: string
): Promise<DashboardDesk[]> {
  return prisma.desk.findMany({
    where: { companyId, isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, isActive: true, createdAt: true },
  });
}

/**
 * Fetch all reservations for a company on the given date, including the user.
 */
export async function getDashboardReservations(
  companyId: string,
  date: Date
): Promise<DashboardReservation[]> {
  return prisma.reservation.findMany({
    where: {
      companyId,
      date: toUtcMidnight(date),
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      deskId: true,
      userId: true,
      status: true,
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  });
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDayLabel(date: Date, index: number): { label: string; dateLabel: string } {
  const day = DAY_NAMES[date.getUTCDay()];
  const d = date.getUTCDate();
  const m = MONTH_NAMES[date.getUTCMonth()];

  const label =
    index === 0 ? "Today" : index === 1 ? "Tomorrow" : day;
  const dateLabel = `${day}, ${d} ${m}`;

  return { label, dateLabel };
}

/**
 * Calculate desk occupancy (%) for the next `days` days starting from `fromDate`.
 * Returns one entry per day including today.
 */
export async function getWeekOccupancy(
  companyId: string,
  deskCount: number,
  fromDate: Date,
  days = 5
): Promise<WeekDay[]> {
  if (deskCount === 0) {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(fromDate);
      date.setUTCDate(date.getUTCDate() + i);
      const midnight = toUtcMidnight(date);
      const { label, dateLabel } = formatDayLabel(midnight, i);
      return { date: midnight, label, dateLabel, percent: 0, reservationCount: 0 };
    });
  }

  const startDate = toUtcMidnight(fromDate);
  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + days);

  const grouped = await prisma.reservation.groupBy({
    by: ["date"],
    where: {
      companyId,
      date: { gte: startDate, lt: endDate },
    },
    _count: { id: true },
  });

  const countByDate = new Map(
    grouped.map((g) => [g.date.getTime(), g._count.id])
  );

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate);
    date.setUTCDate(date.getUTCDate() + i);
    const midnight = toUtcMidnight(date);
    const count = countByDate.get(midnight.getTime()) ?? 0;
    const percent = Math.round((count / deskCount) * 100);
    const { label, dateLabel } = formatDayLabel(midnight, i);
    return { date: midnight, label, dateLabel, percent, reservationCount: count };
  });
}
