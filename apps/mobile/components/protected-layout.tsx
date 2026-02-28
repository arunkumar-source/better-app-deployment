import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useSession } from "@/lib/auth-client";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!(isPending || session)) {
      router.replace("/(auth)/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#000" size="large" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {children}
    </>
  );
}
