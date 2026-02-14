import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    BookOpen,
    Utensils,
    Gamepad2,
    Dribbble,
    FlaskConical,
    Code2,
    Joystick,
    CalendarDays,
    MapPin,
    Users,
    Clock,
    ArrowRight,
    Trash2,
} from "lucide-react";

const categoryMeta = {
    Study: { icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    Food: { icon: Utensils, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    Chill: { icon: Gamepad2, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    Sports: { icon: Dribbble, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    Research: { icon: FlaskConical, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    Coding: { icon: Code2, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
    Gaming: { icon: Joystick, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20" },
    Events: { icon: CalendarDays, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
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

export default function BeaconCard({ beacon, onDelete }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const meta = categoryMeta[beacon.category] || categoryMeta.Study;
    const CategoryIcon = meta.icon;
    const spots =
        beacon.maxParticipants - (beacon.currentParticipants?.length || 0);
    const alreadyJoined = user && beacon.currentParticipants?.includes(user.uid);

    return (
        <div
            className={`group relative rounded-2xl border ${meta.border} ${meta.bg} bg-opacity-50 backdrop-blur-sm p-5 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/5`}
        >
            {/* Category badge + Timer */}
            <div className="flex items-center justify-between mb-3">
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.color} ${meta.bg}`}
                >
                    <CategoryIcon size={13} />
                    {beacon.category}
                </span>

                <div className="flex items-center gap-2">
                    {beacon.expiresAt && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <Clock size={12} />
                            {timeLeft(beacon.expiresAt)}
                        </span>
                    )}

                    {/* Host-only delete button */}
                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="inline-flex items-center justify-center rounded-lg p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete Beacon"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Activity */}
            <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                {beacon.activity}
            </h3>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mb-4">
                <span className="inline-flex items-center gap-1">
                    <MapPin size={14} className="text-slate-500" />
                    {beacon.location}
                </span>
                <span className="inline-flex items-center gap-1">
                    <Users size={14} className="text-slate-500" />
                    {spots > 0 ? `${spots} spot${spots !== 1 ? "s" : ""} left` : "Full"}
                </span>
            </div>

            {/* Host + Join */}
            <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                    by <span className="text-slate-400">{beacon.hostName}</span>
                </span>

                <button
                    disabled={!alreadyJoined && spots <= 0}
                    onClick={() => navigate(`/beacon/${beacon.id}`)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-sm font-semibold text-white transition-colors cursor-pointer"
                >
                    {alreadyJoined ? "Open" : "Join"}
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}
