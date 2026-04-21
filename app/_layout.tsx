import { client } from "@/src/graphql/apolloClient";
import { useAuthStore } from "@/src/store/useAuthStore";
import {Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ApolloProvider } from "@apollo/client/react";

function AuthGuard(){
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    
    if(!isAuthenticated && !inAuthGroup){
      router.replace('/(auth)');
    } else if(isAuthenticated && inAuthGroup){
      router.replace('/');
    }

  }, [isAuthenticated, segments, router]);
  return <Slot/>
}

export default function RootLayout(){
  return (
    <ApolloProvider client={client}>
      <AuthGuard />
    </ApolloProvider>
  )
}