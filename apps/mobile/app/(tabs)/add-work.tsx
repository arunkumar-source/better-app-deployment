import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import type { WorkStatus } from "@repo/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { $api } from "@/lib/api-client";
import { Toast, useToast } from "@/components/toast";

interface FormValues {
  description: string;
  endDate: Date | null;
  endTime: Date | null;
  status: WorkStatus;
  title: string;
}

export default function AddWorkScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast, showToast, hideToast } = useToast();
  const params = useLocalSearchParams<{
    editMode: string;
    workId: string;
    title: string;
    description: string;
    status: WorkStatus;
    endDate: string;
  }>();

  const isEditMode = params.editMode === "true";
  const workId = params.workId;

  const createWork = $api.useMutation("post", "/api/add");
  const updateWork = $api.useMutation("patch", "/api/update/{id}");

  const { control, handleSubmit, reset } = useForm<FormValues>();

  useEffect(() => {
    if (isEditMode) {
      reset({
        title: params.title || "",
        description: params.description || "",
        status: params.status || "todo",
        endDate: params.endDate ? new Date(params.endDate) : null,
        endTime: null,
      });
    } else {
      reset({
        title: "",
        description: "",
        status: "todo",
        endDate: null,
        endTime: null,
      });
    }
  }, [
    isEditMode,
    params.title,
    params.description,
    params.status,
    params.endDate,
    reset,
  ]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    try {
      let endDateTime: string | undefined;
      if (data.endDate && data.endTime) {
        const date = new Date(data.endDate);
        const time = new Date(data.endTime);
        date.setHours(time.getHours(), time.getMinutes());
        endDateTime = date.toISOString();
      }

      if (isEditMode && workId) {
        // Update existing work
        await updateWork.mutateAsync({
          params: { path: { id: workId } },
          body: {
            title: data.title,
            description: data.description,
            status: data.status,
            endDate: endDateTime,
          },
        });

        queryClient.invalidateQueries({ queryKey: ["get", "/api"] });

        reset();
        showToast("Work updated successfully!", "success");
        setTimeout(() => {
          router.push("/(tabs)/list-works");
        }, 1000);
      } else {
        await createWork.mutateAsync({
          body: {
            title: data.title,
            description: data.description,
            status: data.status,
            endDate: endDateTime,
          },
        });

        queryClient.invalidateQueries({ queryKey: ["get", "/api"] });

        showToast("Work added successfully!", "success");

        setTimeout(() => {
          router.push("/(tabs)/list-works");
        }, 1000);
        reset();
      }
    } catch (err) {
      console.error(err);
      showToast(`Failed to ${isEditMode ? "update" : "add"} work`, "error");
    }
  });

  let submitText = "";
  if (createWork.isPending || updateWork.isPending) {
    submitText = isEditMode ? "Updating..." : "Adding...";
  } else {
    submitText = isEditMode ? "Update Work" : "Add Work";
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="mb-6 font-bold text-2xl">
        {isEditMode ? "Edit Work" : "Add Work"}
      </Text>

      {/* Title */}
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View className="mb-4">
            <Text className="mb-1 font-medium">Title</Text>
            <TextInput
              className="rounded-md border border-gray-300 p-2"
              onChangeText={onChange}
              placeholder="Enter title"
              value={value}
            />
            {error && (
              <Text className="mt-1 text-red-500">{error.message}</Text>
            )}
          </View>
        )}
        rules={{
          required: "Title is required",
          minLength: { value: 3, message: "Min 3 chars" },
        }}
      />

      {/* Description */}
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View className="mb-4">
            <Text className="mb-1 font-medium">Description</Text>
            <TextInput
              className="h-24 rounded-md border border-gray-300 p-2 text-top"
              multiline
              numberOfLines={4}
              onChangeText={onChange}
              placeholder="Enter description"
              value={value}
            />
            {error && (
              <Text className="mt-1 text-red-500">{error.message}</Text>
            )}
          </View>
        )}
        rules={{
          required: "Description is required",
          minLength: { value: 10, message: "Min 10 chars" },
        }}
      />

      {/* End Date */}
      <Controller
        control={control}
        name="endDate"
        render={({ field: { value, onChange } }) => (
          <View className="mb-4">
            <Text className="mb-1 font-medium">End Date (Optional)</Text>
            <TouchableOpacity
              className="rounded-md border border-gray-300 p-2"
              onPress={() => setShowDatePicker(true)}
              testID="date selection"
            >
              <Text>{value ? value.toDateString() : "Select Date"}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                display={Platform.OS === "ios" ? "spinner" : "default"}
                mode="date"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) {
                    onChange(selectedDate);
                  }
                }}
                testID="date picking"
                value={value || new Date()}
              />
            )}
          </View>
        )}
      />

      {/* End Time */}
      <Controller
        control={control}
        name="endTime"
        render={({ field: { value, onChange } }) => (
          <View className="mb-4">
            <Text className="mb-1 font-medium">End Time (Optional)</Text>
            <TouchableOpacity
              className="rounded-md border border-gray-300 p-2"
              onPress={() => setShowTimePicker(true)}
            >
              <Text>
                {value
                  ? `${value.getHours().toString().padStart(2, "0")}:${value
                      .getMinutes()
                      .toString()
                      .padStart(2, "0")}`
                  : "Select Time"}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                display={Platform.OS === "ios" ? "spinner" : "default"}
                is24Hour
                mode="time"
                onChange={(_, selectedTime) => {
                  setShowTimePicker(Platform.OS === "ios");
                  if (selectedTime) {
                    onChange(selectedTime);
                  }
                }}
                value={value || new Date()}
              />
            )}
          </View>
        )}
      />

      {/* Status */}
      <Controller
        control={control}
        name="status"
        render={({ field: { value, onChange } }) => (
          <View className="mb-6">
            <Text className="mb-1 font-medium">Status</Text>
            <View className="overflow-hidden rounded-md border border-gray-300">
              <Picker onValueChange={onChange} selectedValue={value}>
                <Picker.Item label="Backlog" value="backlog" />
                <Picker.Item label="Todo" value="todo" />
                <Picker.Item label="In Progress" value="in-progress" />
                <Picker.Item label="Done" value="done" />
                <Picker.Item label="Cancelled" value="cancelled" />
              </Picker>
            </View>
          </View>
        )}
      />

      {/* Submit */}
      <TouchableOpacity
        className={`items-center rounded-md bg-black p-3 ${createWork.isPending || updateWork.isPending ? "opacity-50" : ""}`}
        disabled={createWork.isPending || updateWork.isPending}
        onPress={onSubmit}
      >
        <Text className="font-bold text-white">{submitText}</Text>
      </TouchableOpacity>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </ScrollView>
  );
}
