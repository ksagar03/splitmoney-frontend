import {
  brandGradient,
  brandGradientDim,
  palette,
} from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  /** Optional Ionicons icon name shown to the left of the label. */
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  className?: string;
  style?: ViewStyle;
}

export function GradientButton({
  label,
  onPress,
  loading,
  icon,
  className,
  style,
}: GradientButtonProps) {
  return (
    <View
      className={className}
      style={[
        {
          borderRadius: 12,
          shadowColor: palette.brand,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 8,
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={loading ? brandGradientDim : brandGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: 12,
            paddingVertical: 15,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {loading ? (
            <ActivityIndicator color="rgba(255,255,255,0.7)" />
          ) : (
            <>
              {icon && <Ionicons name={icon} size={22} color={palette.ink} />}
              <Text
                style={{
                  color: palette.ink,
                  fontSize: 16,
                  fontWeight: "700",
                  letterSpacing: 0.3,
                }}
              >
                {label}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
