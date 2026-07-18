import { brandGradient } from "@/src/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native";

interface AvatarProps {
  name?: string | null;
  size?: number;
}

export function Avatar({ name, size = 40 }: AvatarProps) {
  const initial = name?.charAt(0).toUpperCase() ?? "?";
  const fontSize = Math.round(size * 0.4);

  return (
    <LinearGradient
      colors={brandGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#FFFFFF", fontSize, fontWeight: "700" }}>
        {initial}
      </Text>
    </LinearGradient>
  );
}
