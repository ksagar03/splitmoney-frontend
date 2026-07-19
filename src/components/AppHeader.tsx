import { Avatar } from "@/src/components/ui";
import { PressableScale } from "@/src/components/ui/PressableScale";
import { palette } from "@/src/constants/theme";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

interface Props {
  title: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
}

export default function AppHeader({
  title,
  showBackButton,
  rightElement,
}: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setShowProfile(false);
    await logout();
  };

  return (
    <>
      <View className="flex-row justify-between items-center px-6 pt-5 pb-4">
        <View className=" flex-row items-center min-w-[44px]">
          {showBackButton && (
            <TouchableOpacity
              onPress={() => router.back()}
              className="-ml-1 mr-3"
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-back" size={28} color={palette.ink} />
            </TouchableOpacity>
          )}
        </View>
        <Text
          numberOfLines={1}
          className={`text-ink font-extrabold tracking-tight ${
            showBackButton ? "text-2xl" : "text-[32px]"
          }`}
        >
          {title}
        </Text>
        <View className="min-w-[44px] items-end">
          {rightElement ?? (
            <PressableScale onPress={() => setShowProfile(true)}>
              <Avatar name={user?.name} size={40} />
            </PressableScale>
          )}
        </View>
      </View>

      {/* ── Profile bottom sheet ── */}
      <Modal
        visible={showProfile}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProfile(false)}
      >
        <Pressable
          className="flex-1 bg-black/60"
          onPress={() => setShowProfile(false)}
        />

        <View className="bg-surface rounded-t-4xl border border-brand/20 px-8 pt-3 pb-10 items-center">
          <View className="w-10 h-1 rounded-full bg-white/15 mb-7" />
          <Animated.View
            entering={FadeInUp.duration(300)}
            className="items-center"
          >
            <Avatar name={user?.name} size={72} />
          </Animated.View>

          <Text className="text-ink text-xl font-bold tracking-tight mt-4 mb-1">
            {user?.name ?? "—"}
          </Text>
          <Text className="text-ink-faint text-sm">{user?.email ?? "—"}</Text>

          <View className="w-full h-px bg-white/[0.06] my-6" />
          <PressableScale
            className="flex-row items-center justify-center bg-danger/10 border border-danger/25 rounded-xl py-3.5 px-8 gap-2.5"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={palette.danger} />
            <Text className="text-danger text-base font-semibold">
              Sign Out
            </Text>
          </PressableScale>
        </View>
      </Modal>
    </>
  );
}
