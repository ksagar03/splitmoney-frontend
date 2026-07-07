import AppHeader from "@/src/components/AppHeader";
import {
  FormField,
  GradientButton,
  Screen,
  contentEntering,
} from "@/src/components/ui";
import { palette } from "@/src/constants/theme";
import { UPDATE_EXPENSE } from "@/src/graphql/mutation";
import { useMutation } from "@apollo/client";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { Alert } from "react-native/Libraries/Alert/Alert";

export default function EditExpense() {
  const router = useRouter();
  const {
    expenseID,
    description: initialDescription,
    amount: initialAmount,
  } = useLocalSearchParams<{
    expenseID: string;
    description: string;
    amount: string;
  }>();
  const [description, setDescription] = useState(initialDescription || "");
  const [amount, setAmount] = useState(initialAmount || "");
  const [updateExpense, { loading }] = useMutation(UPDATE_EXPENSE, {
    refetchQueries: ["GetGroupDetails", "GetGroupBalance"],
  });
  const handleUpdate = async () => {
    if (!description.trim() || !amount.trim()) {
      Alert.alert("Missing info", "Please enter a description and amount");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount");
      return;
    }
    try {
      await updateExpense({
        variables: {
          id: expenseID,
          input: {
            description,
            amount: parsedAmount,
          },
        },
      });
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update expense");
    }
  };
  return (
    <Screen>
      <AppHeader title="Edit Expense" showBackButton />
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
            <Text className="text-ink-faint text-5xl font-bold mr-2 mt-1">
              ₹
            </Text>
            <TextInput
              className="text-ink text-[56px] font-extrabold text-center min-w-[100px] p-3"
              placeholder="0.00"
              placeholderTextColor={palette.inkPlaceholder}
              value={amount}
              onChangeText={(text) => {
                if (/^[0-9]*\.?[0-9]*$/.test(text)) setAmount(text);
              }}
              keyboardType="decimal-pad"
              editable={!loading}
            />
          </Animated.View>
          <FormField
            label="For what?"
            placeholder="e.g. Dinner, Movie, Groceries..."
            value={description}
            onChangeText={setDescription}
            editable={!loading}
            containerClassName="mb-8"
          />
        </ScrollView>
      </KeyboardAvoidingView>
      <View className="px-6 pb-9 pt-4">
        <GradientButton
          label="Save Changes"
          onPress={handleUpdate}
          loading={loading}
        />
      </View>
    </Screen>
  );
}
