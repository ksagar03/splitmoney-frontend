import { CREATE_GROUP, GENERATE_GROUP_INVITE, GET_GROUPS, GET_USERS } from "@/src/graphql/mutation";
import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuthStore } from "@/src/store/useAuthStore";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Share,
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

  // Holds the newly created group while the invite sheet is open
  const [createdGroup, setCreatedGroup] = useState<{ id: string; name: string } | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS);

  const [createGroup, { loading: creating }] = useMutation(CREATE_GROUP, {
    refetchQueries: [{ query: GET_GROUPS }],
  });

  const [generateInvite] = useMutation(GENERATE_GROUP_INVITE);

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
      const allMemberIds = Array.from(new Set([currentUser.id, ...selectedMembers]));
      const { data } = await createGroup({
        variables: {
          input: {
            name: groupName,
            membersId: allMemberIds,
            createdBy: currentUser.id,
          },
        },
      });
      // Show invite sheet instead of navigating away immediately
      setCreatedGroup({ id: data.createGroup.id, name: data.createGroup.name });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create group.");
    }
  };

  const handleInvite = async () => {
    if (!createdGroup) return;
    setInviteLoading(true);
    try {
      const { data } = await generateInvite({ variables: { groupId: createdGroup.id } });
      const token: string = data.generateGroupInvite;
      await Share.share({
        message: `Join "${createdGroup.name}" on SplitMoney: splitmoneyfrontend://join/${token}`,
        title: `Join ${createdGroup.name}`,
      });
    } catch {
      // Share sheet dismissed or failed — no action needed
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDone = () => {
    setCreatedGroup(null);
    router.back();
  };

  const otherUsers: { id: string; name: string }[] = (usersData?.users ?? []).filter(
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
              style={[styles.input, focusedField === "name" && styles.inputFocused]}
              placeholder="e.g. Goa Trip..."
              placeholderTextColor="#3D3D5C"
              value={groupName}
              onChangeText={setGroupName}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              editable={!creating}
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
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {user.name}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
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
          disabled={creating}
        >
          <LinearGradient
            colors={creating ? ["#4C3ABA", "#2A4ABA"] : ["#8B5CF6", "#3B82F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {creating ? (
              <ActivityIndicator color="rgba(255,255,255,0.7)" />
            ) : (
              <Text style={styles.buttonText}>Create Group</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Post-creation invite sheet ── */}
      <Modal
        visible={!!createdGroup}
        transparent
        animationType="slide"
        onRequestClose={handleDone}
      >
        <Pressable style={styles.backdrop} onPress={handleDone} />

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          {/* Success badge */}
          <View style={styles.successBadge}>
            <Ionicons name="checkmark" size={28} color="#FFFFFF" />
          </View>

          <Text style={styles.sheetTitle}>Group created!</Text>
          <Text style={styles.sheetGroupName}>{createdGroup?.name}</Text>

          {/* Divider */}
          <View style={styles.sheetDivider} />

          {/* Invite section */}
          <View style={styles.inviteHint}>
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" style={{ marginTop: 1 }} />
            <Text style={styles.inviteHintText}>
              Friends without the app can still join via an invite link. Share it and they&apos;ll be added automatically once they sign up.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.inviteButtonWrapper}
            activeOpacity={0.8}
            onPress={handleInvite}
            disabled={inviteLoading}
          >
            <LinearGradient
              colors={["#8B5CF6", "#3B82F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.inviteGradientButton}
            >
              {inviteLoading ? (
                <ActivityIndicator color="rgba(255,255,255,0.8)" />
              ) : (
                <>
                  <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.inviteButtonText}>Invite friends</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.7}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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

  // ── Invite sheet ─────────────────────────────────────────────────────────────
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
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 44,
    alignItems: "center",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: 24,
  },
  successBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderWidth: 1.5,
    borderColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sheetGroupName: {
    color: "#8B5CF6",
    fontSize: 15,
    fontWeight: "600",
  },
  sheetDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 24,
  },
  inviteHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    width: "100%",
  },
  inviteHintText: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  inviteButtonWrapper: {
    width: "100%",
    borderRadius: 12,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 12,
  },
  inviteGradientButton: {
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  inviteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  doneButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  doneButtonText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "600",
  },
});
