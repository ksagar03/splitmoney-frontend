import { GET_GROUPS } from "@/src/graphql/mutation";
import { useQuery } from "@apollo/client";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

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
        <Text>{item.name}</Text>
        <View style={styles.avatarContainer}>
          {item.members.slice(0, 3).map((member: any, index: number) => (
            <View
              key={member.id}
              style={[styles.avatar, { left: index * -10 }]}
            >
             <Text style={styles.avatarText}>
                {member.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          ))}
          {item.members.length > 3 && (
            <View
              style={[styles.avatar, styles.overFlowAvatar, { left: 3 * -10 }]}
            >
              <Text style={styles.avatarText}>+{item.members.length - 3}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.footerLabel}>Total Expense</Text>
        <Text style={styles.totalAmount}>
          ₹{(item.totalExpenses || 0).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />
      <View style={styles.header}>
        <Text style={styles.title}>Your Groups</Text>
      </View>
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
            <Text style={styles.emptyText}>
              No groups yet. Create one to get started!{" "}
            </Text>
          }
        />
      )}
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
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: -0.5,
  },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#EF4444", fontSize: 16 },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
  listContent: { paddingHorizontal: 24, paddingBottom: 100 },
  card: {
    backgroundColor: "#0E0E1C",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(139,92,246, 0.18)",
    padding: 24,
    marginBottom: 16,
    shadowColor: "#885CF6",
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
    fontWeight: 700,
    letterSpacing: 0.3,
    flex: 1,
  },
  avatarContainer: { flexDirection: "row", marginLeft: 10 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2A2A3C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0E0E1C",
  },
  overFlowAvatar: {
    backgroundColor: "#3B82F6",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 700,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLabel: {},
  totalAmount: {},
  fabWrapper: {},
  fab: {},
});