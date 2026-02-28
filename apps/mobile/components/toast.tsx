import { useEffect, useState } from "react";
import { Animated, Text, View } from "react-native";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  visible: boolean;
  onHide: () => void;
}

export function Toast({
  message,
  type = "success",
  visible,
  onHide,
}: ToastProps) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onHide());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, onHide]);

  if (!visible) {
    return null;
  }

  const bgColor = type === "error" ? "bg-red-500" : "bg-green-500";

  return (
    <View className="absolute top-12 right-4 left-4 z-50">
      <Animated.View
        className={`${bgColor} rounded-lg p-4 shadow-lg`}
        style={{ opacity: fadeAnim }}
      >
        <Text className="text-center font-medium text-white">{message}</Text>
      </Animated.View>
    </View>
  );
}

// Hook for managing toast state
export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    visible: boolean;
  }>({ message: "", type: "success", visible: false });

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return { toast, showToast, hideToast };
}
