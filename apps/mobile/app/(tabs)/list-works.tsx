import type { Work } from "@repo/shared";
import { useRouter } from "expo-router";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { $api } from "@/lib/api-client";

export default function WorkListScreen() {
  const router = useRouter();

  // Fetch works
  const worksQuery = $api.useQuery("get", "/api");

  // Delete mutation with automatic refresh
  const deleteWork = $api.useMutation("delete", "/api/delete/{id}", {
    onSuccess: () => {
      // Refetch list automatically after delete
      worksQuery.refetch();
    },
    onError: (err) => {
      console.error("Delete error:", err);
      Alert.alert("Error", "Failed to delete work");
    },
  });

  const handleDelete = (id: string) => {
    Alert.alert("Confirm Delete", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteWork.mutate({
            params: { path: { id } },
          });
        },
      },
    ]);
  };

  const handleEdit = (work: Work) => {
    router.push({
      pathname: "/(tabs)/add-work",
      params: {
        editMode: "true",
        workId: work.id,
        title: work.title,
        description: work.description,
        status: work.status,
        endDate: work.endDate
          ? new Date(work.endDate).toISOString().split("T")[0]
          : "",
      },
    });
  };

  if (worksQuery.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text className="text-gray-700">Loading...</Text>
      </View>
    );
  }

  if (worksQuery.isError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text className="text-red-500">Failed to load works</Text>
      </View>
    );
  }

  const works = worksQuery.data || [];

  if (works.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text className="text-gray-700">No works found.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Work }) => (
    <View className="mb-4 rounded-md bg-white p-4 shadow">
      <Text className="mb-1 font-bold text-lg">{item.title}</Text>
      <Text className="mb-2 text-gray-700">{item.description}</Text>
      <Text className="mb-2 text-gray-500 text-sm">Status: {item.status}</Text>

      {item.endDate && (
        <Text className="mb-2 text-gray-500 text-sm">
          Ends: {new Date(item.endDate).toLocaleString()}
        </Text>
      )}

      <View className="flex-row justify-end space-x-2">
        <TouchableOpacity
          className="rounded-md bg-blue-500 px-3 py-1"
          onPress={() => handleEdit(item)}
        >
          <Text className="text-white">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded-md bg-red-500 px-3 py-1"
          onPress={() => handleDelete(item.id)}
        >
          <Text className="text-white">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      className="bg-gray-100 p-4"
      contentContainerStyle={{ paddingBottom: 20 }}
      data={works}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
    />
  );
}
