import { useMutation } from '@tanstack/react-query';
import { loginApi } from './api';
import { useAuthStore } from '@/store/auth.store';

export const useLogin = () => {
    const loginStore = useAuthStore((s) => s.login);

    return useMutation({
        mutationFn: loginApi,

        onSuccess: (data) => {
            loginStore(data.accessToken, data.user);
        },
    });
};