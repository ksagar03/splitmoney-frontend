import { ApolloClient, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { HttpLink } from "@apollo/client/link/http";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useAuthStore } from "../store/useAuthStore";

function getGraphQLUri(): string {
  // Web always uses the env var (localhost works fine in browser)
  if (Platform.OS === "web") {
    return (
      process.env.EXPO_PUBLIC_GRAPHQL_URI ?? "http://localhost:8080/graphql"
    );
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:8080/grapgql`;
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8080/graphql";
  }
  return process.env.EXPO_PUBLIC_GRAPHQL_URI ?? "http://localhost:8080/graphql";
}

const httpLink = new HttpLink({
  uri: getGraphQLUri(),
});

const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem("@auth_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const errorLink = onError(({ graphQLErrors }) => {
  const isUnauth = graphQLErrors?.some(
    (err) => err.extensions?.code === "UNAUTHENTICATED",
  );
  if (isUnauth) {
    useAuthStore.getState().logout();
  }
});

export const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
});
