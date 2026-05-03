import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store";
import { authService } from "@/features/auth/authService";
import { ThemeProvider } from "@/theme";

export default function RootLayout() {
  const { setSession, clearSession, isLoading } = useAuthStore();

  useEffect(() => {
    // Hydrate auth state from SecureStore on app launch
    authService.getSession().then((session) => {
      if (session) {
        setSession(session);
      } else {
        clearSession();
      }
    });
  }, [setSession, clearSession]);

  // Keep splash screen visible while checking session
  if (isLoading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
