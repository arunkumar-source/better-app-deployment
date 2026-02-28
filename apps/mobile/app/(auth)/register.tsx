import { Link, router, Stack } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";
import { authClient } from "@/lib/auth-client";
import { Toast, useToast } from "@/components/toast";

const EMAIL_REGEX = /^\S+@\S+$/i;

interface RegisterForm {
  email: string;
  name: string;
  password: string;
}

export default function RegisterScreen() {
  const { toast, showToast, hideToast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    try {
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      if ("error" in result && result.error) {
        showToast(
          "Failed to create account: " +
            (result.error.message ?? String(result.error)),
          "error"
        );
        return;
      }
      showToast("Account created successfully!", "success");
      router.push("/(auth)/login");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Registration failed",
        "error"
      );
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Stack.Screen options={{ title: "Register" }} />
      <Text className="mb-6 text-center font-bold text-3xl">
        Create Account
      </Text>

      {/* Name */}
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <>
            <TextInput
              className="mb-2 rounded-xl border border-gray-300 p-4"
              onChangeText={field.onChange}
              placeholder="Full Name"
              value={field.value}
            />
            {errors.name && (
              <Text className="mb-2 text-red-500">{errors.name.message}</Text>
            )}
          </>
        )}
        rules={{ required: "Name is required" }}
      />

      {/* Email */}
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <>
            <TextInput
              autoCapitalize="none"
              className="mb-2 rounded-xl border border-gray-300 p-4"
              keyboardType="email-address"
              onChangeText={field.onChange}
              placeholder="Email"
              value={field.value}
            />
            {errors.email && (
              <Text className="mb-2 text-red-500">{errors.email.message}</Text>
            )}
          </>
        )}
        rules={{
          required: "Email is required",
          pattern: {
            value: EMAIL_REGEX,
            message: "Invalid email",
          },
        }}
      />

      {/* Password */}
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <>
            <TextInput
              className="mb-2 rounded-xl border border-gray-300 p-4"
              onChangeText={field.onChange}
              placeholder="Password"
              secureTextEntry
              value={field.value}
            />
            {errors.password && (
              <Text className="mb-2 text-red-500">
                {errors.password.message}
              </Text>
            )}
          </>
        )}
        rules={{
          required: "Password required",
          minLength: { value: 6, message: "Min 6 characters" },
        }}
      />

      <Pressable
        className="mt-4 items-center rounded-xl bg-black p-4"
        onPress={handleSubmit(onSubmit)}
      >
        <Text className="font-semibold text-white">
          {isSubmitting ? "Creating..." : "Register"}
        </Text>
      </Pressable>
      <Link asChild href="/(auth)/login">
        <Pressable className="mt-6 items-center">
          <Text className="font-medium text-blue-500">
            Already have an account? Login
          </Text>
        </Pressable>
      </Link>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </View>
  );
}
