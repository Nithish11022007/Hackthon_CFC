import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    arrayUnion,
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";
import {
    ArrowLeft,
    MapPin,
    Users,
    Clock,
    Sparkles,
    Send,
    Trash2,
    BookOpen,
    Utensils,
    Gamepad2,
    Dribbble,
    FlaskConical,
    Code2,
    Joystick,
    CalendarDays,
} from "lucide-react";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { generateIcebreaker } from "../lib/ai";
import Navbar from "../components/Navbar";

/* ── AI Icebreaker tips by category ── */
const icebreakers = {
    Study:
        "AI Tip: Ask if everyone has the latest lab manual or needs help with a specific concept!",
    Food:
        "AI Tip: Ask if the food is spicy today—it's a classic SRM conversation starter!",
    Sports:
        "AI Tip: Ask who's winning or if they need an extra player for the next round.",
    Chill:
        "AI Tip: Just say hi! Everyone is here to relax.",
    Research:
        "AI Tip: Ask what research papers or datasets everyone is working with right now!",
    Coding:
        "AI Tip: Ask what tech stack or language everyone is hacking on today!",
    Gaming:
        "AI Tip: Ask what game everyone's playing or if they need a teammate!",
    Events:
        "AI Tip: Ask what the event schedule looks like or who's performing next!",
};

