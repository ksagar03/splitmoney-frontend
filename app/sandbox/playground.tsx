/**
 * Playground — scratch area for quick UI trials.
 * Duplicate this file and rename it when you start a new experiment.
 */
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Playground() {
  return (
    <SafeAreaView style={s.root}>
      <View style={s.center}>
        <Text style={s.emoji}>🧪</Text>
        <Text style={s.heading}>Playground</Text>
        <Text style={s.hint}>Start designing here — refreshes stay on this screen.</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#080812" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10, paddingHorizontal: 32 },
  emoji: { fontSize: 48 },
  heading: { color: "#FFFFFF", fontSize: 24, fontWeight: "800" },
  hint: { color: "#6B7280", fontSize: 15, textAlign: "center", lineHeight: 22 },
});
