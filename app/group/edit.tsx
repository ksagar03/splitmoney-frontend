import AppHeader from "@/src/components/AppHeader";
import {
  Avatar,
  FormField,
  GradientButton,
  Screen,
  listItemEntering,
} from "@/src/components/ui";
import { palette } from "@/src/constants/theme";
import { REMOVE_MEMBER, UPDATE_GROUP } from "@/src/graphql/mutation";
import { GET_GROUP_DETAILS } from "@/src/graphql/queries";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useMutation, useQuery } from "@apollo/client";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

export default function EditGroupScreen() {
  const { groupId, groupName: initialName } = useLocalSearchParams<{
    groupId: string;
    groupName: string;
  }>();
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const [name, setName] = useState(initialName || "");
  const { data, loading: groupLoading } = useQuery(GET_GROUP_DETAILS, {
    variables: { id: groupId },
    skip: !groupId,
    fetchPolicy: "cache-and-network",
  });
  const [updateGroup, { loading: saving }] = useMutation(UPDATE_GROUP, {
    refetchQueries: ["GetGroups", "GetGroupDetails"],
  });
  const [removeMember, { loading: removing }] = useMutation(REMOVE_MEMBER, {
    refetchQueries: ["GetGroupDetails"],
  });
  const group = data?.group;
  const isAdmin = group?.createdBy?.id === currentUser?.id;

  useEffect(() => {
    if (group?.name && !name) setName(group.name);
  }, [group, name]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Missing info", "Group name cannot be empty.");
      return;
    }
    try {
      await updateGroup({
        variables: { groupId, input: { name: name.trim() } },
      });
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not update group.");
    }
  };
  const handleRemoveMember = (member: { id: string; name: string }) => {
    Alert.alert(
      `Remove ${member.name}?`,
      "This will only work if their balance is fully settled.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeMember({ variables: { groupId, userId: member.id } });
            } catch (err: any) {
              Alert.alert("Error", err.message || "Could not remove member.");
            }
          },
        },
      ],
    );
  };

  const renderMember = ({
    item,
    index,
  }: {
    item: { id: string; name: string };
    index: number;
  }) => {
    const isSelf = item.id === currentUser?.id;
    const isGroupAdmin = item.id === group?.createdBy?.id;

    return (
      <Animated.View
        entering={listItemEntering(index)}
        className="flex-row items-center bg-surface p-3.5 rounded-xl border-white/[0.05]"
      >
        <Avatar name={item.name} size={40} />
        <View className="flex-1 flex-row items-center ml-3 gap-2">
          <Text className="text-white text-[15px] font-semibold">
            {isSelf ? "You" : item.name}
          </Text>
          {isGroupAdmin && (
            <Text className="text-brand text-[11px] font-bold bg-brand/15 px-2 py-0.5 rounded-md overflow-hidden">
              Admin
            </Text>
          )}
        </View>
        {!isSelf && !isGroupAdmin && (
          <TouchableOpacity
            className="p-2 rounded-lg bg-danger/10"
            onPress={() => handleRemoveMember(item)}
            disabled={removing}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="person-remove-outline"
              size={18}
              color={palette.danger}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };
  if (groupLoading && !data) {
    return (
      <Screen>
        <AppHeader title="Edit Group" showBackButton />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color={palette.brand} size="large" />
        </View>
      </Screen>
    );
  }
  if (!isAdmin) {
    return (
      <Screen>
        <AppHeader title="Edit Group" showBackButton />
        <View className="flex-1 justify-center items-center">
          <Text className="text-danger text-base text-center px-6">
            Only the group admin can edit this group.
          </Text>
        </View>
      </Screen>
    );
  }
  return (
    <Screen>
      <AppHeader title="Edit Group" showBackButton />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-2">
          <FormField
            label="Group Name"
            value={name}
            onChangeText={setName}
            placeholder="Group Name"
            editable={!saving}
            containerClassName="mb-8"
          />

          {/* Members list */}
          <View className="flex-1">
            <Text className="text-ink-muted text-xs font-semibold tracking-wider uppercase mb-3 ml-0.5">
              Members
            </Text>
            <FlatList
              data={group?.members || []}
              keyExtractor={(item) => item.id}
              renderItem={renderMember}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View className="h-2" />}
            />
          </View>
        </View>

        {/* Save button */}
        <View className="px-6 pb-9 pt-4">
          <GradientButton
            label="SaveChanges"
            onPress={handleSave}
            loading={saving}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
