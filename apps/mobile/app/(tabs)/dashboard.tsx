import { ScrollView, Text, View } from "react-native";
import { $api } from "@/lib/api-client";

export default function DashboardScreen() {
  const { data: works = [], isLoading, error } = $api.useQuery("get", "/api");

  const getStatusData = () => {
    const total = works.length;
    if (total === 0) {
      return {
        todo: { count: 0, percentage: 0 },
        "in-progress": { count: 0, percentage: 0 },
        done: { count: 0, percentage: 0 },
        backlog: { count: 0, percentage: 0 },
        cancelled: { count: 0, percentage: 0 },
      };
    }

    const todoCount = works.filter((w) => w.status === "todo").length;
    const inProgressCount = works.filter(
      (w) => w.status === "in-progress"
    ).length;
    const doneCount = works.filter((w) => w.status === "done").length;
    const backlogCount = works.filter((w) => w.status === "backlog").length;
    const cancelledCount = works.filter((w) => w.status === "cancelled").length;

    return {
      todo: { count: todoCount, percentage: (todoCount / total) * 100 },
      "in-progress": {
        count: inProgressCount,
        percentage: (inProgressCount / total) * 100,
      },
      done: { count: doneCount, percentage: (doneCount / total) * 100 },
      backlog: {
        count: backlogCount,
        percentage: (backlogCount / total) * 100,
      },
      cancelled: {
        count: cancelledCount,
        percentage: (cancelledCount / total) * 100,
      },
    };
  };

  const statusData = getStatusData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-yellow-500";
      case "in-progress":
        return "bg-blue-500";
      case "done":
        return "bg-green-500";
      case "backlog":
        return "bg-gray-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-black";
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case "todo":
        return "border-yellow-500";
      case "in-progress":
        return "border-blue-500";
      case "done":
        return "border-green-500";
      case "backlog":
        return "border-gray-500";
      case "cancelled":
        return "border-red-500";
      default:
        return "border-black";
    }
  };

  const getStatusTitle = (status: string) => {
    switch (status) {
      case "todo":
        return "Todo";
      case "in-progress":
        return "In Progress";
      case "done":
        return "Done";
      case "backlog":
        return "Backlog";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center bg-gray-100">
        <Text className="text-center text-base text-gray-500">
          Loading dashboard...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center bg-gray-100">
        <Text className="text-center text-base text-red-500">
          Error loading data
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      contentContainerStyle={{ padding: 16 }}
    >
      <Text className="mb-2 font-bold text-3xl text-gray-800">Dashboard</Text>
      <Text className="mb-6 text-base text-gray-500">Work Status Overview</Text>

      {/* Total Tasks */}
      <View className="mb-6 items-center rounded-xl bg-white p-5 shadow-md">
        <Text className="mb-2 text-base text-gray-500">Total Tasks</Text>
        <Text className="font-bold text-4xl text-gray-800">{works.length}</Text>
      </View>

      {/* Status Cards */}
      <View className="mb-6 space-y-3">
        {Object.entries(statusData).map(([status, data]) => (
          <View
            className={`rounded-xl border-l-4 bg-white p-4 shadow-md ${getBorderColor(
              status
            )}`}
            key={status}
          >
            <Text className="mb-1 font-semibold text-gray-800 text-sm">
              {getStatusTitle(status)}
            </Text>

            <Text className="font-bold text-2xl text-gray-800">
              {data.count}
            </Text>

            <Text className="mb-2 text-gray-500 text-xs">
              {data.percentage.toFixed(1)}%
            </Text>

            {/* Progress Bar */}
            <View className="h-1.5 overflow-hidden rounded bg-gray-200">
              <View
                className={`h-full rounded ${getStatusColor(status)}`}
                style={{ width: `${data.percentage}%` }}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Recent Tasks */}
      <View className="mb-6">
        <Text className="mb-4 font-semibold text-gray-800 text-lg">
          Recent Tasks
        </Text>

        {works.slice(0, 5).map((work) => {
          let dateText = "No date";
          if (work.endDate) {
            dateText = `Due: ${new Date(work.endDate).toLocaleDateString()}`;
          } else if (work.createdAt) {
            dateText = `Created: ${new Date(work.createdAt).toLocaleDateString()}`;
          }

          return (
            <View
              className="mb-3 rounded-xl bg-white p-4 shadow-md"
              key={work.id}
            >
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="mr-3 flex-1 font-semibold text-base text-gray-800">
                  {work.title}
                </Text>

                <View
                  className={`rounded-full px-2 py-1 ${getStatusColor(
                    work.status
                  )}`}
                >
                  <Text className="font-medium text-[10px] text-white">
                    {getStatusTitle(work.status)}
                  </Text>
                </View>
              </View>

              <Text
                className="mb-2 text-gray-500 text-sm leading-5"
                numberOfLines={2}
              >
                {work.description}
              </Text>

              <Text className="text-gray-400 text-xs">{dateText}</Text>
            </View>
          );
        })}

        {works.length === 0 && (
          <Text className="text-center text-base text-gray-500 italic">
            No tasks found
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
