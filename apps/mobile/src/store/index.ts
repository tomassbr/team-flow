import { create } from "zustand";
import type { UserRole } from "@team-flow/shared";

// ─── Auth Store ────────────────────────────────────────────────────────────────

interface AuthState {
  userId: string | null;
  email: string | null;
  name: string | null;
  image: string | null;
  companyId: string | null;
  role: UserRole | null;
  /** True while hydrating session from SecureStore on app launch */
  isLoading: boolean;
}

interface AuthActions {
  setSession: (user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    companyId: string | null;
    role: UserRole;
  }) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  userId: null,
  email: null,
  name: null,
  image: null,
  companyId: null,
  role: null,
  isLoading: true,

  setSession: (user) =>
    set({
      userId: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      companyId: user.companyId,
      role: user.role,
      isLoading: false,
    }),

  clearSession: () =>
    set({
      userId: null,
      email: null,
      name: null,
      image: null,
      companyId: null,
      role: null,
      isLoading: false,
    }),

  setLoading: (loading) => set({ isLoading: loading }),
}));

// ─── Dashboard / UI Store ──────────────────────────────────────────────────────

interface DashboardState {
  /** The currently selected date on the dashboard date strip */
  selectedDate: Date;
  /** The desk id that the user tapped (for the BookDesk bottom sheet) */
  selectedDeskId: string | null;
}

interface DashboardActions {
  setDate: (date: Date) => void;
  setSelectedDesk: (id: string | null) => void;
}

export const useDashboardStore = create<DashboardState & DashboardActions>(
  (set) => ({
    selectedDate: new Date(),
    selectedDeskId: null,

    setDate: (date) => set({ selectedDate: date, selectedDeskId: null }),
    setSelectedDesk: (id) => set({ selectedDeskId: id }),
  })
);
