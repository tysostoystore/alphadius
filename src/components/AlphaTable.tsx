import { useState, useEffect, useCallback, lazy, Suspense, useRef } from "react";
import type { AlphaScoreRecord, AlphaAlert } from "../lib/types";
const ConstellationMap = lazy(() => import("./ConstellationMap").then(m => ({ default: m.ConstellationMap })));
const ArtistDetail = lazy(() => import("./ArtistDetail").then(m => ({ default: m.ArtistDetail })));

import { EventFeed } from "./EventFeed";
import { FilterBar } from "./FilterBar";
import { AboutModal } from "./AboutModal";
import {
    TrendingUp,
    TrendingDown,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    Zap,
    List
} from "lucide-react";

interface AlphaFeedResponse {
    data: AlphaScoreRecord[];
    meta: {
        total: number;
        genres: string[];
        alerts: AlphaAlert[];
        timestamp: number;
        lastRefreshed: number;
    };
}

function formatNumber(n: number | null | undefined): string {
    if (n == null) return "—";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toFixed(0);
}

function formatUSD(n: number | null | undefined): string {
    if (n == null) return "—";
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    if (n < 0.01) return `$${n.toFixed(6)}`;
    return `$${n.toFixed(2)}`;
}

function getScoreColor(score: number): string {
    if (score >= 400) return "text-fuchsia-400 drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]";
    if (score >= 100) return "text-purple-400";
    return "text-zinc-500";
}

function getScoreBg(score: number): string {
    if (score >= 400) return "bg-fuchsia-500/10 border-fuchsia-500/30";
    if (score >= 100) return "bg-purple-500/10 border-purple-500/20";
    return "bg-zinc-800/50 border-zinc-700/50";
}

type SortField = "alpha_score" | "market_cap" | "delta_streams" | "delta_streams_pct" | "total_plays" | "follower_count";

