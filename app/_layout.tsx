import { client } from "@/src/graphql/apolloClient";
import { useAuthStore } from "@/src/store/useAuthStore";
import { ApolloProvider } from "@apollo/client";
import {Slot, useRouter, useSegments } from "expo-router";
import {useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

function AuthGuard() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const [[, storedToken], [, storedUser]] = await AsyncStorage.multiGet([
        '@auth_token',
        '@auth_user',
      ]);
      if (storedToken) {
        useAuthStore.setState({
          token: storedToken,
          isAuthenticated: true,
          user: storedUser ? JSON.parse(storedUser) : null,
        });
      }
      setIsBootstrapping(false);
    })();
  }, []);

  useEffect(() => {
    if (isBootstrapping) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inJoinFlow = segments[0] === 'join';
    // Read current store state directly to avoid race between Zustand + React batching
    const authed = useAuthStore.getState().isAuthenticated;
    // /join handles its own auth — don't redirect away from it
    if (!authed && !inAuthGroup && !inJoinFlow) router.replace('/(auth)');
    else if (authed && inAuthGroup) router.replace('/(tabs)');
  }, [isAuthenticated, segments, isBootstrapping, router]);

  if (isBootstrapping) return null;
  return <Slot />;
}

export default function RootLayout() {
  return (
    <ApolloProvider client={client}>
      <AuthGuard />
    </ApolloProvider>
  );
}