/* ── Category visuals ── */
const categoryMeta = {
    Study: { icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10", accent: "from-emerald-500/20" },
    Food: { icon: Utensils, color: "text-amber-400", bg: "bg-amber-500/10", accent: "from-amber-500/20" },
    Chill: { icon: Gamepad2, color: "text-violet-400", bg: "bg-violet-500/10", accent: "from-violet-500/20" },
    Sports: { icon: Dribbble, color: "text-rose-400", bg: "bg-rose-500/10", accent: "from-rose-500/20" },
    Research: { icon: FlaskConical, color: "text-cyan-400", bg: "bg-cyan-500/10", accent: "from-cyan-500/20" },
    Coding: { icon: Code2, color: "text-sky-400", bg: "bg-sky-500/10", accent: "from-sky-500/20" },
    Gaming: { icon: Joystick, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", accent: "from-fuchsia-500/20" },
    Events: { icon: CalendarDays, color: "text-orange-400", bg: "bg-orange-500/10", accent: "from-orange-500/20" },
};

function timeLeft(expiresAt) {
    if (!expiresAt) return null;
    const now = Date.now();
    const exp = expiresAt.toDate ? expiresAt.toDate().getTime() : expiresAt;
    const diff = exp - now;
    if (diff <= 0) return "Expired";
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m left`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m left`;
}

export default function BeaconDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [beacon, setBeacon] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState("");
    const [pageLoading, setPageLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [sendingMsg, setSendingMsg] = useState(false);

    // Auth guard
    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/", { replace: true });
        }
    }, [user, authLoading, navigate]);

    // Fetch beacon data
    useEffect(() => {
        if (!user || !id) return;

        async function fetchBeacon() {
            const snap = await getDoc(doc(db, "beacons", id));
            if (snap.exists()) {
                setBeacon({ id: snap.id, ...snap.data() });
            }
            setPageLoading(false);
        }
        fetchBeacon();
    }, [id, user]);

    // Real-time participants listener
    useEffect(() => {
        if (!user || !id) return;

        const unsubscribe = onSnapshot(
            collection(db, "beacons", id, "participants"),
            (snapshot) => {
                setParticipants(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
            }
        );

        return unsubscribe;
    }, [id, user]);

    // Real-time chat listener
    useEffect(() => {
        if (!user || !id) return;

        const q = query(
            collection(db, "beacons", id, "chats"),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        });

        return unsubscribe;
    }, [id, user]);

    // Join beacon
    async function handleJoin() {
        if (!user || !beacon) return;
        setJoining(true);
        try {
            // Add uid to the beacon's currentParticipants array
            await updateDoc(doc(db, "beacons", id), {
                currentParticipants: arrayUnion(user.uid),
            });

            // Create a rich profile doc in the participants subcollection
            await setDoc(doc(db, "beacons", id, "participants", user.uid), {
                uid: user.uid,
                displayName: user.displayName,
                photoURL: user.photoURL,
                joinedAt: serverTimestamp(),
            });

            setBeacon((prev) => ({
                ...prev,
                currentParticipants: [...(prev.currentParticipants || []), user.uid],
            }));

            // Generate and post AI icebreaker
            try {
                const icebreaker = await generateIcebreaker(
                    beacon.activity,
                    beacon.category
                );
                await addDoc(collection(db, "beacons", id, "chats"), {
                    senderId: "AI_SYSTEM",
                    senderName: "✨ AI Social Assistant",
                    text: icebreaker,
                    timestamp: serverTimestamp(),
                });
            } catch (aiErr) {
                console.warn("AI icebreaker failed:", aiErr);
            }
        } catch (err) {
            console.error("Failed to join:", err);
        }
        setJoining(false);
    }

    // Send chat message
    async function handleSendMessage(e) {
        e.preventDefault();
        if (!newMsg.trim() || !user) return;
        setSendingMsg(true);
        try {
            await addDoc(collection(db, "beacons", id, "chats"), {
                senderId: user.uid,
                senderName: user.displayName,
                text: newMsg.trim(),
                timestamp: serverTimestamp(),
            });
            setNewMsg("");
        } catch (err) {
            console.error("Failed to send:", err);
        }
        setSendingMsg(false);
    }

    // Delete beacon (host only)
    async function handleDelete() {
        if (!window.confirm("Are you sure you want to delete this beacon? This cannot be undone.")) return;
        try {
            const chatsSnap = await getDocs(collection(db, "beacons", id, "chats"));
            await Promise.all(chatsSnap.docs.map((d) => deleteDoc(d.ref)));

            const partsSnap = await getDocs(collection(db, "beacons", id, "participants"));
            await Promise.all(partsSnap.docs.map((d) => deleteDoc(d.ref)));

            await deleteDoc(doc(db, "beacons", id));
            navigate("/dashboard");
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    }

    // Loading / auth states
    if (authLoading || pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    if (!user) return null;

    if (!beacon) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
                <Navbar />
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <p className="text-slate-400 text-lg">Beacon not found.</p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="text-indigo-400 hover:text-indigo-300 text-sm underline cursor-pointer"
                    >
                        Back to Radar
                    </button>
                </div>
            </div>
        );
    }

    const meta = categoryMeta[beacon.category] || categoryMeta.Study;
    const CategoryIcon = meta.icon;
    const participantUids = beacon.currentParticipants || [];
    const alreadyJoined = participantUids.includes(user.uid);
    const spots = beacon.maxParticipants - participantUids.length;
    const tip = icebreakers[beacon.category] || icebreakers.Chill;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            <Navbar />

            <main className="mx-auto max-w-2xl px-4 py-8">
                {/* Back */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    Back to Radar
                </button>

                {/* ── Beacon Details Card ── */}
                <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 mb-6`}>
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-4">
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.color} ${meta.bg}`}
                        >
                            <CategoryIcon size={14} />
                            {beacon.category}
                        </span>
                        {beacon.expiresAt && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                <Clock size={12} />
                                {timeLeft(beacon.expiresAt)}
                            </span>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight mb-2">
                        {beacon.activity}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6">
                        <span className="inline-flex items-center gap-1">
                            <MapPin size={14} className="text-slate-500" />
                            {beacon.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Users size={14} className="text-slate-500" />
                            {Math.max(0, participantUids.length - 1)} / {beacon.maxParticipants - 1} joined
                        </span>
                    </div>

                    {/* Join / Status */}
                    {!alreadyJoined && (
                        <button
                            onClick={handleJoin}
                            disabled={joining || spots <= 0}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3 text-sm font-semibold text-white transition-colors cursor-pointer"
                        >
                            {joining
                                ? "Joining…"
                                : spots > 0
                                    ? "Join this Beacon"
                                    : "Beacon is Full"}
                        </button>
                    )}
                    {alreadyJoined && (
                        <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-4 py-3 text-sm text-indigo-300 text-center font-medium">
                            ✓ You&apos;re in this lobby
                        </div>
                    )}

                    {/* Host-only delete */}
                    {user.uid === beacon.hostId && (
                        <button
                            onClick={handleDelete}
                            className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors cursor-pointer"
                        >
                            <Trash2 size={15} />
                            Delete Beacon
                        </button>
                    )}
                </div>

                {/* ── AI Social Assistant ── */}
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent backdrop-blur-xl p-6 mb-6">
                    {/* Decorative glow */}
                    <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />
                    <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-purple-500/15 blur-2xl" />

                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={18} className="text-indigo-400" />
                            <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider">
                                ✨ AI Social Assistant
                            </h3>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{tip}</p>
                    </div>
                </div>

                {/* ── Who's There ── */}
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 mb-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                        Who&apos;s There ({participants.length})
                    </h3>
                    {participants.length === 0 ? (
                        <p className="text-sm text-slate-500">No one yet — be the first!</p>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {participants.map((p) => (
                                <div
                                    key={p.uid}
                                    className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 pl-1 pr-3 py-1 text-xs text-slate-300"
                                >
                                    {p.photoURL ? (
                                        <img
                                            src={p.photoURL}
                                            alt={p.displayName}
                                            referrerPolicy="no-referrer"
                                            className="h-6 w-6 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300">
                                            {p.displayName?.[0] || "?"}
                                        </span>
                                    )}
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                    {p.uid === beacon.hostId
                                        ? `${p.displayName} (Host)`
                                        : p.displayName || "Anonymous"}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Lobby Chat ── */}
                {alreadyJoined && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                            Lobby Chat
                        </h3>

                        {/* Messages */}
                        <div className="max-h-64 overflow-y-auto space-y-3 mb-4 pr-1">
                            {messages.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">
                                    No messages yet — say hi! 👋
                                </p>
                            ) : (
                                messages.map((msg) => {
                                    const isAI = msg.senderId === "AI_SYSTEM";
                                    const isMe = msg.senderId === user.uid;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`rounded-xl px-4 py-2.5 text-sm max-w-[85%] ${isAI
                                                ? "mx-auto bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-indigo-500/15 border border-indigo-500/20 text-indigo-200 italic text-center"
                                                : isMe
                                                    ? "ml-auto bg-indigo-600/30 border border-indigo-500/20 text-indigo-100"
                                                    : "bg-white/5 border border-white/10 text-slate-300"
                                                }`}
                                        >
                                            <span className={`block text-xs font-semibold mb-0.5 ${isAI ? "text-indigo-400" : "text-slate-400"
                                                }`}>
                                                {msg.senderName}
                                            </span>
                                            {msg.text}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={newMsg}
                                onChange={(e) => setNewMsg(e.target.value)}
                                placeholder="Type a message…"
                                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={sendingMsg || !newMsg.trim()}
                                className="flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 text-white transition-colors cursor-pointer"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}
