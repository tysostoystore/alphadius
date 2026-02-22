import { useState, useEffect } from "react";
import { Radio, Flame, TrendingUp, Zap, Info, DollarSign } from "lucide-react";
import type { AlphaAlert } from "../lib/types";

interface EventFeedProps {
    alerts: AlphaAlert[];
    onArtistClick?: (artistId: string) => void;
}

const DEMO_ALERTS: AlphaAlert[] = [
    { type: "info", message: "🔥 Scanning Audius for alpha...", timestamp: Date.now() },
    { type: "info", message: "📡 Monitoring trending tracks", timestamp: Date.now() },
    { type: "gem", message: "💎 Looking for undervalued gems", timestamp: Date.now() },
    { type: "velocity", message: "⚡ Run 'bun run scripts/ingest.ts' to populate data", timestamp: Date.now() },
];

export function EventFeed({ alerts, onArtistClick }: EventFeedProps) {
    const [visibleAlerts, setVisibleAlerts] = useState<AlphaAlert[]>([]);
    const displayAlerts = alerts.length > 0 ? alerts : DEMO_ALERTS;

    useEffect(() => {
        // Reset and animate alerts appearing one by one
        setVisibleAlerts([]);
        const timers: NodeJS.Timeout[] = [];
        displayAlerts.forEach((alert, index) => {
            const timer = setTimeout(() => {
                setVisibleAlerts((prev) => [...prev, alert]);
            }, index * 400); // Faster animation
            timers.push(timer);
        });

        return () => timers.forEach(clearTimeout);
    }, [alerts]);

    const getAlertIcon = (type: AlphaAlert["type"]) => {
        switch (type) {
            case "gem": return <Flame className="w-3.5 h-3.5 text-orange-400" />;
            case "velocity": return <TrendingUp className="w-3.5 h-3.5 text-neon-green" />;
            case "opportunity": return <DollarSign className="w-3.5 h-3.5 text-neon-yellow" />;
            default: return <Info className="w-3.5 h-3.5 text-blue-400" />;
        }
    };

    return (
        <div className="glass-panel p-4 sticky top-20 border border-zinc-800/50 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-neon-magenta animate-pulse" />
                    <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-bold">
                        Live Pulse
                    </h3>
                </div>
                <div className="flex items-center gap-1.5 bg-neon-green/10 px-2 py-0.5 rounded border border-neon-green/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                    <span className="text-[9px] font-mono text-neon-green font-bold">
                        ACTIVE
                    </span>
                </div>
            </div>

            {/* Events */}
            <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1 custom-scrollbar">
                {visibleAlerts.map((alert, idx) => (
                    <div
                        key={idx}
                        onClick={() => alert.artistId && onArtistClick?.(alert.artistId)}
                        className={`group animate-slide-in p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 transition-all duration-300 ${alert.artistId ? 'cursor-pointer hover:bg-zinc-800/50' : ''}`}
                    >
                        <div className="flex gap-3">
                            {alert.profilePicture ? (
                                <img
                                    src={alert.profilePicture}
                                    className="w-8 h-8 rounded-full border border-zinc-800 group-hover:border-neon-cyan/50 transition-colors object-cover"
                                    alt=""
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        const mirrors = [
                                            'https://audius-creator-10.theblueprint.xyz/content',
                                            'https://creatornode2.audius.co/content',
                                            'https://audius-content-5.cultur3stake.com/content',
                                        ];
                                        const attempt = parseInt(target.dataset.retry || '0');
                                        if (attempt < mirrors.length && target.src.includes('/content/')) {
                                            target.dataset.retry = String(attempt + 1);
                                            target.src = target.src.replace(/https:\/\/[^/]+\/content/, mirrors[attempt]!);
                                        } else {
                                            target.style.display = 'none';
                                            target.parentElement?.querySelector('.avatar-placeholder')?.classList.remove('hidden');
                                        }
                                    }}
                                />
                            ) : null}
                            <div className={`avatar-placeholder ${alert.profilePicture ? 'hidden' : ''} w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0`}>
                                {getAlertIcon(alert.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] text-zinc-300 leading-snug font-mono">
                                    {alert.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[9px] text-zinc-500 font-mono">
                                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {alert.artistId && (
                                        <span className="text-[9px] text-neon-cyan font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                            VIEW DETAILS <Zap className="w-2 h-2" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {visibleAlerts.length === 0 && (
                    <div className="text-center py-12">
                        <Radio className="w-8 h-8 text-zinc-800 mx-auto mb-2 animate-pulse" />
                        <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                            Listening for signals...
                        </p>
                    </div>
                )}
            </div>

            {/* Decoration */}
            <div className="mt-4 pt-3 text-[9px] font-mono text-zinc-600 border-t border-zinc-800/50 flex justify-between">
                <span>TERMINAL_ID: AUDIUS_A1</span>
                <span>V1.2.0</span>
            </div>
        </div>
    );
}
