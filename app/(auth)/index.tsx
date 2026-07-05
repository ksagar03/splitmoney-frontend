import { LOGIN_MUTATION, REGISTER_MUTATION, JOIN_GROUP, GET_GROUPS } from "@/src/graphql/mutation";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import SplitMoneyLogo from "@/src/components/SplitMoneyLogo";
import { Screen, FormField, GradientButton } from "@/src/components/ui";
import { palette, brandGradient } from "@/src/constants/theme";

/**
 * Maps the structured error from the backend into a user-friendly message.
 *
 * Priority order:
 * 1. Extension code  — sent by AuthException via GraphQLExceptionHandler (most reliable)
 * 2. Network error   — Apollo wraps connection failures separately
 * 3. Fallback        — show the raw message if it looks human-readable
 */
function resolveAuthError(error: any): string {
  const code: string | undefined = error.graphQLErrors?.[0]?.extensions?.code;
  if (code) {
    switch (code) {
      case "INVALID_CREDENTIALS":       return "Incorrect email or password.";
      case "USER_NOT_FOUND":            return "No account found with that email.";
      case "EMAIL_ALREADY_REGISTERED":  return "An account with this email already exists.";
      case "SOCIAL_LOGIN_REQUIRED":     return error.graphQLErrors[0].message;
      case "MISSING_FIELDS":            return "Please fill in all fields.";
      default:                          return error.graphQLErrors[0].message ?? "Something went wrong.";
    }
  }
  if (error.networkError) {
    return "Can't reach the server. Check your connection and try again.";
  }
  const raw: string = error.graphQLErrors?.[0]?.message ?? "";
  if (raw && !raw.toLowerCase().includes("internal")) return raw;
  return "Something went wrong. Please try again.";
}

