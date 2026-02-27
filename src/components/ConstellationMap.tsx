import { useMemo, useState, useEffect, useCallback, memo } from "react";
import type { AlphaScoreRecord } from "../lib/types";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from "recharts";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Zap, Maximize2, Minimize2, SlidersHorizontal } from "lucide-react";

export interface ConstellationMapProps {
    data: AlphaScoreRecord[];
    onArtistClick: (artist: AlphaScoreRecord) => void;
    onArtistHover?: (artist: AlphaScoreRecord | null) => void;
    genres?: string[];
    selectedGenre?: string;
    onGenreChange?: (genre: string) => void;
    onRequireMoreData?: (targetCount: number) => void;
    isLoadingMore?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const artist = payload[0].payload as AlphaScoreRecord;
        return (
            <div className="glass-panel p-3 border-purple-500/30 bg-[#1A1A1F]/95 max-w-[250px]">
                <div className="flex items-center gap-2 mb-2">
                    {artist.profilePicture ? (
                        <div className="relative">
                            <img
                                src={artist.profilePicture}
                                alt={artist.name}
                                className="w-8 h-8 rounded-full border border-purple-500/50"
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
                            <div className="avatar-placeholder hidden w-8 h-8 rounded-full bg-zinc-800 border border-purple-500/50 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                {artist.name.charAt(0)}
                            </div>
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-purple-500/50 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                            {artist.name.charAt(0)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="font-bold text-zinc-100 truncate text-sm">{artist.name}</p>
                        <p className="text-xs text-zinc-500 font-mono">@{artist.handle}</p>
                    </div>
                </div>

                <div className="space-y-1 mt-2 border-t border-zinc-800 pt-2">
                    <p className="text-xs text-zinc-400 font-mono flex justify-between">
                        <span>Followers:</span>
                        <span className="text-zinc-200">{(artist.followerCount / 1000).toFixed(1)}k</span>
                    </p>
                    <p className="text-xs text-zinc-400 font-mono flex justify-between">
                        <span>24h Grow:</span>
                        <span className={`${artist.deltaStreams24h > 0 ? 'text-neon-green' : 'text-zinc-500'}`}>
                            {artist.deltaStreams24h > 0 ? `+${artist.deltaStreams24h.toLocaleString()} streams` : 'No 24h data'}
                        </span>
                    </p>
                    <p className="text-xs text-zinc-400 font-mono flex justify-between items-center mt-1">
                        <span>Alpha:</span>
                        <span className="text-fuchsia-400 font-bold flex items-center gap-1">
                            <Zap className="w-3 h-3" /> {artist.alphaScore.toFixed(1)}
                        </span>
                    </p>
                </div>
                <div className="mt-2 text-[10px] text-zinc-500 text-center uppercase tracking-widest border-t border-zinc-800 pt-2">
                    Click to Play Track
                </div>
            </div>
        );
    }
    return null;
};

export const ConstellationMap = memo(function ConstellationMap({ data, onArtistClick, onArtistHover, genres, selectedGenre, onGenreChange, onRequireMoreData, isLoadingMore }: ConstellationMapProps) {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [limit, setLimit] = useState(500);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Trigger data fetch if slider exceeds currently loaded data
    useEffect(() => {
        if (limit > data.length && onRequireMoreData && !isLoadingMore) {
            onRequireMoreData(limit);
        }
    }, [limit, data.length, onRequireMoreData, isLoadingMore]);

    // ESC to exit fullscreen
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsFullscreen(false);
    }, []);

    // Force Recharts to measure container properly on initial mount 
    useEffect(() => {
        const timer = setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isFullscreen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isFullscreen, handleKeyDown]);

    const chartData = useMemo(() => {
        const filtered = data
            .filter(d => d.followerCount > 0 && d.totalPlays > 100)
            .map(d => ({
                ...d,
                // X = total plays: more streams → further right
                x: Math.max(1, d.totalPlays),
                // Y = undervaluation ratio (plays / followers+100)
                // top-right = many plays + still undervalued = MAXIMUM ALPHA
                y: Math.max(0.5, d.totalPlays / (d.followerCount + 100)),
                z: Math.max(1, d.alphaScore)
            }));

        return filtered.slice(0, limit);
    }, [data, limit]);

    const handleMouseEnter = (node: any) => {
        setHoveredNode(node.audiusUserId);
        if (onArtistHover) onArtistHover(node);
    };

    const handleMouseLeave = () => {
        setHoveredNode(null);
        if (onArtistHover) onArtistHover(null);
    };

    const containerClass = isFullscreen
        ? "fixed inset-0 z-50 bg-[#0A0510] map-container-fullscreen"
        : "w-full h-[400px] sm:h-[calc(100vh-180px)] glass-panel relative overflow-hidden group map-container-snapped";

    return (
        <div className={containerClass}>
            {/* Background stars */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at center, #A855F7 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Top-left overlay: Title + controls */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 pr-4 pointer-events-none">
                <h3 className="text-[10px] sm:text-sm font-bold text-zinc-200 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fuchsia-500" />
                    Discovery Constellation
                </h3>
                <p className="text-[9px] sm:text-xs text-zinc-500 font-mono mt-0.5 sm:mt-1 leading-tight">
                    X=Stream Count | Y=Undervaluation (Plays/Follower Ratio) | Size=Alpha
                </p>
                <div className="mt-3 pointer-events-auto flex flex-col gap-1.5 w-[180px] sm:w-[220px]">
                    {/* Genre selector in fullscreen */}
                    {isFullscreen && genres && onGenreChange && (
                        <div className="relative">
                            <SlidersHorizontal className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                            <select
                                value={selectedGenre || ''}
                                onChange={(e) => onGenreChange(e.target.value)}
                                className="w-full pl-6 pr-6 py-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg text-[10px] font-mono text-zinc-200 focus:outline-none focus:border-purple-500/40 appearance-none cursor-pointer transition-all"
                            >
                                <option value="">All Genres</option>
                                {genres.map((g) => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none opacity-40">▼</div>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-zinc-400 font-medium">
                        <span>Render Limit: <span className="text-zinc-200">{limit}</span></span>
                        <span>Total: {data.length}</span>
                    </div>
                    <input
                        type="range"
                        min="50"
                        max="10000"
                        step="50"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="w-full accent-purple-500 h-1 sm:h-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-lg appearance-none cursor-pointer backdrop-blur transition-all"
                        title="Adjust number of rendered stars"
                    />
                    {limit > 500 && (
                        <span className="text-[8px] sm:text-[9px] text-neon-magenta mt-1 opacity-80 animate-pulse hidden sm:block">
                            ⚠ High limits may cause rendering lag
                        </span>
                    )}
                </div>
            </div>

            {/* Fullscreen toggle — liquid glass */}
            <button
                onClick={() => setIsFullscreen(prev => !prev)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10
                    w-8 h-8 sm:w-9 sm:h-9 rounded-lg
                    bg-white/5 backdrop-blur-xl border border-white/10
                    shadow-[0_4px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]
                    flex items-center justify-center
                    text-zinc-400 hover:text-white hover:bg-white/10 hover:border-purple-500/30
                    hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]
                    transition-all duration-300"
                title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
            >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* ESC hint in fullscreen */}
            {isFullscreen && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 
                    px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10
                    text-[10px] font-mono text-zinc-500 pointer-events-none">
                    Press <span className="text-zinc-300 font-bold">ESC</span> to exit fullscreen
                </div>
            )}

            <TransformWrapper
                disabled={!isFullscreen}
                initialScale={1}
                minScale={1}
                maxScale={5}
                centerZoomedOut={true}
                wheel={{ step: 0.1 }}
                pinch={{ step: 5 }}
                doubleClick={{ disabled: true }}
                panning={{ disabled: !isFullscreen }}
            >
                <div className="w-full h-full flex-1 [&_.react-transform-wrapper]:w-full [&_.react-transform-wrapper]:h-full [&_.react-transform-component]:w-full [&_.react-transform-component]:h-full">
                    <TransformComponent wrapperClass="w-full h-full transition-none" contentClass="w-full h-full transition-none" wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%" }}>
                        {/* width 99.9% avoids Recharts integer resize loop bug that causes it to collapse */}
                        <ResponsiveContainer width="99.9%" height="100%" key={isFullscreen ? "full" : "normal"}>
                            <ScatterChart margin={{ top: 50, right: 10, bottom: isFullscreen ? 30 : 10, left: 10 }}>
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    name="Followers"
                                    scale="log"
                                    domain={['auto', 'auto']}
                                    tick={{ fill: '#52525b', fontSize: 10, fontFamily: 'monospace' }}
                                    tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : Number(v).toFixed(0)}
                                    axisLine={{ stroke: '#27272a' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="y"
                                    name="24h Stream Growth"
                                    scale="log"
                                    domain={['auto', 'auto']}
                                    tick={{ fill: '#52525b', fontSize: 10, fontFamily: 'monospace' }}
                                    tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : Number(v).toFixed(0)}
                                    axisLine={{ stroke: '#27272a' }}
                                    tickLine={false}
                                />
                                <ZAxis
                                    type="number"
                                    dataKey="z"
                                    range={[20, 600]}
                                    name="Alpha Score"
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ strokeDasharray: '3 3', stroke: '#52525b' }}
                                />
                                <Scatter
                                    data={chartData}
                                    onClick={(node) => onArtistClick(node as AlphaScoreRecord)}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                    animationDuration={isFullscreen ? 1000 : 0}
                                    isAnimationActive={true}
                                >
                                    {chartData.map((entry, index) => {
                                        const isHighAlpha = index <= 10;
                                        const isMidAlpha = index > 10 && index <= 50;
                                        const isHovered = hoveredNode === entry.audiusUserId;

                                        let fill = "#52525b";
                                        let stroke = "transparent";
                                        let opacity = isHovered ? 1 : 0.4;

                                        if (isHighAlpha) {
                                            fill = "#d946ef";
                                            stroke = "#fdf4ff";
                                            opacity = isHovered ? 1 : 0.8;
                                        } else if (isMidAlpha) {
                                            fill = "#a855f7";
                                            opacity = isHovered ? 1 : 0.6;
                                        }

                                        return (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={fill}
                                                stroke={stroke}
                                                strokeWidth={isHovered ? 2 : 0}
                                                style={{
                                                    transition: 'all 0.3s ease',
                                                    filter: isHighAlpha ? 'drop-shadow(0 0 8px rgba(217,70,239,0.8))' : 'none',
                                                    cursor: 'pointer'
                                                }}
                                                opacity={opacity}
                                            />
                                        );
                                    })}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </TransformComponent>
                </div>
            </TransformWrapper>
        </div>
    );
});
