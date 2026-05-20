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
    isAuthenticated: boolean;

    login: (user: User) => void;
    logout: () => void;

    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,

            login: (user) => {
                set({
                    user: user,
                    isAuthenticated: true,
                });
            },

            logout: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                });

                localStorage.removeItem('auth-storage');

                window.location.href = '/login';
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
        }
    )
);
