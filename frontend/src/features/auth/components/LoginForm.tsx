import { useState } from 'react';

interface Props {
    onSubmit: (data: { email: string; password: string }) => void;
    loading?: boolean;
    error?: string;
}

export default function LoginForm({ onSubmit, loading, error }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({ email, password });
            }}
            className="space-y-5"
        >
            {/* ERROR */}
            {error && (
                <div className="rounded-lg bg-red-100 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* EMAIL */}
            <div>
                <label className="mb-1 block text-sm text-gray-600">Email</label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            {/* PASSWORD */}
            <div>
                <label className="mb-1 block text-sm text-gray-600">Password</label>

                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-blue-600 focus:outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {/* TOGGLE PASSWORD */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                        {showPassword ? '🙈' : '👁'}
                    </button>
                </div>
            </div>

            {/* REMEMBER + FORGOT */}
            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                    />
                    Remember me
                </label>

                <button
                    type="button"
                    className="text-blue-600 hover:underline"
                >
                    Forgot password?
                </button>
            </div>

            {/* BUTTON */}
            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}