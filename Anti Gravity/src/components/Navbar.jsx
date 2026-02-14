import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-slate-950/80 backdrop-blur-lg px-6 py-3">
            {/* Brand */}
            <h1 className="text-xl font-bold tracking-tight text-white">
                Join<span className="text-indigo-400">In</span>
            </h1>

            {/* User controls */}
            {user && (
                <div className="flex items-center gap-4">
                    <img
                        src={user.photoURL}
                        alt={user.displayName}
                        referrerPolicy="no-referrer"
                        className="h-8 w-8 rounded-full ring-2 ring-indigo-500/50 object-cover"
                    />
                    <span className="hidden sm:block text-sm text-slate-300 font-medium">
                        {user.displayName}
                    </span>
                    <button
                        onClick={logout}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <LogOut size={14} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            )}
        </nav>
    );
}
