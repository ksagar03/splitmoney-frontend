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
    pendingInviteToken: string | null;
    setAuth: (user: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    setPendingInviteToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    pendingInviteToken: null,

    setAuth: async (user, token) => {
        await AsyncStorage.multiSet([
            ['@auth_token', token],
            ['@auth_user', JSON.stringify(user)],
        ]);
        set({ user, token, isAuthenticated: true });
    },
    logout: async () => {
        await AsyncStorage.multiRemove(['@auth_token', '@auth_user']);
        set({ user: null, token: null, isAuthenticated: false, pendingInviteToken: null });
    },
    setPendingInviteToken: (token) => set({ pendingInviteToken: token }),
}))