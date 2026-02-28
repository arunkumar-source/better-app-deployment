import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a query client instance
const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar backgroundColor="#000000" style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
