import AppHeader from "@/src/components/AppHeader";
import { listItemEntering, Screen } from "@/src/components/ui";
import { palette, surfaceGradient } from "@/src/constants/theme";
import { GET_GROUP_BALANCE } from "@/src/graphql/queries";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useQuery } from "@apollo/client";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import Animated from "react-native-reanimated";

interface Settlement {
  from: { id: string; name: string };
  to: { id: string; name: string };
  amount: number;
}

interface Balance {
  user: { id: string; name: string };
  amount: number;
  settlements: Settlement[];
}

export default function GroupBalanceScreen() {
  const { groupId, groupName } = useLocalSearchParams<{
    groupId: string;
    groupName: string;
  }>();

  const currentUser = useAuthStore((state) => state.user);
  const { data, loading, error } = useQuery(GET_GROUP_BALANCE, {
    variables: { groupId },
    skip: !groupId,
    fetchPolicy: "cache-and-network",
  });
  const balance: Balance[] = data?.getGroupBalance ?? [];

  const seen = new Set<string>();
  const settlements: Settlement[] = [];
  for (const b of balance) {
    for (const s of b.settlements) {
      const key = `${s.from.id}-${s.to.id}-${s.amount}`;
      if (!seen.has(key)) {
        seen.add(key);
        settlements.push(s);
      }
    }
  }

  const renderBalanceItem = ({
    item,
    index,
  }: {
    item: Balance;
    index: number;
  }) => {
    const isPositive = item.amount >= 0;
    const isSelf = item.user.id === currentUser?.id;
    const displayName = isSelf ? "You" : item.user.name;

    return (
      <Animated.View entering={listItemEntering(index)}>
        <LinearGradient
          colors={surfaceGradient}
          style={{
            borderRadius: 16,
            padding: 16,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: "rgba(139, 92, 246, 0.15)",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View className=" flex-row items-center gap-2.5">
            <View className="w-10 h-10 rounded-full bg-violet-600/10 flex items-center justify-center">
              <Text className="text-ink text-[14px] font-bold">
                {item.user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-ink text-[15px] font-[600]">
              {displayName}
            </Text>
          </View>
          <View className="flex items-end">
            <Text
              className={`${
                isPositive ? "text-success" : "text-danger"
              } text-[18px] font-[800] `}
            >
              {isPositive ? "+" : ""}₹{Math.abs(item.amount).toFixed(2)}
            </Text>
            <Text className="text-ink-faint text-[12px]">
              {isPositive ? "gets back" : "owes"}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };
  return (
    <Screen>
      <AppHeader title={groupName ?? "Balances"} showBackButton />
      {loading && !data ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={palette.brand} />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-danger text-base text-center">
            Failed to load balance
          </Text>
        </View>
      ) : (
        <FlatList
          data={balance}
          keyExtractor={(item) => item.user.id}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            settlements.length > 0 ? (
              <View className="mb-6">
                <Text className="text-ink text-lg font-bold mb-3">
                  Suggested Settlements
                </Text>
                {settlements.map((s, i) => (
                  <Animated.View
                    key={`${s.from.id}-${s.to.id}`}
                    entering={listItemEntering(i)}
                    className="flex-row items-center bg-surface border border-brand/[0.15] rounded-xl p-4 mb-2 gap-2"
                  >
                    <Text className="text-ink-muted text-sm font-semibold flex-1">
                      <Text className="text-ink">
                        {s.from.id === currentUser?.id ? "You" : s.from.name}
                      </Text>
                      {" pays "}
                      <Text className="text-ink">
                        {s.to.id === currentUser?.id ? "You" : s.to.name}
                      </Text>
                    </Text>
                    <Text className="text-brand text-base font-extrabold">
                      ₹{s.amount.toFixed(2)}
                    </Text>
                  </Animated.View>
                ))}
                <View className="h-px bg-white/[0.06] mb-5 mt-2" />
                <Text className="text-ink text-lg font-bold mb-3">
                  Member Balances
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Ionicons
                name="checkmark-circle-outline"
                size={56}
                color={palette.brand}
              />
              <Text className="text-ink text-xl font-bold mt-4">
                All settled up
              </Text>
              <Text className="text-ink-faint text-sm mt-1 text-center">
                No outstanding balances in this group
              </Text>
            </View>
          }
          renderItem={renderBalanceItem}
        />
      )}
    </Screen>
  );
}
