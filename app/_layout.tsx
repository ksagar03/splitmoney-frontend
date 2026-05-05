
import { useAuthStore } from "@/src/store/useAuthStore";
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
      const storedToken = await AsyncStorage.getItem('@auth_token');
      if (storedToken) {
        useAuthStore.setState({ token: storedToken, isAuthenticated: true });
      }
      setIsBootstrapping(false);
    })();
  }, []);

  useEffect(() => {
    if (isBootstrapping) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) router.replace('/(auth)');
    else if (isAuthenticated && inAuthGroup) router.replace('/');
  }, [isAuthenticated, segments, isBootstrapping, router]);

  if (isBootstrapping) return null;
  return <Slot />;
}