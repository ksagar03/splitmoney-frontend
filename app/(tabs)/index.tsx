import AppHeader from "@/src/components/AppHeader";
import { PressableScale, Screen, listItemEntering } from "@/src/components/ui";
import { brandGradient, palette } from "@/src/constants/theme";
import {
  DELETE_GROUP,
  GENERATE_GROUP_INVITE,
  GET_GROUPS,
} from "@/src/graphql/mutation";
import { useMutation, useQuery } from "@apollo/client";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export default function GroupsScreen() {
  const router = useRouter();

  const { data, loading, error, refetch } = useQuery(GET_GROUPS, {
    fetchPolicy: "cache-and-network",
  });

  const [generateInvite] = useMutation(GENERATE_GROUP_INVITE);
  const [deleteGroup] = useMutation(DELETE_GROUP, {
    refetchQueries: ["GetGroups"],
  });
  const handleGroupOptions = (item: any) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(item.name, "What do you want to do?", [
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          Alert.alert(
            "Delete Group",
            `Delete "${item.name}"? All expenses will be lost.`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  try {
                    await deleteGroup({ variables: { groupId: item.id } });
                  } catch (err: any) {
                    Alert.alert(
                      "Error",
                      err.message || "Could not delete group.",
                    );
                  }
                },
              },
            ],
          ),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleInvite = async (groupId: string, groupName: string) => {
    try {
      const { data } = await generateInvite({ variables: { groupId } });
      const token: string = data.generateGroupInvite;
      await Share.share({
        message: `Join "${groupName}" on SplitMoney: splitmoneyfrontend://join/${token}`,
        title: `Join ${groupName}`,
      });
    } catch {
      // Share sheet dismissed or error — no action needed
    }
  };

  const renderGroupCard = ({ item, index }: { item: any; index: number }) => {
    const total = (item.expenses ?? []).reduce(
      (sum: number, e: { amount: number }) => sum + e.amount,
      0,
    );
    const members = item.members ?? [];
    return (
      <Animated.View entering={listItemEntering(index)}>
        <PressableScale
          onPress={() =>
            router.push({
              pathname: "/group/[id]" as any,
              params: { id: item.id },
            })
          }
          onLongPress={() => handleGroupOptions(item)}
          className="bg-surface rounded-2.5xl border border-brand/[0.18] p-6 mb-4"
          style={{
            shadowColor: palette.brand,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text
              className="text-ink text-xl font-bold tracking-wide flex-1 pr-2.5"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <TouchableOpacity
              className="ml-2 p-1"
              onPress={() => handleInvite(item.id, item.name)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 0 }}
            >
              <Ionicons
                name="share-social-outline"
                size={18}
                color={palette.brand}
              />
            </TouchableOpacity>
            {/* member avatar */}
            <View className="flex-row ml-3">
              {members.slice(0, 3).map((member: any, i: number) => (
                <View
                  key={member.id}
                  className="w-8 h-8 rounded-full bg-avatar justify-center items-center border-2 border-surface"
                  style={i > 0 ? { marginLeft: -10 } : undefined}
                >
                  <Text className="text-ink text-xs font-bold">
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              ))}
              {members.length > 3 && (
                <View className="w-8 h-8 rounded-full bg-brand-blue justify-center items-center border-2 border-surface ml-[-10]">
                  <Text className="Text-ink text-xs font-bold">
                    +{members.length - 3}
                  </Text>
                </View>
              )}
            </View>
            {Platform.OS === "web" && (
              <TouchableOpacity
                onPress={async () => {
                  if (
                    !confirm(`Delete ${item.name}? All expense will be lost.`)
                  )
                    return;
                  try {
                    await deleteGroup({ variables: { groupId: item.id } });
                  } catch (e: any) {
                    Alert.alert("Error", e.message || "Could not delete group");
                  }
                }}
                className="ml-2 p-1.5 rounded-lg bg-danger/10"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={palette.danger}
                />
              </TouchableOpacity>
            )}
          </View>
          <View className="flex-row justify-between items-end">
            <Text className="text-ink-muted text-xs font-semibold uppercase tracking-wider">
              Total Expense
            </Text>
            <Text className="text-ink text-2xl font-extrabold">
              ₹{total.toFixed(2)}
            </Text>
          </View>
        </PressableScale>
      </Animated.View>
    );
  };

  return (
    <Screen>
      <AppHeader title=" Your Groups" />
      {loading && !data ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={palette.brand} />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-danger text-base">Failed to load groups.</Text>
        </View>
      ) : (
        <FlatList
          data={data?.groups || []}
          renderItem={renderGroupCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={loading}
          ListEmptyComponent={
            <Animated.View
              entering={FadeIn.duration(400)}
              className="items-center mt-16"
            >
              <Ionicons
                name="people-outline"
                size={48}
                color={palette.inkPlaceholder}
                style={{ marginBottom: 12 }}
              />
              <Text className="text-ink-muted text-base text-center">
                No groups yet.
              </Text>
              <Text className="text-ink-faint text-sm mt-1">
                Tap + to create your first group.
              </Text>
            </Animated.View>
          }
        />
      )}

      {/* ── FAB ── */}
      <Animated.View
        entering={FadeIn.duration(400)}
        className="absolute bottom-8 right-6"
      >
        <PressableScale
          onPress={() => router.push({ pathname: "/group/create" as any })}
          style={{
            shadowColor: palette.brand,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <LinearGradient
            colors={brandGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            // style={{
            //   width: 64,
            //   height: 64,
            //   borderRadius: 32,
            //   justifyContent: "center",
            //   alignItems: "center",
            // }}
            className="w-16 h-16 rounded-full justify-center items-center"
          >
            <Ionicons name="add" size={32} color={palette.ink} />
          </LinearGradient>
        </PressableScale>
      </Animated.View>
    </Screen>
  );
}
