import { palette } from "@/src/constants/theme";
import React, { useState } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

interface FormFieldProps extends TextInputProps {
  label: string;
  /** Optional element rendered at the right edge of the input (e.g. a show/hide password button). */
  rightElement?: React.ReactNode;
  /** Extra className applied to the outer wrapper View. */
  containerClassName?: string;
}

export function FormField({
  label,
  rightElement,
  containerClassName,
  ...inputProps
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className={containerClassName ?? "mb-4"}>
      <Text className="text-ink-muted text-xs font-semibold tracking-wider uppercase mb-2 ml-0.5">
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: focused ? palette.surfaceFocus : palette.surfaceAlt,
          borderWidth: 1,
          borderColor: focused
            ? "rgba(139, 92, 246, 0.6)"
            : "rgba(255,255,255,0.06)",
          borderRadius: 12,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            paddingVertical: 14,
            paddingHorizontal: 16,
            color: palette.ink,
            fontSize: 15,
          }}
          placeholderTextColor={palette.inkPlaceholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
        />
        {rightElement}
      </View>
    </View>
  );
}
