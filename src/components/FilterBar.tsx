import { Search, RefreshCw, SlidersHorizontal } from "lucide-react";

interface FilterBarProps {
    genres: string[];
    selectedGenre: string;
    onGenreChange: (genre: string) => void;
    searchValue: string;
    onSearchChange: (value: string) => void;
    onRefresh: () => void;
    loading: boolean;
}

export function FilterBar({
    genres,
    selectedGenre,
    onGenreChange,
    searchValue,
    onSearchChange,
    onRefresh,
    loading,
}: FilterBarProps) {
    return (
        <div className="flex flex-row items-center gap-1.5 sm:gap-2 w-full">
            {/* Search — flex grow on mobile */}
            <div className="relative flex-[2] min-w-[60px] sm:min-w-[140px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-terminal-muted" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-900/80 border border-zinc-800/60 rounded-lg text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
                />
            </div>

            {/* Genre — compact */}
            <div className="relative flex-1 min-w-[60px] max-w-[100px] sm:max-w-[140px] shrink-0">
                <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-terminal-muted pointer-events-none" />
                <select
                    value={selectedGenre}
                    onChange={(e) => onGenreChange(e.target.value)}
                    className="w-full pl-7 pr-6 py-1.5 bg-zinc-900/80 border border-zinc-800/60 rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-purple-500/40 appearance-none cursor-pointer transition-all hover:bg-zinc-800/80"
                >
                    <option value="">All</option>
                    {genres.map((g) => (
                        <option key={g} value={g}>
                            {g}
                        </option>
                    ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none opacity-40">▼</div>
            </div>

            {/* Refresh — icon only */}
            <button
                onClick={onRefresh}
                disabled={loading}
                className="p-1.5 bg-zinc-900/80 border border-zinc-800/60 rounded-lg text-zinc-400 hover:text-white hover:border-purple-500/40 transition-all shrink-0"
                title="Refresh data"
            >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>


        </div>
    );
}
