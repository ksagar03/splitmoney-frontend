import AppHeader from "@/src/components/AppHeader";
import { CREATE_EXPENSE } from "@/src/graphql/mutation";
import { GET_GROUP_MEMBERS } from "@/src/graphql/queries";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useMutation, useQuery } from "@apollo/client";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

import {
  Chip,
  FormField,
  GradientButton,
  Screen,
  contentEntering,
  listItemEntering,
} from "@/src/components/ui";
import { palette } from "@/src/constants/theme";

export default function AddExpense() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const currentUser = useAuthStore((state) => state.user);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState<string | null>(
    currentUser?.id || null,
  );
  // const [focusedField, setFocusedField] = useState<string | null>(null);

  const { data: groupData, loading: fetchingMembers } = useQuery(
    GET_GROUP_MEMBERS,
    {
      variables: { groupId },
      skip: !groupId,
    },
  );
  const [createExpense, { loading: creating }] = useMutation(CREATE_EXPENSE, {
    refetchQueries: ["GetGroupDetails", "GetGroupBalance"],
  });
  const handleCreate = async () => {
    if (!description.trim() || !amount.trim()) {
      Alert.alert("Missing info", "please Enter a description and amount.");
      return;
    }
    if (!payerId) {
      Alert.alert("Missing info", "please select a payer.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid number greater than 0.",
      );
      return;
    }
    try {
      await createExpense({
        variables: {
          input: {
            description,
            amount: parsedAmount,
            payerId,
            groupId,
          },
        },
      });
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add expense.");
    }
  };
  const members = groupData?.group?.members || [];

  return (
    <Screen>
      <AppHeader title="Add Expense" showBackButton />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={contentEntering()}
            className="flex-row items-center justify-center mt-5 mb-10"
          >
            <Text className="text-ink-faint text-5xl font-fold mr-2 mt-1">
              ₹
            </Text>
            <TextInput
              className="text-ink text-[56px] font-extrabold text-center min-w-[100px] p-3"
              placeholder="0.00"
              placeholderTextColor={palette.inkPlaceholder}
              value={amount}
              onChangeText={(text) => {
                const numericRegex = /^[0-9]*\.?[0-9]*$/;
                if (numericRegex.test(text)) setAmount(text);
              }}
              keyboardType="decimal-pad"
              autoFocus={true}
              editable={!creating}
            />
          </Animated.View>
          <FormField
            label="For what?"
            placeholder="e.g. Dinner, Movie, Groceries..."
            value={description}
            onChangeText={setDescription}
            editable={!creating}
            containerClassName="mb-8"
          />
          <View className="mb-8">
            <Text className="text-ink-muted text-xs font-semibold tracking-wider uppercase mb-3 ml-0.5">
              {" "}
              Who paid?
            </Text>
            {fetchingMembers ? (
              <ActivityIndicator
                color={palette.brand}
                style={{ alignSelf: "flex-start", margin: 8 }}
              />
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {members.map(
                  (member: { id: string; name: string }, index: number) => (
                    <Animated.View
                      key={member.id}
                      entering={listItemEntering(index)}
                    >
                      <Chip
                        label={
                          member.id === currentUser?.id ? "You" : member.name
                        }
                        selected={payerId === member.id}
                        onPress={() => setPayerId(member.id)}
                      />
                    </Animated.View>
                  ),
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View className="px-6 pb-9 pt-4">
        <GradientButton
          label="Add Expense"
          onPress={handleCreate}
          loading={creating}
        />
      </View>
    </Screen>
  );
}
