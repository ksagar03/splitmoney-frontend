import {create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User{
    id: string;
    name: string;
    email: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth:(user:User, token: string) => Promise<void>
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    setAuth: async (user, token) => {
        await AsyncStorage.setItem('@auth_token', token);
        set({user, token, isAuthenticated: true});
    },
    logout: async () => {
        await AsyncStorage.removeItem('@auth_token');
        set({user: null, token: null, isAuthenticated: false});
    }
}))