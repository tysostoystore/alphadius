import type { AlphaScoreRecord } from "../lib/types";
import {
    X,
    Users,
    Headphones,
    TrendingUp,
    DollarSign,
    BarChart3,
    ExternalLink,
    Zap,
    Copy,
} from "lucide-react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";

interface ArtistDetailProps {
    artist: AlphaScoreRecord;
    onClose: () => void;
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
    if (n < 0.01 && n > 0) return `$${n.toFixed(6)}`;
    return `$${n.toFixed(2)}`;
}

// Real chart data will come from historical snapshots in the future
function generateChartData(artist: AlphaScoreRecord) {
    if (!artist.tokenAddress) return [];

    // Plot current data point
    return [
        {
            day: "Today",
            streams: artist.totalPlays,
            price: artist.tokenPrice || 0,
        }
    ];
}

export function ArtistDetail({ artist, onClose }: ArtistDetailProps) {
    const chartData = generateChartData(artist);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-lg z-50 animate-slide-in">
                <div className="h-full glass-panel-strong border-l border-terminal-border overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-terminal-surface/95 backdrop-blur-sm border-b border-terminal-border p-4 sm:p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                {artist.profilePicture ? (
                                    <div className="relative">
                                        <img
                                            src={artist.profilePicture}
                                            alt={artist.name}
                                            className="w-14 h-14 rounded-full ring-2 ring-neon-cyan/30 object-cover"
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
                                        <div className="avatar-placeholder hidden w-14 h-14 rounded-full bg-terminal-bg ring-2 ring-neon-cyan/30 flex items-center justify-center text-xl font-bold text-neon-cyan">
                                            {artist.name.charAt(0)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-terminal-bg ring-2 ring-neon-cyan/30 flex items-center justify-center text-xl font-bold text-neon-cyan">
                                        {artist.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-lg font-semibold text-zinc-100">
                                        {artist.name}
                                    </h2>
                                    <p className="text-sm text-terminal-muted font-mono">
                                        @{artist.handle}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="text-xs px-2 py-0.5 rounded bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                                            {artist.topTrackGenre}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-terminal-bg transition-colors"
                            >
                                <X className="w-5 h-5 text-terminal-muted" />
                            </button>
                        </div>
                        {/* Action Buttons — always visible in sticky header */}
                        <div className="flex gap-2 mt-3">
                            <a
                                href={`https://audius.co/${artist.handle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary flex-1 text-center inline-flex items-center justify-center gap-2 !py-1.5 !text-xs"
                            >
                                <Headphones className="w-3.5 h-3.5" />
                                Listen on Audius
                            </a>
                            {artist.tokenAddress && (
                                <a
                                    href={`https://jup.ag/swap/SOL-${artist.tokenAddress}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-buy flex-1 text-center inline-flex items-center justify-center gap-2 !py-1.5 !text-xs"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Buy on Jupiter
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Alpha Score Hero */}
                        <div className="glass-panel p-4 neon-glow-cyan text-center">
                            <p className="text-xs font-mono text-terminal-muted uppercase tracking-wider mb-1">
                                Alpha Score
                            </p>
                            <p className="text-3xl font-mono font-bold text-neon-cyan flex items-center justify-center gap-2">
                                <Zap className="w-6 h-6" />
                                {artist.alphaScore.toFixed(4)}
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <StatCard
                                icon={<Users className="w-4 h-4 text-neon-cyan" />}
                                label="Followers"
                                value={formatNumber(artist.followerCount)}
                            />
                            <StatCard
                                icon={<Headphones className="w-4 h-4 text-neon-green" />}
                                label="Total Plays"
                                value={formatNumber(artist.totalPlays)}
                            />
                            <StatCard
                                icon={<TrendingUp className="w-4 h-4 text-neon-green" />}
                                label="24h Stream Δ"
                                value={`+${artist.deltaStreamsPercent.toFixed(1)}%`}
                                highlight={artist.deltaStreamsPercent > 10}
                            />
                            {artist.tokenAddress && (
                                <>
                                    <StatCard
                                        icon={<DollarSign className="w-4 h-4 text-neon-yellow" />}
                                        label="Price"
                                        value={formatUSD(artist.tokenPrice)}
                                    />
                                    <StatCard
                                        icon={<DollarSign className="w-4 h-4 text-neon-yellow" />}
                                        label="Market Cap"
                                        value={formatUSD(artist.marketCap)}
                                    />
                                    <StatCard
                                        icon={<BarChart3 className="w-4 h-4 text-neon-magenta" />}
                                        label="Volume (All-Time)"
                                        value={formatUSD(artist.totalVolumeUsd)}
                                    />
                                    <StatCard
                                        icon={<Users className="w-4 h-4 text-blue-400" />}
                                        label="Unique Holders"
                                        value={formatNumber(artist.holders)}
                                    />
                                </>
                            )}
                        </div>

                        {/* Top Track Player */}
                        {artist.topTrackId ? (
                            <div className="glass-panel p-4 pb-2">
                                <h3 className="text-xs font-mono text-terminal-muted uppercase tracking-wider mb-3">
                                    Top Track
                                </h3>
                                <iframe
                                    src={
                                        artist.topTrackId.startsWith("/")
                                            ? `https://audius.co/embed/track${artist.topTrackId}?flavor=compact`
                                            : `https://audius.co/embed/track/${artist.topTrackId}?flavor=compact`
                                    }
                                    width="100%"
                                    height="120"
                                    allow="encrypted-media"
                                    style={{ border: 'none', borderRadius: '8px' }}
                                />
                            </div>
                        ) : (
                            <div className="glass-panel p-4">
                                <h3 className="text-xs font-mono text-terminal-muted uppercase tracking-wider mb-2">
                                    Top Track
                                </h3>
                                <p className="text-sm text-zinc-200 font-medium">
                                    {artist.topTrackTitle || "Unknown Track"}
                                </p>
                                <p className="text-xs text-terminal-muted mt-1">
                                    {formatNumber(artist.topTrackPlays)} plays
                                </p>
                            </div>
                        )}

                        {/* Chart or No Token Data */}
                        {artist.tokenAddress ? (
                            <div className="glass-panel p-4">
                                <h3 className="text-xs font-mono text-terminal-muted uppercase tracking-wider mb-4">
                                    Streams vs Token Price
                                </h3>
                                <div className="h-48 relative">
                                    {chartData.length === 1 && (
                                        <div className="absolute inset-x-0 top-0 text-center z-10 pt-2">
                                            <span className="text-[10px] font-mono bg-terminal-surface/90 text-neon-yellow px-2 py-1 rounded border border-neon-yellow/30">
                                                ⚠ Only 1 snapshot available. Historical charts require more data.
                                            </span>
                                        </div>
                                    )}
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient
                                                    id="streamsGrad"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor="#00f0ff"
                                                        stopOpacity={0.3}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="#00f0ff"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                                <linearGradient
                                                    id="priceGrad"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor="#39ff14"
                                                        stopOpacity={0.3}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="#39ff14"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#1e1e2e"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="day"
                                                stroke="#6b7280"
                                                fontSize={10}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                yAxisId="left"
                                                stroke="#00f0ff"
                                                fontSize={10}
                                                tickLine={false}
                                                tickFormatter={(v: number) =>
                                                    v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
                                                }
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                stroke="#39ff14"
                                                fontSize={10}
                                                tickLine={false}
                                                tickFormatter={(v: number) => `$${v}`}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    background: "#12121a",
                                                    border: "1px solid #1e1e2e",
                                                    borderRadius: "8px",
                                                    fontSize: "12px",
                                                    fontFamily: "JetBrains Mono",
                                                }}
                                            />
                                            <Area
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="streams"
                                                stroke="#00f0ff"
                                                fill="url(#streamsGrad)"
                                                strokeWidth={2}
                                            />
                                            <Area
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="price"
                                                stroke="#39ff14"
                                                fill="url(#priceGrad)"
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex items-center justify-center gap-6 mt-3 text-xs font-mono">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-neon-cyan" />
                                        Streams
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-neon-green" />
                                        Token Price
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
                                <DollarSign className="w-8 h-8 text-terminal-muted mb-2 opacity-30" />
                                <p className="text-sm font-mono text-terminal-muted">No Token Data</p>
                                <p className="text-xs text-zinc-500 mt-2 max-w-[200px]">
                                    Artist does not have a linked token on Solana yet.
                                </p>
                            </div>
                        )}

                        {/* Contract Details */}
                        {artist.tokenAddress && (
                            <div className="glass-panel p-4 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs text-terminal-muted font-mono uppercase mb-1">Token Contract</span>
                                    <span className="text-sm font-mono text-neon-cyan truncate max-w-[200px]">{artist.tokenAddress}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigator.clipboard.writeText(artist.tokenAddress!)}
                                        className="p-2 hover:bg-terminal-bg rounded transition-colors text-terminal-muted hover:text-white"
                                        title="Copy Address"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <a
                                        href={`https://dexscreener.com/solana/${artist.tokenAddress}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 hover:bg-terminal-bg rounded transition-colors text-terminal-muted hover:text-white"
                                        title="View on DexScreener"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        )}


                    </div>
                </div>
            </div>
        </>
    );
}

function StatCard({
    icon,
    label,
    value,
    highlight = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <div
            className={`glass-panel p-3 ${highlight ? "neon-glow-green" : ""}`}
        >
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <span className="text-xs text-terminal-muted font-mono">{label}</span>
            </div>
            <p className="text-lg font-mono font-semibold text-zinc-100">{value}</p>
        </div>
    );
}
