import { HttpLink } from '@apollo/client/link/http';
import { setContext } from '@apollo/client/link/context';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
})