import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    deleteDoc,
    getDocs,
} from "firebase/firestore";
import { Plus, Radio, BookOpen, Utensils, Gamepad2, Dribbble, ChevronDown, FlaskConical, Code2, Joystick, CalendarDays } from "lucide-react";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import BeaconCard from "../components/BeaconCard";

const categories = [
    { label: "All", value: null, icon: Radio },
    { label: "Study", value: "Study", icon: BookOpen },
    { label: "Food", value: "Food", icon: Utensils },
    { label: "Chill", value: "Chill", icon: Gamepad2 },
    { label: "Sports", value: "Sports", icon: Dribbble },
    { label: "Research", value: "Research", icon: FlaskConical },
    { label: "Coding", value: "Coding", icon: Code2 },
    { label: "Gaming", value: "Gaming", icon: Joystick },
    { label: "Events", value: "Events", icon: CalendarDays },
];

/** Delete a beacon and all its subcollections (chats, participants). */
export async function deleteBeacon(beaconId) {
    // Delete chats subcollection
    const chatsSnap = await getDocs(collection(db, "beacons", beaconId, "chats"));
    await Promise.all(chatsSnap.docs.map((d) => deleteDoc(d.ref)));

    // Delete participants subcollection
    const partsSnap = await getDocs(collection(db, "beacons", beaconId, "participants"));
    await Promise.all(partsSnap.docs.map((d) => deleteDoc(d.ref)));

    // Delete the beacon document
    await deleteDoc(doc(db, "beacons", beaconId));
}

function isExpired(beacon) {
    if (!beacon.expiresAt) return false;
    const exp = beacon.expiresAt.toDate ? beacon.expiresAt.toDate().getTime() : beacon.expiresAt;
    return exp <= Date.now();
}

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [beacons, setBeacons] = useState([]);
    const [filter, setFilter] = useState(null);
    const [beaconsLoading, setBeaconsLoading] = useState(true);
    const [showExpired, setShowExpired] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/", { replace: true });
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (!user) {
            setBeaconsLoading(false);
            return;
        }

        setBeaconsLoading(true);

        const constraints = [
            where("status", "==", "active"),
            orderBy("expiresAt", "asc"),
        ];

        if (filter) {
            constraints.push(where("category", "==", filter));
        }

        const q = query(collection(db, "beacons"), ...constraints);

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const list = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                }));
                setBeacons(list);
                setBeaconsLoading(false);
            },
            (error) => {
                console.error("Firestore snapshot error:", error);
                setBeaconsLoading(false);
            }
        );

        return unsubscribe;
    }, [filter, user]);

    // Show spinner while auth state resolves
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    if (!user) return null; // redirect is in-flight

    // Split beacons into active (future expiry) and expired (past expiry)
    const activeBeacons = beacons.filter((b) => !isExpired(b));
    const expiredBeacons = beacons.filter((b) => isExpired(b));

    async function handleDelete(beaconId) {
        if (!window.confirm("Are you sure you want to delete this beacon? This cannot be undone.")) return;
        try {
            await deleteBeacon(beaconId);
        } catch (err) {
            console.error("Failed to delete beacon:", err);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            <Navbar />

            <main className="mx-auto max-w-5xl px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Live Radar{" "}
                        <span className="inline-block animate-pulse text-indigo-400">
                            📡
                        </span>
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                        See what&apos;s happening on campus right now.
                    </p>
                </div>

                {/* Category filters */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const active = filter === cat.value;
                        return (
                            <button
                                key={cat.label}
                                onClick={() => setFilter(cat.value)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${active
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <Icon size={15} />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* Active Beacons */}
                {beaconsLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    </div>
                ) : activeBeacons.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-500 text-lg">
                            No active beacons right now.
                        </p>
                        <p className="text-slate-600 text-sm mt-1">
                            Be the first — tap the + below!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {activeBeacons.map((b) => (
                            <BeaconCard
                                key={b.id}
                                beacon={b}
                                onDelete={b.hostId === user.uid ? () => handleDelete(b.id) : null}
                            />
                        ))}
                    </div>
                )}

                {/* ── Expired Sessions Accordion ── */}
                {expiredBeacons.length > 0 && (
                    <div className="mt-12">
                        <button
                            onClick={() => setShowExpired((prev) => !prev)}
                            className="flex items-center gap-2 w-full text-left text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer group"
                        >
                            <ChevronDown
                                size={16}
                                className={`transition-transform duration-200 ${showExpired ? "rotate-180" : ""}`}
                            />
                            Previous Sessions ({expiredBeacons.length})
                        </button>

                        {showExpired && (
                            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {expiredBeacons.map((b) => (
                                    <div key={b.id} className="opacity-50">
                                        <BeaconCard
                                            beacon={b}
                                            onDelete={b.hostId === user.uid ? () => handleDelete(b.id) : null}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Floating Action Button */}
            <button
                onClick={() => navigate("/create")}
                className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-110 transition-all cursor-pointer"
                aria-label="Create Beacon"
            >
                <Plus size={28} />
            </button>
        </div>
    );
}
