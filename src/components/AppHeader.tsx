import { useAuthStore } from "@/src/store/useAuthStore";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {useRouter} from "expo-router";

interface Props {
  title: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
}

export default function AppHeader({ title, showBackButton, rightElement }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter();

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "?";

  const handleLogout = async () => {
    setShowProfile(false);
    await logout();
  };

  return (
    <>
      <View style={styles.header}>
        <View style= {styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.title, showBackButton && styles.titleSmall]}>{title}</Text>
        <View style={styles.rightContainer}>
          {rightElement ?? (
            <TouchableOpacity
          onPress={() => setShowProfile(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#8B5CF6", "#3B82F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerAvatar}
          >
             <Text style={styles.headerAvatarText}>{userInitial}</Text>
          </LinearGradient>
        </TouchableOpacity>
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
        <Pressable style={styles.backdrop} onPress={() => setShowProfile(false)} />

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <LinearGradient
            colors={["#8B5CF6", "#3B82F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sheetAvatar}
          >
            <Text style={styles.sheetAvatarText}>{userInitial}</Text>
          </LinearGradient>

          <Text style={styles.sheetName}>{user?.name ?? "—"}</Text>
          <Text style={styles.sheetEmail}>{user?.email ?? "—"}</Text>

          <View style={styles.sheetDivider} />

          <TouchableOpacity
            style={styles.signOutButton}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ── Header bar ───────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 44,
  },
  rightContainer: {
    minWidth: 44,
    alignItems: "flex-end",
  },
  backButton:{
    marginRight: 12,
    marginLeft: -4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  titleSmall:{
    fontSize: 24,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  // ── Bottom sheet ─────────────────────────────────────────────────────────
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: "#0E0E1C",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.18)",
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: 40,
    alignItems: "center",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: 28,
  },
  sheetAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  sheetAvatarText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
  sheetName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sheetEmail: {
    color: "#6B7280",
    fontSize: 14,
  },
  sheetDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 24,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  signOutText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
});
