import React, { useEffect } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";

// Smooth sine-like curve using bezier — Easing.sine is unavailable in this version
const smoothInOut = Easing.bezier(0.45, 0, 0.55, 1);

interface Props {
  size?: number;
  bgColor?: string;
}

export default function SplitMoneyLogo({ size = 64, bgColor = "#0E0E1C" }: Props) {
  const gap = 2.5;
  const centerSize = Math.round(size * 0.36);

  // Entry
  const entryScale = useSharedValue(0.15);
  const entryOpacity = useSharedValue(0);

  // Rotating cross (split lines)
  const rotation = useSharedValue(0);

  // Rupee opacity glow
  const rupeeOpacity = useSharedValue(1);

  // Outer glow ring pulse
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    // 1. Fade + spring scale in
    entryOpacity.value = withTiming(1, { duration: 350 });
    entryScale.value = withSpring(1, { damping: 12, stiffness: 100 });

    // 2. Cross starts spinning after entry settles
    rotation.value = withDelay(
      500,
      withRepeat(
        withTiming(360, { duration: 9000, easing: Easing.linear }),
        -1,
        false
      )
    );

    // 3. Rupee slow opacity glow: fades between dim and bright
    rupeeOpacity.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(0.45, { duration: 1600, easing: smoothInOut }),
          withTiming(1.0, { duration: 1600, easing: smoothInOut })
        ),
        -1,
        false
      )
    );

    // 4. Outer glow breathes
    glowOpacity.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: 1400, easing: smoothInOut }),
          withTiming(0.2, { duration: 1400, easing: smoothInOut })
        ),
        -1,
        false
      )
    );
  }, []);

  const entryStyle = useAnimatedStyle(() => ({
    opacity: entryOpacity.value,
    transform: [{ scale: entryScale.value }],
  }));

  const crossStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const rupeeStyle = useAnimatedStyle(() => ({
    opacity: rupeeOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, entryStyle]}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: -6,
            left: -6,
            right: -6,
            bottom: -6,
            borderRadius: (size + 12) / 2,
            borderWidth: 2,
            borderColor: "#8B5CF6",
          },
          glowStyle,
        ]}
      />

      {/* Circle with overflow clip — rasterized to GPU texture to prevent jitter */}
      <View
        renderToHardwareTextureAndroid
        shouldRasterizeIOS
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
        }}
      >
        {/* Gradient fill */}
        <LinearGradient
          colors={["#8B5CF6", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: size, height: size }}
        />

        {/* Rotating split lines — clipped by the parent circle */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: size,
              height: size,
              top: 0,
              left: 0,
            },
            crossStyle,
          ]}
        >
          <View
            style={{
              position: "absolute",
              top: (size - gap) / 2,
              left: 0,
              right: 0,
              height: gap,
              backgroundColor: bgColor,
            }}
          />
          <View
            style={{
              position: "absolute",
              left: (size - gap) / 2,
              top: 0,
              bottom: 0,
              width: gap,
              backgroundColor: bgColor,
            }}
          />
        </Animated.View>

        {/* Center circle — does NOT rotate */}
        <View
          style={{
            position: "absolute",
            top: (size - centerSize) / 2,
            left: (size - centerSize) / 2,
            width: centerSize,
            height: centerSize,
            borderRadius: centerSize / 2,
            backgroundColor: bgColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Animated.Text
            style={[
              {
                color: "#FFFFFF",
                fontSize: Math.round(centerSize * 0.62),
                fontWeight: "700",
                includeFontPadding: false,
                textAlignVertical: "center",
              },
              rupeeStyle,
            ]}
          >
            ₹
          </Animated.Text>
        </View>
      </View>
    </Animated.View>
  );
}
