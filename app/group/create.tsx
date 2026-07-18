import AppHeader from "@/src/components/AppHeader";
import {
  Chip,
  FormField,
  GradientButton,
  PressableScale,
  Screen,
  contentEntering,
  listItemEntering,
} from "@/src/components/ui";
import { palette } from "@/src/constants/theme";
import {
  CREATE_GROUP,
  GENERATE_GROUP_INVITE,
  GET_GROUPS,
  GET_USERS,
} from "@/src/graphql/mutation";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useMutation, useQuery } from "@apollo/client";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

export default function CreateGroupScreen() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);

  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Holds the newly created group while the invite sheet is open
  const [createdGroup, setCreatedGroup] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS);

  const [createGroup, { loading: creating }] = useMutation(CREATE_GROUP, {
    refetchQueries: [{ query: GET_GROUPS }],
  });

  const [generateInvite] = useMutation(GENERATE_GROUP_INVITE);

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
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
      const allMemberIds = Array.from(
        new Set([currentUser.id, ...selectedMembers]),
      );
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
      const { data } = await generateInvite({
        variables: { groupId: createdGroup.id },
      });
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

  const otherUsers: { id: string; name: string }[] = (
    usersData?.users ?? []
  ).filter((u: { id: string }) => u.id !== currentUser?.id);

  return (
    <Screen>
      <AppHeader title="Create Group" showBackButton />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 18 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={contentEntering()}>
            <FormField
              label="Group Name"
              placeholder="e.g. Goa Trip..."
              value={groupName}
              onChangeText={setGroupName}
              editable={!creating}
              containerClassName="mb-8"
            />
          </Animated.View>

          <View className="mb-8">
            <Text className="text-ink-muted text-xs font-semibold tracking-wider uppercase mb-1 ml-0.5">
              Add Members
            </Text>
            <Text className="text-ink-faint text-[13px] mb-3 ml-0.5">
              You are automatically included.
            </Text>

            {usersLoading ? (
              <ActivityIndicator
                color={palette.brand}
                style={{ marginTop: 8, alignSelf: "flex-start" }}
              />
            ) : otherUsers.length === 0 ? (
              <Text className="text-ink-faint text-sm ml-0.5">
                No other users registered yet.
              </Text>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {otherUsers.map((user, index) => (
                  <Animated.View
                    key={user.id}
                    entering={listItemEntering(index)}
                  >
                    <Chip
                      label={user.name}
                      selected={selectedMembers.includes(user.id)}
                      onPress={() => toggleMember(user.id)}
                    />
                  </Animated.View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View className="px-6 pb-9 pt-4">
        <GradientButton
          label=" Create Group"
          onPress={handleCreate}
          loading={creating}
        />
      </View>

      {/* ── Post-creation invite sheet ── */}
      <Modal
        visible={!!createdGroup}
        transparent
        animationType="slide"
        onRequestClose={handleDone}
      >
        <Pressable className="flex-1 bg-black/60" onPress={handleDone} />

        <View className="bg-surface rounded-t-4xl border border-brand/20 px-7 pt-3 pb-11 items-center">
          <View className="w-10 h-1 rounded-full bg-white/15 mb-6" />

          {/* Success badge */}
          <View className="w-[60px] h-[60px] rounded-full bg-brand/20 border-[1.5px] border-brand items-center justify-center mb-4">
            <Ionicons name="checkmark" size={28} color={palette.ink} />
          </View>

          <Text className="text-ink text-[22px] font-extrabold mb-1">
            Group created!
          </Text>
          <Text className="text-brand text-[15px] font-semibold">
            {createdGroup?.name}
          </Text>

          <View className=" w-full h-px bg-white/[0.06] my-6" />

          {/* Invite section */}
          <View className="flex-row items-start bg-white/[0.04] rounded-xl p-3.5 mb-5 w-full">
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={palette.inkFaint}
              style={{ marginTop: 1 }}
            />
            <Text className="text-ink-faint text-[13px] flex-1 leading-[19px]">
              Friends without the app can still join via an invite link. Share
              it and they&apos;ll be added automatically once they sign up.
            </Text>
          </View>
          <GradientButton
            label="Invite Friends"
            icon="share-social-outline"
            onPress={handleInvite}
            loading={inviteLoading}
            className="w-full"
          />
          <PressableScale onPress={handleDone} className="py-3 px-8 mt-2">
            <Text className="text-ink-faint text-[15px] font-semibold">
              Done
            </Text>
          </PressableScale>
        </View>
      </Modal>
    </Screen>
  );
}
