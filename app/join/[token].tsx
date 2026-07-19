import { Screen, contentEntering } from "@/src/components/ui";
import { palette } from "@/src/constants/theme";
import { GET_GROUPS, JOIN_GROUP } from "@/src/graphql/mutation";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useMutation } from "@apollo/client";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Text } from "react-native";
import Animated from "react-native-reanimated";

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
    <Screen>
      <Animated.View
        entering={contentEntering()}
        className="flex-1 justify-center items-center gap-4 "
      >
        <ActivityIndicator size="large" color={palette.brand} />
        <Text className="text-ink-muted text-base">Joining group…</Text>
      </Animated.View>
    </Screen>
  );
}
