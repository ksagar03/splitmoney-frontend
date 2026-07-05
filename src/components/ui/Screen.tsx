import { palette } from "@/src/constants/theme";
import React from "react";
import { View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

interface ScreenProps {
  children: React.ReactNode;
  edges?: Edge[];
  /** Set to false to suppress the decorative background blobs (e.g. on web layouts). */
  blobs?: boolean;
}

export function Screen({
  children,
  edges = ["top"],
  blobs = true,
}: ScreenProps) {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: palette.background }}
      edges={edges}
    >
      {blobs && (
        <>
          <View
            style={{
              position: "absolute",
              width: 340,
              height: 340,
              borderRadius: 170,
              backgroundColor: "rgba(139, 92, 246, 0.07)",
              top: -80,
              right: -80,
            }}
            pointerEvents="none"
          />
          <View
            style={{
              position: "absolute",
              width: 280,
              height: 280,
              borderRadius: 140,
              backgroundColor: "rgba(59, 130, 246, 0.06)",
              bottom: -60,
              left: -60,
            }}
            pointerEvents="none"
          />
        </>
      )}
      {children}
    </SafeAreaView>
  );
}
