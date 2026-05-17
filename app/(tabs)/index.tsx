import AppHeader from "@/src/components/AppHeader";
import { GET_GROUPS } from "@/src/graphql/mutation";
import { useQuery } from "@apollo/client";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroupsScreen() {
  const router = useRouter();

  const { data, loading, error, refetch } = useQuery(GET_GROUPS, {
    fetchPolicy: "cache-and-network",
  });

  const renderGroupCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        router.push({ pathname: "/group/[id]" as any, params: { id: item.id } })
      }
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.groupName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.memberAvatarContainer}>
          {item.members.slice(0, 3).map((member: any, index: number) => (
            <View
              key={member.id}
              style={[styles.memberAvatar, index > 0 && styles.memberAvatarOverlap]}
            >
              <Text style={styles.memberAvatarText}>
                {member.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          ))}
          {item.members.length > 3 && (
            <View style={[styles.memberAvatar, styles.memberAvatarOverlap, styles.overflowAvatar]}>
              <Text style={styles.memberAvatarText}>
                +{item.members.length - 3}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.footerLabel}>Total Expense</Text>
        <Text style={styles.totalAmount}>
          ₹{((item.expenses ?? []).reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <AppHeader title="Your Groups" />

      {loading && !data ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load groups.</Text>
        </View>
      ) : (
        <FlatList
          data={data?.groups || []}
          renderItem={renderGroupCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#3D3D5C" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>No groups yet.</Text>
              <Text style={styles.emptySubText}>Tap + to create your first group.</Text>
            </View>
          }
        />
      )}

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fabWrapper}
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: "/group/create" as any })}
      >
        <LinearGradient
          colors={["#8B5CF6", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#080812" },
  blobTopRight: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(139, 92, 246, 0.07)",
    top: -80,
    right: -80,
  },
  blobBottomLeft: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(59, 130, 246, 0.06)",
    bottom: -60,
    left: -60,
  },

  // ── List ──────────────────────────────────────────────────────────────────
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#EF4444", fontSize: 16 },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
  },
  listContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 100 },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: "#0E0E1C",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.18)",
    padding: 24,
    marginBottom: 16,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  groupName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
    flex: 1,
    paddingRight: 10,
  },
  memberAvatarContainer: { flexDirection: "row" },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2A2A3C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0E0E1C",
  },
  memberAvatarOverlap: { marginLeft: -10 },
  overflowAvatar: { backgroundColor: "#3B82F6" },
  memberAvatarText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptySubText: { color: "#6B7280", fontSize: 14, marginTop: 4 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalAmount: { color: "#FFFFFF", fontSize: 24, fontWeight: "800" },

  // ── FAB ───────────────────────────────────────────────────────────────────
  fabWrapper: {
    position: "absolute",
    bottom: 30,
    right: 24,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});
