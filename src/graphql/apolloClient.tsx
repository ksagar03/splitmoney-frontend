import { HttpLink } from '@apollo/client/link/http';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/useAuthStore';

const httpLink = new HttpLink({
uri: process.env.EXPO_PUBLIC_GRAPHQL_URI,
})

const authLink = setContext(async(_, { headers }) => {
    const token = await AsyncStorage.getItem('@auth_token');
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        }
    }
})

const errorLink = onError(({ graphQLErrors }) => {
    const isUnauth = graphQLErrors?.some(
        (err) => err.extensions?.code === 'UNAUTHENTICATED'
    );
    if (isUnauth) {
        useAuthStore.getState().logout();
    }
});

export const client = new ApolloClient({
    link: errorLink.concat(authLink.concat(httpLink)),
    cache: new InMemoryCache(),
})