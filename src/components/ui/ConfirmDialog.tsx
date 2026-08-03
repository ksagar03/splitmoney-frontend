import { PressableScale } from "@/src/components/ui";
import { palette } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  destructive = false,
  loading = false,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <Pressable
        className="flex-1 bg-black/60"
        onPress={loading ? undefined : onCancel}
      />
      <View className="bg-surface rounded-t-4xl border border-brand/20 px-5 pt-3 pb-11">
        <View className="w-10 h-1 rounded-full bg-white/15 mb-5 self-center" />
        <View
          className={`w-[50px] h-[60px] rounded-full items-center justify-center mb-4 border-[1.5px] ${
            destructive
              ? "bg-danger/15 border-danger/40"
              : "bg-brand/15 border-brand/40"
          }`}
        >
          <Ionicons
            name={destructive ? "warning-outline" : "help-circle-outline"}
            size={28}
            color={destructive ? palette.danger : palette.brand}
          />
        </View>
        <Text className="text-ink text-[19px] font-extrabold text-center mb-1.5">
          {title}
        </Text>
        {!!message && (
          <Text className="text-ink-muted text-[14px] text-center leading-5 mb-2 px-2">
            {message}
          </Text>
        )}
        <View className="w-full h-px bg-white/[0.06] my-5" />
        <PressableScale
          className={`w-full flex-row items-center justify-center py-3.5 rounded-xl mb-2.5 ${
            destructive ? "bg-danger" : "bg-brand"
          }`}
          onPress={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={palette.ink} />
          ) : (
            <Text className="text-ink text-[17px] font-bold">
              {confirmLabel}
            </Text>
          )}
        </PressableScale>

        <PressableScale
          onPress={onCancel}
          disabled={loading}
          className="py-3 px-8"
        >
          <Text className="text-ink-faint text-[15px] font-semibold">
            {cancelLabel}
          </Text>
        </PressableScale>
      </View>
    </Modal>
  );
}
