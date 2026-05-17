import { CREATE_GROUP, GET_GROUPS, GET_USERS } from "@/src/graphql/mutation";
import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuthStore } from "@/src/store/useAuthStore";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "@/src/components/AppHeader";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function CreateGroupScreen() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS);

  const [createGroup, { loading }] = useMutation(CREATE_GROUP, {
    refetchQueries: [{ query: GET_GROUPS }],
  });

  const toggleMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      Alert.alert("Missing info", "Please enter a group name.");
      return;
    }
    if (!currentUser?.id) {
      Alert.alert("Error", "Could not identify current user.");
      return;
    }
    try {
      // Always include the current user; merge with any extra selected members
      const allMemberIds = Array.from(
        new Set([currentUser.id, ...selectedMembers])
      );
      await createGroup({
        variables: {
          input: {
            name: groupName,
            membersId: allMemberIds,
            createdBy: currentUser.id,
          },
        },
      });
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create group.");
    }
  };

  // All registered users except the current user (they are always included)
  const otherUsers: { id: string; name: string }[] =
    (usersData?.users ?? []).filter(
      (u: { id: string }) => u.id !== currentUser?.id
    );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.blobTopRight} />
      <AppHeader title="Create Group" showBackButton={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={[
                styles.input,
                focusedField === "name" && styles.inputFocused,
              ]}
              placeholder="e.g. Goa Trip..."
              placeholderTextColor="#3D3D5C"
              value={groupName}
              onChangeText={setGroupName}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Add Members</Text>
            <Text style={styles.subLabel}>You are automatically included.</Text>

            {usersLoading ? (
              <ActivityIndicator color="#8B5CF6" style={{ marginTop: 8 }} />
            ) : otherUsers.length === 0 ? (
              <Text style={styles.noUsersText}>No other users registered yet.</Text>
            ) : (
              <View style={styles.chipContainer}>
                {otherUsers.map((user) => {
                  const isSelected = selectedMembers.includes(user.id);
                  return (
                    <TouchableOpacity
                      key={user.id}
                      activeOpacity={0.8}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => toggleMember(user.id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {user.name}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color="#FFFFFF"
                          style={{ marginLeft: 4 }}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buttonWrapper}
          activeOpacity={0.8}
          onPress={handleCreate}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ["#4C3ABA", "#2A4ABA"] : ["#8B5CF6", "#3B82F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {loading ? (
              <ActivityIndicator color="rgba(255,255,255,0.7)" />
            ) : (
              <Text style={styles.buttonText}>Create Group</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#080812",
  },
  blobTopRight: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(139, 92, 246, 0.07)",
    top: -80,
    right: -80,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 2,
  },
  subLabel: {
    color: "#6B7280",
    fontSize: 13,
    marginBottom: 12,
    marginLeft: 2,
  },
  noUsersText: {
    color: "#6B7280",
    fontSize: 14,
    marginLeft: 2,
  },
  input: {
    backgroundColor: "#090915",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 16,
    color: "#FFFFFF",
    fontSize: 16,
  },
  inputFocused: {
    borderColor: "rgba(139, 92, 246, 0.6)",
    backgroundColor: "#0C0C1A",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0E0E1C",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  chipSelected: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderColor: "#8B5CF6",
  },
  chipText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 16,
    backgroundColor: "#080812",
  },
  buttonWrapper: {
    borderRadius: 12,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
