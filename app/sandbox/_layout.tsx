import { Stack } from "expo-router";

export default function SandboxLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0E0E1C" },
        headerTintColor: "#8B5CF6",
        headerTitleStyle: { color: "#FFFFFF", fontWeight: "700" },
        contentStyle: { backgroundColor: "#080812" },
      }}
    />
  );
}
