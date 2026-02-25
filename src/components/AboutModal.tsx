import { useEffect, useRef, useState } from 'react';
import { X, ExternalLink, Activity, Info, Database } from 'lucide-react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
    const [creatorAlpha, setCreatorAlpha] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;

        async function fetchCreatorStats() {
            try {
                const userRes = await fetch('https://api.audius.co/v1/users/QNbNW?app_name=ALPHADIUS');
                const userData = await userRes.json();

                if (!userData.data || userData.data.length === 0) {
                    setCreatorAlpha(0);
                    setLoading(false);
                    return;
                }

                const user = userData.data;
                const userId = user.id;
                const followers = Math.max(user.follower_count, 1);

                const tracksRes = await fetch(`https://api.audius.co/v1/users/${userId}/tracks?app_name=ALPHADIUS&sort_method=plays&limit=1`);
                const tracksData = await tracksRes.json();

                let topTrackPlays = 0;
                if (tracksData.data && tracksData.data.length > 0) {
                    topTrackPlays = tracksData.data[0].play_count || 0;
                }

                topTrackPlays = Math.max(topTrackPlays, 1);

                const engagement = Math.sqrt(topTrackPlays / (followers + 100));
                const velocity = Math.floor(topTrackPlays * 0.05);
                const momentum = Math.log2(velocity + 2);
                const gravity = Math.log10(topTrackPlays + 1);
                const alpha = engagement * momentum * gravity;

                setCreatorAlpha(Math.round(alpha));
            } catch (e) {
                console.error("Failed to fetch creator stats", e);
                setCreatorAlpha(0);
            } finally {
                setLoading(false);
            }
        }

        fetchCreatorStats();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal sheet — slides up from bottom on mobile, centered on desktop */}
            <div
                ref={scrollRef}
                className="relative w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[90vh] bg-[#0A0510] border border-zinc-800 rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
            >
                {/* Glow effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-cyan/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                {/* Sticky header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800/50 relative shrink-0">
                    {/* Mobile drag handle */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-zinc-700 rounded-full sm:hidden" />
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Info className="w-5 h-5 text-fuchsia-400" />
                        About ALPHADIUS
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-1 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 active:bg-white/10"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6 relative text-sm text-zinc-300 font-sans leading-relaxed">
                    <div className="glass-panel p-4 border-white/5 bg-white/5">
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-neon-cyan" />
                            How is Alpha (α) calculated?
                        </h3>
                        <p className="mb-3">
                            ALPHADIUS acts as a predictive A&R terminal designed to detect undervalued artists on the Audius network. It does this by analyzing <strong>social-to-market divergence</strong>.
                        </p>
                        <p className="font-mono text-[11px] sm:text-xs bg-black/50 p-2 sm:p-3 rounded border border-zinc-800 text-zinc-400 mb-3 overflow-x-auto whitespace-nowrap">
                            α = √(Plays / (Followers + 100)) × log₂(Growth + 2) × log₁₀(Plays + 1)
                        </p>
                        <p className="mb-2">
                            A high Alpha Score indicates an artist generating significant traction relative to their audience—highlighting hidden gems before they break.
                        </p>
                        <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">Engagement — streams vs followers</span>
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">Momentum — 24h stream growth</span>
                            <span className="px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-300 border border-zinc-700">Gravity — proven listeners</span>
                        </div>
                    </div>

                    <div className="glass-panel p-4 border-white/5 bg-white/5 text-xs sm:text-sm">
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                            <Database className="w-4 h-4 text-neon-cyan" />
                            Database Scope
                        </h3>
                        <p>
                            Currently, ALPHADIUS monitors a curated matrix of thousands of trending artists. This initial dataset is formed by aggregating metrics from the Audius discovery and underground trending protocols.
                        </p>
                        <p className="mt-2 text-zinc-400 italic">
                            * We are actively scaling our ingestion engine to encompass a significantly broader array of emerging creators in future system updates.
                        </p>
                    </div>

                    <div className="glass-panel p-4 border-fuchsia-500/20 bg-fuchsia-500/5">
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-fuchsia-500" />
                            Creator
                        </h3>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <p className="mb-1">Built with 💜 by <strong>toystore</strong></p>
                                <div className="flex items-center gap-3 mt-2">
                                    <a
                                        href="https://x.com/tysostoystore"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        x.com
                                    </a>
                                    <a
                                        href="https://audius.co/toystore"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-mono text-zinc-400 hover:text-purple-400 flex items-center gap-1 transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        audius.co
                                    </a>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center bg-black/50 border border-zinc-800 rounded-lg p-3 min-w-[100px]">
                                <span className="text-[10px] font-mono text-zinc-500 mb-1 uppercase tracking-widest">Creator α</span>
                                {loading ? (
                                    <span className="text-xl font-bold text-zinc-600 animate-pulse">...</span>
                                ) : (
                                    <span className={`text-xl font-bold font-mono ${creatorAlpha && creatorAlpha > 10 ? 'text-purple-400' : 'text-zinc-300'}`}>
                                        {creatorAlpha}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom padding for safe area on mobile */}
                    <div className="h-2" />
                </div>
            </div>
        </div>
    );
}
