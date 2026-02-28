import { Link, Stack, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";
import { authClient } from "@/lib/auth-client";
import { Toast, useToast } from "@/components/toast";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const route = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        console.error("Login error:", result.error);
        showToast(result.error.message || "Login failed", "error");
        return;
      }

      route.push("/(tabs)/list-works");
    } catch (err) {
      console.error("Login exception:", err);
      showToast("Login failed. Please try again.", "error");
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Stack.Screen options={{ title: "Login" }} />
      <Text className="mb-6 text-center font-bold text-3xl">Welcome Back</Text>

      {/* Email */}
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <>
            <TextInput
              autoCapitalize="none"
              className="mb-2 rounded-xl border border-gray-300 p-4"
              onChangeText={field.onChange}
              placeholder="Email"
              value={field.value}
            />
            {errors.email && (
              <Text className="mb-2 text-red-500">{errors.email.message}</Text>
            )}
          </>
        )}
        rules={{ required: "Email is required" }}
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
        rules={{ required: "Password required" }}
      />

      <Pressable
        className="mt-4 items-center rounded-xl bg-black p-4"
        onPress={handleSubmit(onSubmit)}
      >
        <Text className="font-semibold text-white">
          {isSubmitting ? "Logging in..." : "Login"}
        </Text>
      </Pressable>
      <Link asChild href="/(auth)/register">
        <Pressable className="mt-6 items-center">
          <Text className="font-medium text-blue-500">
            Don't have an account? Register
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
