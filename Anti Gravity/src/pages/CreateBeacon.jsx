import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Send, ArrowLeft } from "lucide-react";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const LOCATIONS = [
    "Admin Block",
    "Library",
    "Total Fresh Cafe",
    "Annapurna Mess",
    "Vedavathi Mess",
    "Food Court",
    "Sports Ground",
    "Flag Area",
    "Grandstairs",
];
const CATEGORIES = ["Study", "Food", "Chill", "Sports", "Research", "Coding", "Gaming", "Events"];
const DURATIONS = [
    { label: "1 hour", hours: 1 },
    { label: "2 hours", hours: 2 },
];

export default function CreateBeacon() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    const [activity, setActivity] = useState("");
    const [category, setCategory] = useState("Study");
    const [location, setLocation] = useState(LOCATIONS[0]);
    const [partySize, setPartySize] = useState(2);
    const [duration, setDuration] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Redirect unauthenticated users to login
    useEffect(() => {
        if (!loading && !user) {
            navigate("/", { replace: true });
        }
    }, [user, loading, navigate]);

    // Loading spinner while auth state resolves
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    // Don't render form if no user (redirect is in-flight)
    if (!user) return null;

    async function handleSubmit(e) {
        e.preventDefault();
        if (!activity.trim() || !user) return;

        setSubmitting(true);
        setError(null);

        try {
            await addDoc(collection(db, "beacons"), {
                hostId: user.uid,
                hostName: user.displayName,
                activity: activity.trim(),
                location,
                category,
                maxParticipants: Number(partySize) + 1, // +1 to include the host
                currentParticipants: [user.uid],
                expiresAt: Timestamp.fromDate(
                    new Date(Date.now() + duration * 3600000)
                ),
                status: "active",
            });

            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    }

    /* shared input classes */
    const inputCls =
        "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            <Navbar />

            <main className="mx-auto max-w-lg px-4 py-10">
                {/* Back link */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    Back to Radar
                </button>

                {/* Card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
                    <h2 className="text-2xl font-bold tracking-tight mb-1">
                        New Beacon
                    </h2>
                    <p className="text-sm text-slate-400 mb-8">
                        Broadcast your intent — let others find you.
                    </p>

                    {error && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Activity */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                Activity
                            </label>
                            <input
                                type="text"
                                value={activity}
                                onChange={(e) => setActivity(e.target.value)}
                                placeholder='e.g. "Debugging Python Code"'
                                required
                                className={inputCls}
                            />
                        </div>

                        {/* Category & Location — side by side */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className={inputCls + " cursor-pointer"}
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c} value={c} className="bg-slate-900">
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                    Location
                                </label>
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className={inputCls + " cursor-pointer"}
                                >
                                    {LOCATIONS.map((l) => (
                                        <option key={l} value={l} className="bg-slate-900">
                                            {l}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Party Size & Duration — side by side */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                    Looking for # more
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={partySize}
                                    onChange={(e) => setPartySize(e.target.value)}
                                    className={inputCls}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                    Expires in
                                </label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className={inputCls + " cursor-pointer"}
                                >
                                    {DURATIONS.map((d) => (
                                        <option
                                            key={d.hours}
                                            value={d.hours}
                                            className="bg-slate-900"
                                        >
                                            {d.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3.5 text-sm font-semibold text-white transition-colors cursor-pointer mt-2"
                        >
                            <Send size={16} />
                            {submitting ? "Broadcasting…" : "Broadcast Beacon"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
