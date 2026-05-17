import { LOGIN_MUTATION, REGISTER_MUTATION } from "@/src/graphql/mutation";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useMutation } from "@apollo/client";
import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import SplitMoneyLogo from "@/src/components/SplitMoneyLogo";

/**
 * Maps the structured error from the backend into a user-friendly message.
 *
 * Priority order:
 * 1. Extension code  — sent by AuthException via GraphQLExceptionHandler (most reliable)
 * 2. Network error   — Apollo wraps connection failures separately
 * 3. Fallback        — show the raw message if it looks human-readable
 */
function resolveAuthError(error: any): string {
  // 1. Structured code from backend extensions
  const code: string | undefined = error.graphQLErrors?.[0]?.extensions?.code;
  if (code) {
    switch (code) {
      case "INVALID_CREDENTIALS":       return "Incorrect email or password.";
      case "USER_NOT_FOUND":            return "No account found with that email.";
      case "EMAIL_ALREADY_REGISTERED":  return "An account with this email already exists.";
      case "SOCIAL_LOGIN_REQUIRED":     return error.graphQLErrors[0].message; // provider-specific, show as-is
      case "MISSING_FIELDS":            return "Please fill in all fields.";
      default:                          return error.graphQLErrors[0].message ?? "Something went wrong.";
    }
  }

  // 2. Network-level failure (server down, wrong URL, CORS)
  if (error.networkError) {
    return "Can't reach the server. Check your connection and try again.";
  }

  // 3. Unclassified GraphQL error — show the raw message if present
  const raw: string = error.graphQLErrors?.[0]?.message ?? "";
  if (raw && !raw.toLowerCase().includes("internal")) return raw;

  return "Something went wrong. Please try again.";
}

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setAuth = useAuthStore((state) => state.setAuth);

  const [loginMutation, { loading: loginLoading }] = useMutation<any>(LOGIN_MUTATION);
  const [registerMutation, { loading: registerLoading }] = useMutation<any>(REGISTER_MUTATION);
  const isLoading = loginLoading || registerLoading;

  // ── Animations ──────────────────────────────────────────────────────────────

  // Card entrance
  const cardAnim = useRef(new Animated.Value(0)).current;

  // Name field expand/collapse (height + opacity)
  const nameHeightAnim = useRef(new Animated.Value(0)).current;
  const nameOpacityAnim = useRef(new Animated.Value(0)).current;

  // Button press scale
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Title fade when toggling mode
  const titleOpacity = useRef(new Animated.Value(1)).current;

  // Error shake
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 40, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      damping: 20,
      stiffness: 85,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // Fade title out → update → fade back in
    Animated.timing(titleOpacity, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    // Slide name field in/out
    Animated.parallel([
      Animated.timing(nameHeightAnim, {
        toValue: isLogin ? 0 : 1,
        duration: 280,
        useNativeDriver: false, // height needs JS driver
      }),
      Animated.timing(nameOpacityAnim, {
        toValue: isLogin ? 0 : 1,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isLogin]);

  const onButtonPressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const onButtonPressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

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
    } catch (error: any) {
      showError(resolveAuthError(error));
    }
  };

  // ── Derived animated styles ──────────────────────────────────────────────────

  const cardStyle = {
    opacity: cardAnim,
    transform: [
      {
        translateY: cardAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [48, 0],
        }),
      },
      { translateX: shakeAnim },
    ],
  };

  const nameFieldStyle = {
    maxHeight: nameHeightAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 100],
    }),
    opacity: nameOpacityAnim,
    overflow: "hidden" as const,
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background gradient blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Card ── */}
          <Animated.View style={[styles.card, cardStyle]}>

            {/* Logo */}
            <View style={styles.logoWrapper}>
              <SplitMoneyLogo size={64} bgColor="#0E0E1C" />
            </View>

            {/* Header */}
            <Animated.View style={[styles.header, { opacity: titleOpacity }]}>
              <Text style={styles.greeting}>
                {isLogin ? "Welcome back" : "Hey there,"}
              </Text>
              <Text style={styles.title}>
                {isLogin ? "Sign in" : "Create account"}
              </Text>
            </Animated.View>

            {/* Form */}
            <View style={styles.form}>

              {/* Name field — animated */}
              <Animated.View style={nameFieldStyle} pointerEvents={isLogin ? "none" : "auto"}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === "name" && styles.inputFocused,
                    ]}
                    placeholder="Enter your name"
                    placeholderTextColor="#3D3D5C"
                    value={name}
                    onChangeText={(v) => { setName(v); setErrorMessage(null); }}
                    autoCapitalize="words"
                    editable={!isLoading}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </Animated.View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === "email" && styles.inputFocused,
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor="#3D3D5C"
                  value={email}
                  onChangeText={(v) => { setEmail(v); setErrorMessage(null); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View
                  style={[
                    styles.passwordContainer,
                    focusedField === "password" && styles.inputFocused,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#3D3D5C"
                    value={password}
                    onChangeText={(v) => { setPassword(v); setErrorMessage(null); }}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={ACCENT}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Inline error banner */}
              {errorMessage && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{errorMessage}</Text>
                </View>
              )}

              {/* Submit button */}
              <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonScale }] }]}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={handleSubmit}
                  onPressIn={onButtonPressIn}
                  onPressOut={onButtonPressOut}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={isLoading ? ["#4C3A8A", "#2A4A8A"] : ["#8B5CF6", "#3B82F6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="rgba(255,255,255,0.7)" />
                    ) : (
                      <Text style={styles.buttonText}>
                        {isLogin ? "Sign in" : "Create account"}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
            </View>

            {/* Footer toggle */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </Text>
              <TouchableOpacity
                onPress={() => setIsLogin(!isLogin)}
                disabled={isLoading}
                style={styles.footerLinkWrapper}
              >
                <Text style={styles.footerLink}>
                  {isLogin ? "Register" : "Sign in"}
                </Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const CARD_MAX_WIDTH = 440;
const ACCENT = "#8B5CF6";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#080812",
  },

  // Decorative background blobs (soft glow circles)
  blobTopRight: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(139, 92, 246, 0.07)",
    top: -80,
    right: -80,
  },
  blobBottomLeft: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(59, 130, 246, 0.06)",
    bottom: -60,
    left: -60,
  },

  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  // ── Card ────────────────────────────────────────────────────────────────────
  card: {
    width: "100%",
    maxWidth: CARD_MAX_WIDTH,
    backgroundColor: "#0E0E1C",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.18)",
    paddingHorizontal: 32,
    paddingVertical: 36,
    // Glow
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 12,
  },

  // ── Logo ────────────────────────────────────────────────────────────────────
  logoWrapper: {
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 8,   // breathing room for the glow ring
    paddingHorizontal: 8,
  },
  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  greeting: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.4,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  // ── Form ────────────────────────────────────────────────────────────────────
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    backgroundColor: "#090915",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 15,
  },
  inputFocused: {
    borderColor: "rgba(139, 92, 246, 0.6)",
    backgroundColor: "#0C0C1A",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#090915",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 15,
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  eyeIcon: {
    // eyeButton already handles padding; this is a placeholder kept for override
  },

  // ── Error banner ────────────────────────────────────────────────────────────
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  errorBannerText: {
    color: "#FCA5A5",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },

  // ── Button ──────────────────────────────────────────────────────────────────
  buttonWrapper: {
    marginTop: 8,
    borderRadius: 12,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // ── Divider ─────────────────────────────────────────────────────────────────
  divider: {
    marginVertical: 24,
    alignItems: "center",
  },
  dividerLine: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    color: "#6B7280",
    fontSize: 14,
  },
  footerLinkWrapper: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  footerLink: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: "700",
  },
});
