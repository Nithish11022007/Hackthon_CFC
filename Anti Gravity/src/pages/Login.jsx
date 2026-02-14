import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, AlertCircle } from "lucide-react";

export default function Login() {
    const { loginWithGoogle, user, loading } = useAuth();
    const navigate = useNavigate();
    const [signingIn, setSigningIn] = useState(false);
    const [error, setError] = useState(null);

    // Redirect when authenticated
    useEffect(() => {
        if (!loading && user) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, loading, navigate]);

    async function handleLogin() {
        setError(null);
        setSigningIn(true);
        const result = await loginWithGoogle();
        if (!result.success && result.code !== "cancelled" && result.message) {
            setError(result.message);
        }
        setSigningIn(false);
    }

    // While auth state is loading, show a clean spinner
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    // If already logged in, show nothing (redirect in-flight)
    if (user) return null;

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden p-4">

            {/* ── Animated background blobs ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="login-blob login-blob-1" />
                <div className="login-blob login-blob-2" />
                <div className="login-blob login-blob-3" />
            </div>

            {/* ── Glassmorphism card ── */}
            <div className="login-fade-in relative z-10 w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.04] p-10 backdrop-blur-2xl shadow-[0_8px_64px_rgba(99,102,241,0.08)]">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="login-fade-in mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/20 transition-transform hover:scale-105" style={{ animationDelay: "0.1s" }}>
                        <Sparkles className="h-9 w-9 text-white" />
                    </div>

                    <h1 className="login-fade-in text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent" style={{ animationDelay: "0.2s" }}>
                        JoinIn
                    </h1>

                    <p className="login-fade-in mt-2.5 text-sm text-slate-400 leading-relaxed" style={{ animationDelay: "0.35s" }}>
                        SRM AP&apos;s Pulse — Find your people, right now.
                    </p>
                </div>

                {/* ── Inline Error Alert ── */}
                {error && (
                    <div className="login-fade-in mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3.5">
                        <AlertCircle size={18} className="mt-0.5 text-red-400 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-red-300">{error}</p>
                            <p className="mt-0.5 text-xs text-red-400/70">
                                Try again with your <span className="font-semibold text-red-300">@srmap.edu.in</span> account.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Sign-in Button ── */}
                <div className="login-fade-in space-y-5" style={{ animationDelay: "0.45s" }}>
                    <button
                        onClick={handleLogin}
                        disabled={signingIn}
                        className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg cursor-pointer"
                    >
                        {signingIn ? (
                            <>
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Signing in…
                            </>
                        ) : (
                            <>
                                {/* Google G Logo */}
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Sign in with Google
                            </>
                        )}
                    </button>

                    {/* Domain hint */}
                    <p className="text-center text-xs text-slate-500/80">
                        Only <span className="font-medium text-indigo-400/80">@srmap.edu.in</span> emails
                    </p>
                </div>

                {/* ── Footer ── */}
                <div className="login-fade-in mt-10 pt-6 border-t border-white/[0.06] text-center" style={{ animationDelay: "0.55s" }}>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                        By signing in, you agree to our community guidelines.
                        <br />
                        Built for SRM AP students.
                    </p>
                </div>
            </div>
        </div>
    );
}