const BRAND_FEATURES = [
  "Track group expenses together",
  "Smart balance calculations",
  "Instant settle-up suggestions",
];

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setAuth = useAuthStore((state) => state.setAuth);
  const pendingInviteToken = useAuthStore((state) => state.pendingInviteToken);
  const setPendingInviteToken = useAuthStore((state) => state.setPendingInviteToken);

  const [loginMutation, { loading: loginLoading }] = useMutation<any>(LOGIN_MUTATION);
  const [registerMutation, { loading: registerLoading }] = useMutation<any>(REGISTER_MUTATION);
  const [joinGroupMutation] = useMutation(JOIN_GROUP, {
    refetchQueries: [{ query: GET_GROUPS }],
  });
  const isLoading = loginLoading || registerLoading;

  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));
  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(0, { duration: 40 })
    );
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    triggerShake();
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (!email || !password || (!isLogin && !name)) {
      showError("Please fill in all fields.");
      return;
    }
    try {
      if (isLogin) {
        const { data: { login } } = await loginMutation({ variables: { email, password } });
        await setAuth(login.user, login.token);
      } else {
        const { data: { register } } = await registerMutation({ variables: { name, email, password } });
        await setAuth(register.user, register.token);
      }
      if (pendingInviteToken) {
        setPendingInviteToken(null);
        try {
          await joinGroupMutation({ variables: { token: pendingInviteToken } });
        } catch {
          // Silently ignore — user is logged in, group join can be retried
        }
      }
    } catch (error: any) {
      showError(resolveAuthError(error));
    }
  };

  // ── Shared form body (used in both web and mobile layouts) ─────────────────

  const modeHeader = (
    <Animated.View key={isLogin ? "login" : "register"} entering={FadeIn.duration(280)}>
      <View className="items-center mb-7">
        <Text className="text-ink-faint text-sm font-medium tracking-wide mb-1 uppercase">
          {isLogin ? "Welcome back" : "Hey there,"}
        </Text>
        <Text className="text-ink text-[28px] font-extrabold tracking-tight">
          {isLogin ? "Sign in" : "Create account"}
        </Text>
      </View>
    </Animated.View>
  );

  const formFields = (
    <View className="w-full">
      {!isLogin && (
        <Animated.View entering={FadeInDown.duration(260)} exiting={FadeOutUp.duration(180)}>
          <FormField
            label="Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={(v) => { setName(v); setErrorMessage(null); }}
            autoCapitalize="words"
            editable={!isLoading}
          />
        </Animated.View>
      )}

      <FormField
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={(v) => { setEmail(v); setErrorMessage(null); }}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />

      <FormField
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={(v) => { setPassword(v); setErrorMessage(null); }}
        secureTextEntry={!showPassword}
        editable={!isLoading}
        rightElement={
          <TouchableOpacity
            className="px-4 py-3.5"
            onPress={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={palette.brand}
            />
          </TouchableOpacity>
        }
      />

      {errorMessage && (
        <Animated.View entering={FadeIn.duration(200)}>
          <View
            className="flex-row items-center bg-danger/10 border border-danger/30 rounded-[10px] py-2.5 px-3.5 mb-3"
            style={{ gap: 8 }}
          >
            <Ionicons name="alert-circle" size={16} color="#FCA5A5" />
            <Text className="text-[#FCA5A5] text-[13px] font-medium flex-1">{errorMessage}</Text>
          </View>
        </Animated.View>
      )}

      <GradientButton
        label={isLogin ? "Sign in" : "Create account"}
        onPress={handleSubmit}
        loading={isLoading}
        className="mt-2"
      />

      <View className="my-6 items-center">
        <View className="w-full h-px bg-white/[0.06]" />
      </View>

      <View className="flex-row justify-center items-center" style={{ gap: 6 }}>
        <Text className="text-ink-faint text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
        </Text>
        <TouchableOpacity
          onPress={() => { setIsLogin(!isLogin); setErrorMessage(null); }}
          disabled={isLoading}
          className="py-0.5 px-1"
        >
          <Text className="text-brand text-sm font-bold">
            {isLogin ? "Register" : "Sign in"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Web: two-column layout ─────────────────────────────────────────────────

  if (Platform.OS === "web") {
    return (
      <Screen blobs={false}>
        <View style={{ flex: 1, flexDirection: "row" }}>
          {/* Left: brand panel */}
          <LinearGradient
            colors={["rgba(139,92,246,0.22)", "rgba(59,130,246,0.12)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 64,
              borderRightWidth: 1,
              borderRightColor: "rgba(139,92,246,0.2)",
            }}
          >
            <SplitMoneyLogo size={88} bgColor={palette.background} />

            <Text
              style={{
                color: palette.ink,
                fontSize: 44,
                fontWeight: "800",
                letterSpacing: -0.5,
                marginTop: 28,
                marginBottom: 10,
              }}
            >
              SplitMoney
            </Text>
            <Text
              style={{
                color: palette.inkMuted,
                fontSize: 17,
                textAlign: "center",
                marginBottom: 40,
                maxWidth: 300,
                lineHeight: 26,
              }}
            >
              Split expenses, stay balanced, no awkward IOUs.
            </Text>

            {BRAND_FEATURES.map((f) => (
              <View key={f} style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <LinearGradient
                  colors={brandGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: 8, height: 8, borderRadius: 4 }}
                />
                <Text style={{ color: palette.inkMuted, fontSize: 15 }}>{f}</Text>
              </View>
            ))}
          </LinearGradient>

          {/* Right: form panel */}
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 64,
              backgroundColor: palette.surface,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[shakeStyle, { width: "100%", maxWidth: 400 }]}>
              {modeHeader}
              {formFields}
            </Animated.View>
          </ScrollView>
        </View>
      </Screen>
    );
  }

  // ── Mobile: centered card layout ───────────────────────────────────────────

  return (
    <Screen edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 40,
            paddingHorizontal: 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInUp.duration(500).springify().damping(18)}
            className="w-full max-w-[440px]"
          >
          <Animated.View
            style={[shakeStyle, {
              shadowColor: palette.brand,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 40,
              elevation: 12,
            }]}
            className="bg-surface rounded-3xl border border-brand/20 px-8 py-9"
          >
            <View className="items-center mb-6 pt-2 px-2">
              <SplitMoneyLogo size={64} bgColor={palette.surface} />
            </View>
            {modeHeader}
            {formFields}
          </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
