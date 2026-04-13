import { HttpLink } from '@apollo/client/link/http';
import { SetContextLink } from '@apollo/client/link/context';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const httpLink = new HttpLink({
uri: 'http://192.168.1.X:4000/graphql',
})

const authLink = new SetContextLink(async ({headers}: any, _operation) => {
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