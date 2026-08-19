import { Tabs } from "expo-router";
import { FloatingTabBar } from "@/components/ui/FloatingTabBar";

export default function AppLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard/index" />
      <Tabs.Screen name="dashboard/book" options={{ href: null }} />
      <Tabs.Screen name="reservations/index" />
      <Tabs.Screen name="settings/index" />
      <Tabs.Screen name="admin/desks" options={{ href: null }} />
    </Tabs>
  );
}
