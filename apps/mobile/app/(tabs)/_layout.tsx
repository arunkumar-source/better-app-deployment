import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import LogoutButton from "@/components/logout-button";
import ProtectedLayout from "@/components/protected-layout";

export default function TabsLayout() {
  return (
    <ProtectedLayout>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerRight: () => <LogoutButton />,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => (
              <Ionicons color={color} name="bar-chart-outline" size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="add-work"
          options={{
            title: "Add Work",
            tabBarButtonTestID: "tab-addwork",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                color={color}
                name="add-circle-outline"
                size={size}
                testID="addwork"
              />
            ),
          }}
        />

        <Tabs.Screen
          name="list-works"
          options={{
            title: "List Works",
            tabBarIcon: ({ color, size }) => (
              <Ionicons color={color} name="list-outline" size={size} />
            ),
          }}
        />
      </Tabs>
    </ProtectedLayout>
  );
}
