import AppHeader from "@/src/components/AppHeader";
import {
  GradientButton,
  PressableScale,
  Screen,
  listItemEntering,
} from "@/src/components/ui";
import { palette, surfaceGradient } from "@/src/constants/theme";
import {
  DELETE_EXPENSE,
  DELETE_GROUP,
  LEAVE_GROUP,
} from "@/src/graphql/mutation";
import { GET_GROUP_DETAILS } from "@/src/graphql/queries";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useMutation, useQuery } from "@apollo/client";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

const GroupDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const { data, loading, error, refetch } = useQuery(GET_GROUP_DETAILS, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  });
  const [deleteExpense] = useMutation(DELETE_EXPENSE, {
    refetchQueries: ["GetGroupDetails"],
  });
  const [deleteGroup] = useMutation(DELETE_GROUP, {
    refetchQueries: ["GetGroups"],
  });
  const [leaveGroup] = useMutation(LEAVE_GROUP, {
    refetchQueries: ["GetGroups"],
  });
  const group = data?.group;
  const isAdmin = group?.createdBy?.id === currentUser?.id;

  const canEditExpense = (item: any) =>
    item.payer?.id === currentUser?.id ||
    item.createdBy?.id === currentUser?.id ||
    isAdmin;

  const goToBalanceScreen = () => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/group/balance" as any,
      params: { groupId: group.id, groupName: group.name },
    });
  };

  const handleGroupMenu = () => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isAdmin) {
      Alert.alert(group.name, "Admin options", [
        {
          text: "Edit Group",
          onPress: () =>
            router.push({
              pathname: "/group/edit" as any,
              params: { groupId: group.id, groupName: group.name },
            }),
        },
        {
          text: "Delete Group",
          style: "destructive",
          onPress: () =>
            Alert.alert(
              "Delete Group",
              `Delete "${group.name}"? All expense will be lost`,
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await deleteGroup({ variables: { id: group.id } });
                    } catch (error: any) {
                      Alert.alert(
                        "Error",
                        error.message ||
                          "Could not delete group. Please try again later.",
                      );
                    }
                  },
                },
              ],
            ),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } else {
      Alert.alert(group.name, "", [
        {
          text: "Leave Group",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Leave Group",
              "You can only leave if your balance is settled",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Leave",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await leaveGroup({ variables: { groupId: group.id } });
                      router.replace("/(tabs)" as any);
                    } catch (error: any) {
                      Alert.alert(
                        "Error",
                        error.message ||
                          "Could not leave group. Please try again later.",
                      );
                    }
                  },
                },
              ],
            );
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const menuButton = group ? (
    <TouchableOpacity
      onPress={handleGroupMenu}
      className="p-1"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name="ellipsis-vertical" size={22} color={palette.ink} />
    </TouchableOpacity>
  ) : undefined;

  const handleExpenseOptions = (item: any) => {
    if (!canEditExpense(item)) return;
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(item.description, "What do you want to do?", [
      {
        text: "Edit",
        onPress: () =>
          router.push({
            pathname: "/expense/edit-expense" as any,
            params: {
              expenseId: item.id,
              description: item.description,
              amount: String(item.amount),
            },
          }),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          Alert.alert("Delete Expense", `Delete ${item.description}?`, [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                try {
                  await deleteExpense({ variables: { id: item.id } });
                } catch (error: any) {
                  Alert.alert(
                    "Error",
                    error.message ||
                      "Could not delete expense. Please try again later.",
                  );
                }
              },
            },
          ]),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const renderExpenseItem = ({ item, index }: { item: any; index: number }) => {
    const isCurrentUserPayer = item.payer.id === currentUser?.id;
    const payerName = isCurrentUserPayer ? "You" : item.payer.name;
    const canEdit = canEditExpense(item);

    return (
      <Animated.View entering={listItemEntering(index)}>
        <PressableScale
          onLongPress={() => canEdit && handleExpenseOptions(item)}
          scaleTo={0.98}
          className="flex-row justify-between items-center bg-surface p-4 rounded-xl border border-white/[0.05] mb-3"
        >
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 rounded-full bg-brand/10 justify-center items-center mr-3">
              <Ionicons
                name="receipt-outline"
                size={20}
                color={palette.brand}
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-ink text-base font-semibold mb-0.5"
                numberOfLines={1}
              >
                {item.description}
              </Text>
              <Text className="text-ink-muted text-[13px]">
                Paid by {payerName}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <Text
              className={`text-lg font-bold ${
                isCurrentUserPayer ? "text-success" : "text-ink"
              }`}
            >
              ₹{item.amount.toFixed(2)}
            </Text>
            {Platform.OS === "web" && canEdit && (
              <>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/expense/edit-expense" as any,
                      params: {
                        expenseId: item.id,
                        description: item.description,
                        amount: String(item.amount),
                      },
                    })
                  }
                  className="p-1.5 rounded-lg bg-white/5"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="create-outline"
                    size={16}
                    color={palette.brand}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    if (!confirm(`Delete "${item.description}"?`)) return;
                    try {
                      await deleteExpense({ variables: { id: item.id } });
                    } catch (err: any) {
                      Alert.alert(
                        "Error",
                        err.message || "Could not delete expense",
                      );
                    }
                  }}
                  className="p-1.5 rounded-lg bg-white/5"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={palette.danger}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </PressableScale>
      </Animated.View>
    );
  };
  if (loading && !data) {
    return (
      <Screen>
        <AppHeader title="Loading..." showBackButton={true} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color={palette.brand} size="large" />
        </View>
      </Screen>
    );
  }
  if (error || !group) {
    return (
      <Screen>
        <AppHeader title="Error" showBackButton={true} />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-danger text-base text-center">
            {" "}
            Could not load group details. Please try again later.
          </Text>
        </View>
      </Screen>
    );
  }
  return (
    <Screen>
      <AppHeader title={group.name} showBackButton rightElement={menuButton} />

      <View className="px-6 pt-2.5 pb-6">
        <LinearGradient
          colors={surfaceGradient}
          style={{
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: "rgba(139, 92, 246, 0.2)",
          }}
        >
          <Text className="text-ink-muted text-[13px] font-semibold uppercase tracking-wider mb-2">
            Total Group Expenses
          </Text>
          <Text className="text-ink text-4xl font-extrabold mb-1">
            ₹{(group.totalExpense || 0).toFixed(2)}
          </Text>
          <Text className="text-ink-faint text-sm font-medium">
            {group.members.length} Members
          </Text>
        </LinearGradient>
      </View>
      {/* Expenses */}
      <View className="flex-1 px-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-ink text-lg font-bold">Recent Expenses</Text>
          <PressableScale
            onPress={goToBalanceScreen}
            scaleTo={0.94}
            className="flex-row items-center bg-brand/15 border border-brand/30 rounded-full px-3.5 py-1.5 gap-1.5"
          >
            <Ionicons name="swap-horizontal" size={16} color={palette.brand} />
            <Text className="text-brand text-[13px] font-bold">Settle up</Text>
          </PressableScale>
        </View>
        <FlatList
          data={group.expenses || []}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={loading}
          ListEmptyComponent={
            <Text className="text-ink-faint text-sm text-center mt-8">
              No expense yet. Time to spend some money!
            </Text>
          }
        />
      </View>
      <View className="px-6 pb-9 pt-3">
        <GradientButton
          label="Add Expense"
          icon="add-circle-outline"
          onPress={() =>
            router.push({
              pathname: "/expense/add-expense" as any,
              params: { groupId: group.id },
            })
          }
        />
      </View>
    </Screen>
  );
};
