import { Redirect } from "expo-router";
import { useAuthStore } from "@/store";

export default function Index() {
  const { userId, companyId } = useAuthStore();

  if (!userId) return <Redirect href="/(auth)/login" />;
  if (!companyId) return <Redirect href="/(auth)/onboarding" />;
  return <Redirect href="/(app)/dashboard" />;
}
