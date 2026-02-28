import { Redirect } from "expo-router";
import { View, Text } from "react-native";
import { useSession } from "@/lib/auth-client";

export default function AuthIndex() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  if (isPending) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  // If user is already logged in, redirect to tabs
  if (user) {
    return <Redirect href="/(tabs)/list-works" />;
  }

  return <Redirect href="/(auth)/login" />;
}