export function AlphaTable() {
    const [data, setData] = useState<AlphaScoreRecord[]>([]);
    const [alerts, setAlerts] = useState<AlphaAlert[]>([]);
    const [genres, setGenres] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"table" | "map">("table");
    const observerTarget = useRef<HTMLDivElement>(null);
    const [hasMore, setHasMore] = useState(true);

    // Filters
    const [sort, setSort] = useState<SortField>("alpha_score");
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [genre, setGenre] = useState<string>("");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Detail panel
    const [selectedArtist, setSelectedArtist] = useState<AlphaScoreRecord | null>(null);
    const [isAboutOpen, setIsAboutOpen] = useState(false);

    useEffect(() => {
        const handleOpenAbout = () => setIsAboutOpen(true);
        window.addEventListener('open-about', handleOpenAbout);
        return () => window.removeEventListener('open-about', handleOpenAbout);
    }, []);

    const fetchData = useCallback(async (isAppend = false) => {
        if (isAppend) setLoadingMore(true);
        else setLoading(true);

        try {
            const currentOffset = isAppend ? data.length : 0;
            const limit = isAppend ? 100 : 50; // Load tiny initial dataset (mobile bottleneck fix)

            const params = new URLSearchParams({
                sort,
                order,
                limit: limit.toString(),
                offset: currentOffset.toString(),
            });
            if (genre) params.set("genre", genre);
            if (debouncedSearch) params.set("search", debouncedSearch);

            const res = await fetch(`/api/alpha-feed?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json: AlphaFeedResponse = await res.json();

            setData(prev => isAppend ? [...prev, ...json.data] : json.data);
            if (!isAppend) {
                setAlerts(json.meta.alerts);
            }
            setGenres(json.meta.genres);
            setHasMore(json.data.length >= limit);
            if (!isAppend && json.meta.lastRefreshed) {
                // Push stats to Astro header via window event
                window.dispatchEvent(new CustomEvent('alpha-stats', {
                    detail: {
                        count: json.meta.total,
                        lastRefreshed: json.meta.lastRefreshed,
                    }
                }));
            }
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [sort, order, genre, debouncedSearch, data.length]);

    // Used exclusively by the Map view when the user drags the Render Limit slider
    const forceFetchToCount = useCallback(async (targetCount: number) => {
        if (targetCount <= data.length || loadingMore || loading) return;
        setLoadingMore(true);
        try {
            const missing = targetCount - data.length;
            const params = new URLSearchParams({
                sort,
                order,
                limit: missing.toString(),
                offset: data.length.toString(),
            });
            if (genre) params.set("genre", genre);
            if (debouncedSearch) params.set("search", debouncedSearch);

            const res = await fetch(`/api/alpha-feed?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json: AlphaFeedResponse = await res.json();

            setData(prev => [...prev, ...json.data]);
            setHasMore(json.data.length >= missing);
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoadingMore(false);
        }
    }, [sort, order, genre, debouncedSearch, data.length, loading, loadingMore]);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                const first = entries[0];
                if (first?.isIntersecting && hasMore && !loading && !loadingMore && data.length > 0) {
                    fetchData(true);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [fetchData, hasMore, loading, loadingMore, data.length]);

    useEffect(() => {
        fetchData(false);
    }, [sort, order, genre, debouncedSearch]);

    const toggleSort = (field: SortField) => {
        if (sort === field) {
            setOrder(order === "desc" ? "asc" : "desc");
        } else {
            setSort(field);
            setOrder("desc");
        }
    };

    const handleViewModeChange = (mode: "table" | "map") => {
        setViewMode(mode);
        if (mode === "map") {
            // Force Recharts to remeasure its container after flex transition
            setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
            setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
        }
    };

    const SortIcon = useCallback(({ field }: { field: SortField }) => {
        if (sort !== field)
            return <ArrowUpDown className="w-3 h-3 text-terminal-muted" />;
        return order === "desc" ? (
            <ChevronDown className="w-3 h-3 text-neon-cyan" />
        ) : (
            <ChevronUp className="w-3 h-3 text-neon-cyan" />
        );
    }, [sort, order]);

    // Server-side filtering, so no client-side slice needed for 'filteredData'
    const displayData = data;

    // Scroll-to-top visibility
    const [showScrollTop, setShowScrollTop] = useState(false);
    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="flex flex-col lg:flex-row gap-4 pb-6 lg:pb-32">
            {/* Main content */}
            <div className={`min-w-0 ${viewMode === 'map' ? 'flex-[3]' : 'flex-[2] lg:flex-1'}`}>
                {/* Mobile-only: Live Pulse shown at top for small screens */}
                <div className="block lg:hidden mb-4">
                    <EventFeed
                        alerts={alerts}
                        onArtistClick={(id) => {
                            const artist = data.find(a => a.audiusUserId === id);
                            if (artist) setSelectedArtist(artist);
                        }}
                    />
                </div>
                {/* Sticky filter bar + view toggle */}
                <div className="sticky top-[49px] sm:top-[57px] z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-[#0A0510]/90 backdrop-blur-xl border-b border-white/5">
                    <div className="flex flex-row items-center justify-between gap-1.5 sm:gap-4 w-full">
                        <div className="flex-1 min-w-0">
                            <FilterBar
                                genres={genres}
                                selectedGenre={genre}
                                onGenreChange={setGenre}
                                searchValue={search}
                                onSearchChange={setSearch}
                                onRefresh={() => fetchData(false)}
                                loading={loading}
                            />
                        </div>
                        <div className="flex items-center gap-0.5 bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800/60 shrink-0">
                            <button
                                onClick={() => handleViewModeChange("table")}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-mono font-semibold transition-all duration-200 ${viewMode === "table"
                                    ? "bg-zinc-800 text-zinc-100"
                                    : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                            >
                                <List className="w-3 h-3" /> <span className="hidden sm:inline">Table</span>
                            </button>
                            <div className="relative">
                                {viewMode !== "map" && (
                                    <div className="absolute -inset-0.5 rounded-lg bg-purple-500/20 animate-pulse blur-sm pointer-events-none" />
                                )}
                                <button
                                    onClick={() => handleViewModeChange("map")}
                                    className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-mono font-semibold transition-all duration-200 ${viewMode === "map"
                                        ? "bg-gradient-to-r from-purple-600/30 to-fuchsia-600/30 text-purple-100 border border-purple-500/50"
                                        : "text-purple-300 hover:text-purple-200 border border-purple-500/30"
                                        }`}
                                >
                                    <span className="text-xs">✦</span> <span className="hidden sm:inline">{viewMode === "map" ? "Stars" : "Explore"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {viewMode === "map" ? (
                    <div className="flex flex-col gap-4">
                        <Suspense fallback={
                            <div className="w-full h-[400px] sm:h-[700px] glass-panel flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                                    <p className="text-sm font-mono text-terminal-muted">Aligning stars...</p>
                                </div>
                            </div>
                        }>
                            <ConstellationMap
                                data={displayData}
                                onArtistClick={(artist) => setSelectedArtist(artist)}
                                onArtistHover={() => { }}
                                genres={genres}
                                selectedGenre={genre}
                                onGenreChange={setGenre}
                                onRequireMoreData={forceFetchToCount}
                                isLoadingMore={loadingMore}
                            />
                        </Suspense>

                        {/* Infinite Scroll trigger for map */}
                        <div ref={observerTarget} className="h-20 w-full flex justify-center items-center py-8">
                            {loadingMore && (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                                    <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">Scanning deeper...</p>
                                </div>
                            )}
                            {!hasMore && data.length > 0 && (
                                <p className="text-[10px] font-mono text-terminal-muted opacity-50 uppercase tracking-widest">End of Discovery Constellation</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="glass-panel border border-zinc-800/50 shadow-2xl">
                        {error && (
                            <div className="p-4 bg-neon-magenta/10 border-b border-neon-magenta/20">
                                <p className="text-sm text-neon-magenta font-mono">⚠ Error: {error}</p>
                            </div>
                        )}

                        <table className="w-full table-fixed sm:table-auto">
                            <thead className="sticky top-[89px] sm:top-[97px] z-20">
                                <tr className="bg-[#0A0510] border-b border-zinc-800">
                                    <th className="text-left px-1 sm:px-3 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-tighter w-[5%] sm:w-12">#</th>
                                    <th className="text-left px-1 sm:px-3 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-tighter w-[33%] sm:w-[200px]">Artist</th>
                                    <th className="hidden lg:table-cell text-left px-4 py-2.5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest w-auto">Track</th>
                                    <th className="text-right px-1 sm:px-4 py-2 text-[8px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-tighter w-[14%] sm:w-auto">
                                        <div className="flex flex-col items-end gap-0.5">
                                            <span className="text-[7px] text-zinc-600 font-mono uppercase tracking-widest hidden sm:block">streams</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => toggleSort("total_plays")}
                                                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border transition-colors ${sort === "total_plays"
                                                        ? "bg-neon-cyan/10 border-neon-cyan/40 text-neon-cyan"
                                                        : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                                                        }`}
                                                    title="Sort by total plays"
                                                >
                                                    TOT <SortIcon field="total_plays" />
                                                </button>
                                                <button
                                                    onClick={() => toggleSort("delta_streams_pct")}
                                                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border transition-colors ${sort === "delta_streams_pct" || sort === "delta_streams"
                                                        ? "bg-neon-green/10 border-neon-green/40 text-neon-green"
                                                        : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                                                        }`}
                                                    title="Sort by stream growth %"
                                                >
                                                    +% <SortIcon field="delta_streams_pct" />
                                                </button>
                                            </div>
                                        </div>
                                    </th>
                                    <th className="text-right px-1 sm:px-4 py-2 text-[8px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-tighter cursor-pointer hover:text-neon-cyan transition-colors w-[12%] sm:w-auto" onClick={() => toggleSort("follower_count")}>
                                        <span className="inline-flex items-center gap-0.5 sm:gap-1"><span className="hidden sm:inline">Followers</span><span className="sm:hidden">Fol</span> <SortIcon field="follower_count" /></span>
                                    </th>
                                    <th className="text-right px-1 sm:px-4 py-2 text-[8px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-tighter cursor-pointer hover:text-neon-cyan transition-colors w-[12%] sm:w-auto" onClick={() => toggleSort("market_cap")}>
                                        <span className="inline-flex items-center gap-0.5 sm:gap-1"><span className="hidden sm:inline">MC</span><span className="sm:hidden">MC</span> <SortIcon field="market_cap" /></span>
                                    </th>
                                    <th className="text-right px-1 sm:px-3 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-tighter cursor-pointer hover:text-neon-cyan transition-colors w-[12%] sm:w-auto" onClick={() => toggleSort("alpha_score")}>
                                        <span className="inline-flex items-center gap-0.5 sm:gap-1"><span className="hidden sm:inline"><Zap className="w-3 h-3" /> Alpha</span><span className="sm:hidden"><Zap className="w-2.5 h-2.5" /></span> <SortIcon field="alpha_score" /></span>
                                    </th>
                                    <th className="text-center px-1 sm:px-3 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-tighter w-[12%] sm:w-auto">Act</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-20">
                                            <div className="inline-flex items-center gap-3 text-zinc-500 font-mono text-sm">
                                                <div className="w-4 h-4 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
                                                Decrypting social signals...
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    displayData.map((artist, idx) => (
                                        <tr key={artist.audiusUserId} className="table-row-hover border-b border-zinc-800/30 group" onClick={() => setSelectedArtist(artist)}>
                                            <td className="px-3 py-3 font-mono text-[10px] text-zinc-600">{idx + 1}</td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="relative shrink-0 flex items-center justify-center">
                                                        {artist.alphaScore >= 400 && (
                                                            <>
                                                                <div className="absolute -inset-1 rounded-full animate-[spin_2s_linear_infinite] blur-[3px] opacity-70 z-0 pointer-events-none" style={{ background: 'conic-gradient(from 0deg, #d946ef, #8b5cf6, #d946ef)' }} title="Top Alpha Score (α ≥ 400)" />
                                                                <div className="absolute -inset-[2px] rounded-full animate-[spin_3s_linear_infinite_reverse] opacity-100 z-0 pointer-events-none" style={{ background: 'conic-gradient(from 0deg, transparent 0%, #d946ef 25%, transparent 50%, #8b5cf6 75%, transparent 100%)' }} />
                                                            </>
                                                        )}
                                                        {artist.profilePicture ? (
                                                            <img
                                                                src={artist.profilePicture}
                                                                alt={artist.name}
                                                                loading="lazy"
                                                                decoding="async"
                                                                className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0A0510] object-cover ring-2 ring-[#0A0510]"
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
                                                        <div className={`avatar-placeholder relative z-10 ${artist.profilePicture ? 'hidden' : ''} w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-800 ring-2 ring-[#0A0510] flex items-center justify-center text-[10px] font-bold text-zinc-500`}>
                                                            {artist.name.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[11px] sm:text-sm font-medium text-zinc-100 truncate group-hover:text-neon-cyan transition-colors w-full">{artist.name}</p>
                                                        <p className="text-[9px] sm:text-[10px] text-zinc-500 font-mono truncate opacity-70 w-full">@{artist.handle}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden lg:table-cell px-4 py-3 text-sm text-zinc-400 truncate max-w-[180px] font-mono">{artist.topTrackTitle}</td>
                                            <td className="px-1 sm:px-4 py-2 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[9px] sm:text-sm font-bold text-zinc-200 font-mono italic">{formatNumber(artist.totalPlays)}</span>
                                                    <span className={`inline-flex items-center gap-0.5 sm:gap-1 text-[7px] sm:text-[10px] font-mono ${artist.deltaStreamsPercent > 0 ? "text-neon-green" : artist.deltaStreamsPercent < 0 ? "text-neon-magenta" : "text-zinc-500"}`}>
                                                        {artist.deltaStreamsPercent > 0 ? <TrendingUp className="hidden sm:block w-2.5 h-2.5" /> : artist.deltaStreamsPercent < 0 ? <TrendingDown className="hidden sm:block w-2.5 h-2.5" /> : null}
                                                        {artist.deltaStreamsPercent > 0 ? "+" : ""}{artist.deltaStreamsPercent.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-1 sm:px-4 py-2 text-right font-mono text-[9px] sm:text-sm text-zinc-300">{formatNumber(artist.followerCount)}</td>
                                            <td className="px-1 sm:px-4 py-2 text-right font-mono text-[9px] sm:text-sm text-zinc-300">{formatUSD(artist.marketCap)}</td>
                                            <td className="px-1 sm:px-3 py-2 text-right">
                                                <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-0.5 rounded-full font-mono text-[8px] sm:text-xs font-bold border ${getScoreBg(artist.alphaScore)} ${getScoreColor(artist.alphaScore)}`}>
                                                    <span className="hidden sm:inline"><Zap className="w-2.5 h-2.5" /></span> {artist.alphaScore.toFixed(0)}
                                                </span>
                                            </td>
                                            <td className="px-1 sm:px-3 py-2 text-center">
                                                {artist.tokenAddress ? (
                                                    <a href={`https://jup.ag/swap/SOL-${artist.tokenAddress}`} target="_blank" rel="noopener noreferrer" className="btn-buy inline-flex items-center gap-1 py-1 px-2 text-[10px]" onClick={(e) => e.stopPropagation()}>BUY</a>
                                                ) : (
                                                    <a
                                                        href={artist.topTrackId
                                                            ? `https://audius.co/${artist.handle}/${artist.topTrackId}`
                                                            : `https://audius.co/${artist.handle}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-bold rounded bg-neon-cyan/5 border border-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/20 transition-all shrink-0"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >PLAY</a>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Infinite Scroll trigger for table */}
                        <div ref={observerTarget} className="h-24 w-full flex justify-center items-center py-12 border-t border-zinc-800/10">
                            {loadingMore && (
                                <div className="flex items-center gap-3 text-zinc-500 font-mono text-sm">
                                    <div className="w-5 h-5 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
                                    Fetching deeper signals...
                                </div>
                            )}
                            {!hasMore && data.length > 0 && (
                                <div className="flex flex-col items-center gap-1 opacity-40">
                                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">End of Transmission</p>
                                    <div className="w-24 h-[1px] bg-zinc-800 mt-2" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar — hidden on mobile (Live Pulse shown at top instead) */}
            <div className={`hidden lg:flex flex-shrink-0 ${viewMode === 'map' ? 'w-full lg:w-64' : 'w-full lg:w-80'}`}>
                <div className="sticky top-6 w-full">
                    <EventFeed
                        alerts={alerts}
                        onArtistClick={(id) => {
                            const artist = data.find(a => a.audiusUserId === id);
                            if (artist) setSelectedArtist(artist);
                        }}
                    />
                </div>
            </div>

            {/* Artist Detail Overlay */}
            {
                selectedArtist && (
                    <Suspense fallback={null}>
                        <ArtistDetail
                            artist={selectedArtist}
                            onClose={() => setSelectedArtist(null)}
                        />
                    </Suspense>
                )
            }

            {/* About Modal */}
            <AboutModal
                isOpen={isAboutOpen}
                onClose={() => setIsAboutOpen(false)}
            />

            {/* Scroll to top — liquid glass */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full 
                    bg-white/5 backdrop-blur-xl border border-white/10 
                    shadow-[0_4px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]
                    flex items-center justify-center
                    text-zinc-400 hover:text-white hover:bg-white/10 hover:border-purple-500/30
                    hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]
                    transition-all duration-300
                    ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                aria-label="Scroll to top"
            >
                <ChevronUp className="w-4 h-4" />
            </button>
        </div >
    );
}
