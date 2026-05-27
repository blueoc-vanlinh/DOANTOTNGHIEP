import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    hasHydrated: boolean;

    login: (user: User, tokens: { accessToken: string; refreshToken: string }) => void;
    updateTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
    logout: () => void;
    setHasHydrated: (value: boolean) => void;

    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            hasHydrated: false,

            login: (user, tokens) => {
                set({
                    user: user,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    isAuthenticated: true,
                });
            },

            updateTokens: (tokens) => {
                set({
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    isAuthenticated: true,
                });
            },

            logout: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });

                localStorage.removeItem('auth-storage');

                window.location.href = '/login';
            },

            setHasHydrated: (value) => {
                set({ hasHydrated: value });
            },

            hasRole: (role) => {
                return get().hasAnyRole([role]);
            },

            hasAnyRole: (allowedRoles) => {
                const { user } = get();

                if (!user || !user.roles) return false;

                return user.roles.some((r) => allowedRoles.includes(r));
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
