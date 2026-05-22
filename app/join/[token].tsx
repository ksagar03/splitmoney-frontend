import { JOIN_GROUP, GET_GROUPS } from "@/src/graphql/mutation";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useMutation } from "@apollo/client";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function JoinGroupScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setPendingInviteToken = useAuthStore((s) => s.setPendingInviteToken);
  const router = useRouter();
  const handled = useRef(false);

  const [joinGroup] = useMutation(JOIN_GROUP, {
    refetchQueries: [{ query: GET_GROUPS }],
  });

  useEffect(() => {
    if (handled.current || !token) return;
    handled.current = true;

    if (!isAuthenticated) {
      // Store the token and send them to auth — after login the auth screen will join
      setPendingInviteToken(token);
      router.replace("/(auth)");
      return;
    }

    joinGroup({ variables: { token } })
      .then(() => router.replace("/(tabs)"))
      .catch(() => router.replace("/(tabs)"));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.text}>Joining group…</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080812" },
  inner: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  text: { color: "#9CA3AF", fontSize: 16 },
});
