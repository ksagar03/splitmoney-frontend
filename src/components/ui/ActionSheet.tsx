import { PressableScale } from "@/src/components/ui";
import { palette } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

export interface ActionSheetOptions {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
}

interface ActionSheetProps {
  visible: boolean;
  title: string;
  message?: string;
  options: ActionSheetOptions[];
  onCancel: () => void;
  cancelLabel?: string;
}

export function ActionSheet({
  visible,
  title,
  message,
  options,
  onCancel,
  cancelLabel = "Cancel",
}: ActionSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
      className="z-40"
    >
      <Pressable className="flex-1 bg-black/60" onPress={onCancel} />
      <View className="bg-surface rounded-t-4xl border border-brand/20 px-5 pt-3 pb-9">
        <View className="w-10 h-1 rounded-full bg-white/15 mb-5 self-center" />
        {!!title && (
          <Text className="text-ink text-[17px] font-bold text-center mb-1 px-4">
            {title}
          </Text>
        )}
        {!!message && (
          <Text className="text-ink text-[13px] text-center mb-3 px-4">
            {message}
          </Text>
        )}
     
      <View className="mt-1">
        {options.map((option) => (
          <PressableScale
            key={option.label}
            onPress={() => {
              onCancel();
              option.onPress();
            }}
            className="flex-row items-center py-4 px-3 rounded-xl"
          >
            {option.icon && (
              <Ionicons
                name={option.icon}
                size={19}
                color={option.destructive ? palette.danger : palette.ink}
                style={{ marginRight: 12 }}
              />
            )}
            <Text
              className={`text-[15px] font-semibold ${
                option.destructive ? "text-danger" : "text-ink"
              }`}
            >
              {option.label}
            </Text>
          </PressableScale>
        ))}
      </View>
      <View className="w-full h-px bg-white/[0.06] my-3" />
      <PressableScale
        onPress={onCancel}
        className="items-center justify-center py-3.5 rounded-xl bg-white/[0.05]"
      >
        <Text className="text-[15px] font-semibold text-ink-muted">
          {cancelLabel}
        </Text>
      </PressableScale>
       </View>
    </Modal>
  );
}