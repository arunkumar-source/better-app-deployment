import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";
import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Pressable className="rounded-lg bg-black px-4 py-2" onPress={handleLogout}>
      <Text className="font-medium text-white">Logout</Text>
    </Pressable>
  );
}
