import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: selected ? "rgba(139, 92, 246, 0.2)" : "#0E0E1C",
        borderWidth: 1,
        borderColor: selected ? "#8B5CF6" : "rgba(255,255,255,0.1)",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 24,
      }}
    >
      <Text
        style={{
          color: selected ? "#FFFFFF" : "#9CA3AF",
          fontSize: 15,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
      {selected && (
        <Ionicons
          name="checkmark"
          size={16}
          color="#FFFFFF"
          style={{ marginLeft: 4 }}
        />
      )}
    </TouchableOpacity>
  );
}
