/**
 * Sandbox index — lists all your experimental screens.
 * Add a new entry to SCREENS whenever you create app/sandbox/<name>.tsx
 */
import { useRouter } from "expo-router";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SCREENS: { name: string; route: string; description?: string }[] = [
  { name: "Playground", route: "/sandbox/playground", description: "Scratch area" },
  // Add more entries as you create new screens:
  // { name: "New Expense Form", route: "/sandbox/new-expense-form" },
];

export default function SandboxIndex() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Ionicons name="flask-outline" size={28} color="#8B5CF6" style={{ marginRight: 10 }} />
        <Text style={s.title}>Sandbox</Text>
      </View>
      <Text style={s.subtitle}>Pick a screen to design &amp; iterate — no auth interference.</Text>

      <FlatList
        data={SCREENS}
        keyExtractor={(item) => item.route}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.row}
            activeOpacity={0.7}
            onPress={() => router.push(item.route as any)}
          >
            <View style={s.rowText}>
              <Text style={s.rowName}>{item.name}</Text>
              {item.description && <Text style={s.rowDesc}>{item.description}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#080812" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingTop: 24, paddingBottom: 4 },
  title: { color: "#FFFFFF", fontSize: 26, fontWeight: "800" },
  subtitle: { color: "#6B7280", fontSize: 14, paddingHorizontal: 24, marginBottom: 20 },
  list: { paddingHorizontal: 24, gap: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0E0E1C",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
    padding: 18,
  },
  rowText: { flex: 1 },
  rowName: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  rowDesc: { color: "#6B7280", fontSize: 13, marginTop: 2 },
});
