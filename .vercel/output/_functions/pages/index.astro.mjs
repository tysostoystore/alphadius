import { e as createComponent, g as addAttribute, k as renderHead, l as renderSlot, n as renderScript, r as renderTemplate, h as createAstro, o as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_DdoIrwwM.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                 */
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect, lazy, useRef, useCallback, Suspense } from 'react';
import { Radio, Zap, Info, DollarSign, TrendingUp, Flame, Search, SlidersHorizontal, RefreshCw, X, Activity, Database, ExternalLink, List, TrendingDown, ChevronUp, ArrowUpDown, ChevronDown } from 'lucide-react';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const {
    title = "ALPHADIUS \u2014 Predictive A&R Terminal",
    description = "Identifying undervalued Audius artists by matching social traction with market valuation. Early alpha discovery for the creator economy."
  } = Astro2.props;
  return renderTemplate`<html lang="en" class="dark"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description"${addAttribute(description, "content")}><meta name="theme-color" content="#0a0a0f"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${title}</title>${renderHead()}</head> <body class="min-h-screen bg-[#0A0510] text-zinc-200 antialiased font-sans flex flex-col"> <!-- Top gradient line --> <div class="fixed top-0 left-0 right-0 h-[2px] z-50" style="background: linear-gradient(90deg, transparent, #a855f7, #c084fc, #d8b4fe, transparent)"></div> <!-- Header --> <header class="sticky top-0 z-40 bg-[#0A0510]/80 backdrop-blur-xl border-b border-white/5 w-full"> <div class="px-4 sm:px-8 lg:px-12 py-3 sm:py-4 flex items-center justify-between w-full"> <div class="flex items-center gap-3 sm:gap-4"> <div class="flex items-center gap-2"> <div class="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div> <span class="font-sans text-base sm:text-lg text-white font-bold tracking-wide">
ALPHADIUS
</span> </div> <div class="h-4 sm:h-5 w-[1px] bg-white/10 hidden xs:block"></div> <span class="text-[10px] sm:text-sm text-zinc-400 font-medium hidden xs:block">
Predictive A&R Terminal
</span> </div> <div class="flex items-center gap-3 sm:gap-4"> <button id="about-btn" class="bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-600 border border-zinc-700 text-white shadow-none items-center justify-center gap-2 px-3 sm:px-4 py-1.5 whitespace-nowrap text-[10px] sm:text-xs uppercase tracking-widest font-bold rounded transition-colors hidden sm:flex" title="About ALPHADIUS">
About
</button> <button id="about-btn-mobile" class="bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-600 border border-zinc-700 text-white shadow-none items-center justify-center gap-2 px-2.5 py-1 whitespace-nowrap text-[10px] uppercase tracking-widest font-bold rounded transition-colors flex sm:hidden" title="About ALPHADIUS">
?
</button> <div class="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-zinc-400 bg-white/5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/5"> <div class="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_5px_#a855f7]"></div> <span>LIVE</span> </div> </div> </div> </header> <!-- Main content --> <main class="w-full px-4 sm:px-8 lg:px-12 py-4 sm:py-6"> ${renderSlot($$result, $$slots["default"])} </main> <!-- Footer --> <footer class="border-t border-white/5 mt-auto bg-[#0A0510]/50 w-full"> <div class="px-6 sm:px-8 lg:px-12 py-6 w-full"> <p class="text-sm text-zinc-500 font-medium text-center">
ALPHADIUS v0.1.0 — Data from Audius API. Not financial advice.
</p> </div> </footer> ${renderScript($$result, "D:/Docs/Desktop/webdev/audius_alpha/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "D:/Docs/Desktop/webdev/audius_alpha/src/layouts/Layout.astro", void 0);

const DEMO_ALERTS = [
  { type: "info", message: "🔥 Scanning Audius for alpha...", timestamp: Date.now() },
  { type: "info", message: "📡 Monitoring trending tracks", timestamp: Date.now() },
  { type: "gem", message: "💎 Looking for undervalued gems", timestamp: Date.now() },
  { type: "velocity", message: "⚡ Run 'bun run scripts/ingest.ts' to populate data", timestamp: Date.now() }
];
function EventFeed({ alerts, onArtistClick }) {
  const [visibleAlerts, setVisibleAlerts] = useState([]);
  const displayAlerts = alerts.length > 0 ? alerts : DEMO_ALERTS;
  useEffect(() => {
    setVisibleAlerts([]);
    const timers = [];
    displayAlerts.forEach((alert, index) => {
      const timer = setTimeout(() => {
        setVisibleAlerts((prev) => [...prev, alert]);
      }, index * 400);
      timers.push(timer);
    });
    return () => timers.forEach(clearTimeout);
  }, [alerts]);
  const getAlertIcon = (type) => {
    switch (type) {
      case "gem":
        return /* @__PURE__ */ jsx(Flame, { className: "w-3.5 h-3.5 text-orange-400" });
      case "velocity":
        return /* @__PURE__ */ jsx(TrendingUp, { className: "w-3.5 h-3.5 text-neon-green" });
      case "opportunity":
        return /* @__PURE__ */ jsx(DollarSign, { className: "w-3.5 h-3.5 text-neon-yellow" });
      default:
        return /* @__PURE__ */ jsx(Info, { className: "w-3.5 h-3.5 text-blue-400" });
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "glass-panel p-4 sticky top-20 border border-zinc-800/50 shadow-2xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/50", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Radio, { className: "w-4 h-4 text-neon-magenta animate-pulse" }),
        /* @__PURE__ */ jsx("h3", { className: "text-xs font-mono text-zinc-400 uppercase tracking-widest font-bold", children: "Live Pulse" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-neon-green/10 px-2 py-0.5 rounded border border-neon-green/20", children: [
        /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono text-neon-green font-bold", children: "ACTIVE" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1 custom-scrollbar", children: [
      visibleAlerts.map((alert, idx) => /* @__PURE__ */ jsx(
        "div",
        {
          onClick: () => alert.artistId && onArtistClick?.(alert.artistId),
          className: `group animate-slide-in p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 transition-all duration-300 ${alert.artistId ? "cursor-pointer hover:bg-zinc-800/50" : ""}`,
          children: /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
            alert.profilePicture ? /* @__PURE__ */ jsx(
              "img",
              {
                src: alert.profilePicture,
                className: "w-8 h-8 rounded-full border border-zinc-800 group-hover:border-neon-cyan/50 transition-colors object-cover",
                alt: "",
                onError: (e) => {
                  const target = e.target;
                  const mirrors = [
                    "https://audius-creator-10.theblueprint.xyz/content",
                    "https://creatornode2.audius.co/content",
                    "https://audius-content-5.cultur3stake.com/content"
                  ];
                  const attempt = parseInt(target.dataset.retry || "0");
                  if (attempt < mirrors.length && target.src.includes("/content/")) {
                    target.dataset.retry = String(attempt + 1);
                    target.src = target.src.replace(/https:\/\/[^/]+\/content/, mirrors[attempt]);
                  } else {
                    target.style.display = "none";
                    target.parentElement?.querySelector(".avatar-placeholder")?.classList.remove("hidden");
                  }
                }
              }
            ) : null,
            /* @__PURE__ */ jsx("div", { className: `avatar-placeholder ${alert.profilePicture ? "hidden" : ""} w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0`, children: getAlertIcon(alert.type) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-zinc-300 leading-snug font-mono", children: alert.message }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[9px] text-zinc-500 font-mono", children: new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }),
                alert.artistId && /* @__PURE__ */ jsxs("span", { className: "text-[9px] text-neon-cyan font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1", children: [
                  "VIEW DETAILS ",
                  /* @__PURE__ */ jsx(Zap, { className: "w-2 h-2" })
                ] })
              ] })
            ] })
          ] })
        },
        idx
      )),
      visibleAlerts.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx(Radio, { className: "w-8 h-8 text-zinc-800 mx-auto mb-2 animate-pulse" }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-zinc-600 font-mono uppercase tracking-widest", children: "Listening for signals..." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-3 text-[9px] font-mono text-zinc-600 border-t border-zinc-800/50 flex justify-between", children: [
      /* @__PURE__ */ jsx("span", { children: "TERMINAL_ID: AUDIUS_A1" }),
      /* @__PURE__ */ jsx("span", { children: "V1.2.0" })
    ] })
  ] });
}

function FilterBar({
  genres,
  selectedGenre,
  onGenreChange,
  searchValue,
  onSearchChange,
  onRefresh,
  loading,
  totalResults
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-center gap-1.5 sm:gap-2 w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative flex-[2] min-w-[60px] sm:min-w-[140px]", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-terminal-muted" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "Search...",
          value: searchValue,
          onChange: (e) => onSearchChange(e.target.value),
          className: "w-full pl-8 pr-3 py-1.5 bg-zinc-900/80 border border-zinc-800/60 rounded-lg text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative flex-1 min-w-[60px] max-w-[100px] sm:max-w-[140px] shrink-0", children: [
      /* @__PURE__ */ jsx(SlidersHorizontal, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-terminal-muted pointer-events-none" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: selectedGenre,
          onChange: (e) => onGenreChange(e.target.value),
          className: "w-full pl-7 pr-6 py-1.5 bg-zinc-900/80 border border-zinc-800/60 rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-purple-500/40 appearance-none cursor-pointer transition-all hover:bg-zinc-800/80",
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "All" }),
            genres.map((g) => /* @__PURE__ */ jsx("option", { value: g, children: g }, g))
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute right-2 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none opacity-40", children: "▼" })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onRefresh,
        disabled: loading,
        className: "p-1.5 bg-zinc-900/80 border border-zinc-800/60 rounded-lg text-zinc-400 hover:text-white hover:border-purple-500/40 transition-all shrink-0",
        title: "Refresh data",
        children: /* @__PURE__ */ jsx(RefreshCw, { className: `w-3.5 h-3.5 ${loading ? "animate-spin" : ""}` })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "text-[9px] font-mono text-zinc-500 bg-zinc-900/60 px-2 py-1 rounded border border-zinc-800/40 shrink-0 hidden sm:block", children: /* @__PURE__ */ jsx("span", { className: "text-purple-400 font-bold", children: totalResults.toLocaleString() }) })
  ] });
}

function AboutModal({ isOpen, onClose }) {
  const [creatorAlpha, setCreatorAlpha] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!isOpen) return;
    async function fetchCreatorStats() {
      try {
        const userRes = await fetch("https://api.audius.co/v1/users/QNbNW?app_name=ALPHADIUS");
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
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-lg bg-[#0A0510] border border-zinc-800 rounded-xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 w-64 h-64 bg-neon-cyan/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6 relative", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold text-white flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Info, { className: "w-5 h-5 text-fuchsia-400" }),
          "About ALPHADIUS"
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onClose,
            className: "p-1 text-zinc-400 hover:text-white transition-colors",
            children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6 relative text-sm text-zinc-300 font-sans leading-relaxed", children: [
        /* @__PURE__ */ jsxs("div", { className: "glass-panel p-4 border-white/5 bg-white/5", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-white font-bold mb-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Activity, { className: "w-4 h-4 text-neon-cyan" }),
            "How is Alpha (α) calculated?"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mb-3", children: [
            "ALPHADIUS acts as a predictive A&R terminal designed to detect undervalued artists on the Audius network. It does this by analyzing ",
            /* @__PURE__ */ jsx("strong", { children: "social-to-market divergence" }),
            "."
          ] }),
          /* @__PURE__ */ jsx("p", { className: "font-mono text-[11px] sm:text-xs bg-black/50 p-2 sm:p-3 rounded border border-zinc-800 text-zinc-400 mb-3 overflow-x-auto whitespace-nowrap", children: "α = √(Plays / (Followers + 100)) × log₂(Growth + 2) × log₁₀(Plays + 1)" }),
          /* @__PURE__ */ jsx("p", { className: "mb-2", children: "A high Alpha Score indicates an artist generating significant traction relative to their audience—highlighting hidden gems before they break." }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 text-[10px] font-mono", children: [
            /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20", children: "Engagement — streams vs followers" }),
            /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20", children: "Momentum — 24h stream growth" }),
            /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-300 border border-zinc-700", children: "Gravity — proven listeners" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass-panel p-4 border-white/5 bg-white/5 text-xs sm:text-sm", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-white font-bold mb-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Database, { className: "w-4 h-4 text-neon-cyan" }),
            "Database Scope"
          ] }),
          /* @__PURE__ */ jsx("p", { children: "Currently, ALPHADIUS monitors a curated matrix of thousands of trending artists. This initial dataset is formed by aggregating metrics from the Audius discovery and underground trending protocols." }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-zinc-400 italic", children: "* We are actively scaling our ingestion engine to encompass a significantly broader array of emerging creators in future system updates." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass-panel p-4 border-fuchsia-500/20 bg-fuchsia-500/5", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-white font-bold mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-fuchsia-500" }),
            "Creator"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { className: "mb-1", children: [
                "Built with 💜 by ",
                /* @__PURE__ */ jsx("strong", { children: "toystore" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-2", children: [
                /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: "https://x.com/tysostoystore",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors",
                    children: [
                      /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" }),
                      "x.com"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: "https://audius.co/toystore",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "text-xs font-mono text-zinc-400 hover:text-purple-400 flex items-center gap-1 transition-colors",
                    children: [
                      /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" }),
                      "audius.co"
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center bg-black/50 border border-zinc-800 rounded-lg p-3 min-w-[100px]", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-zinc-500 mb-1 uppercase tracking-widest", children: "Creator α" }),
              loading ? /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-zinc-600 animate-pulse", children: "..." }) : /* @__PURE__ */ jsx("span", { className: `text-xl font-bold font-mono ${creatorAlpha && creatorAlpha > 10 ? "text-purple-400" : "text-zinc-300"}`, children: creatorAlpha })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}

const ConstellationMap = lazy(() => import('../chunks/ConstellationMap_BHyWwhu1.mjs').then((m) => ({ default: m.ConstellationMap })));
const ArtistDetail = lazy(() => import('../chunks/ArtistDetail_DDQVj6I4.mjs').then((m) => ({ default: m.ArtistDetail })));
function formatNumber(n) {
  if (n == null) return "—";
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
}
function formatUSD(n) {
  if (n == null) return "—";
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  if (n < 0.01) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(2)}`;
}
function getScoreColor(score) {
  if (score >= 1e3) return "text-fuchsia-400 drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]";
  if (score >= 100) return "text-purple-400";
  return "text-zinc-500";
}
function getScoreBg(score) {
  if (score >= 1e3) return "bg-fuchsia-500/10 border-fuchsia-500/30";
  if (score >= 100) return "bg-purple-500/10 border-purple-500/20";
  return "bg-zinc-800/50 border-zinc-700/50";
}
function AlphaTable() {
  const [data, setData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const observerTarget = useRef(null);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState("alpha_score");
  const [order, setOrder] = useState("desc");
  const [genre, setGenre] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  useEffect(() => {
    const handleOpenAbout = () => setIsAboutOpen(true);
    window.addEventListener("open-about", handleOpenAbout);
    return () => window.removeEventListener("open-about", handleOpenAbout);
  }, []);
  const fetchData = useCallback(async (isAppend = false) => {
    if (isAppend) setLoadingMore(true);
    else setLoading(true);
    try {
      const currentOffset = isAppend ? data.length : 0;
      const limit = isAppend ? 100 : 5e3;
      const params = new URLSearchParams({
        sort,
        order,
        limit: limit.toString(),
        offset: currentOffset.toString()
      });
      if (genre) params.set("genre", genre);
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/alpha-feed?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData((prev) => isAppend ? [...prev, ...json.data] : json.data);
      setAlerts(json.meta.alerts);
      setGenres(json.meta.genres);
      setHasMore(json.data.length >= limit);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sort, order, genre, debouncedSearch, data.length]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
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
  const toggleSort = (field) => {
    if (sort === field) {
      setOrder(order === "desc" ? "asc" : "desc");
    } else {
      setSort(field);
      setOrder("desc");
    }
  };
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === "map") {
      setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
      setTimeout(() => window.dispatchEvent(new Event("resize")), 300);
    }
  };
  const SortIcon = ({ field }) => {
    if (sort !== field)
      return /* @__PURE__ */ jsx(ArrowUpDown, { className: "w-3 h-3 text-terminal-muted" });
    return order === "desc" ? /* @__PURE__ */ jsx(ChevronDown, { className: "w-3 h-3 text-neon-cyan" }) : /* @__PURE__ */ jsx(ChevronUp, { className: "w-3 h-3 text-neon-cyan" });
  };
  const displayData = data;
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row gap-4 pb-6 lg:pb-32", children: [
    /* @__PURE__ */ jsxs("div", { className: `min-w-0 ${viewMode === "map" ? "flex-[3]" : "flex-[2] lg:flex-1"}`, children: [
      /* @__PURE__ */ jsx("div", { className: "sticky top-[49px] sm:top-[57px] z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-[#0A0510]/90 backdrop-blur-xl border-b border-white/5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-center justify-between gap-1.5 sm:gap-4 w-full", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsx(
          FilterBar,
          {
            genres,
            selectedGenre: genre,
            onGenreChange: setGenre,
            searchValue: search,
            onSearchChange: setSearch,
            onRefresh: () => fetchData(false),
            loading,
            totalResults: data.length
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5 bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800/60 shrink-0", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => handleViewModeChange("table"),
              className: `flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-mono font-semibold transition-all duration-200 ${viewMode === "table" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`,
              children: [
                /* @__PURE__ */ jsx(List, { className: "w-3 h-3" }),
                " ",
                /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Table" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            viewMode !== "map" && /* @__PURE__ */ jsx("div", { className: "absolute -inset-0.5 rounded-lg bg-purple-500/20 animate-pulse blur-sm pointer-events-none" }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleViewModeChange("map"),
                className: `relative flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-mono font-semibold transition-all duration-200 ${viewMode === "map" ? "bg-gradient-to-r from-purple-600/30 to-fuchsia-600/30 text-purple-100 border border-purple-500/50" : "text-purple-300 hover:text-purple-200 border border-purple-500/30"}`,
                children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xs", children: "✦" }),
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: viewMode === "map" ? "Stars" : "Explore" })
                ]
              }
            )
          ] })
        ] })
      ] }) }),
      viewMode === "map" ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
        /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "w-full h-[400px] sm:h-[700px] glass-panel flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-mono text-terminal-muted", children: "Aligning stars..." })
        ] }) }), children: /* @__PURE__ */ jsx(
          ConstellationMap,
          {
            data: displayData,
            onArtistClick: (artist) => setSelectedArtist(artist),
            onArtistHover: () => {
            },
            genres,
            selectedGenre: genre,
            onGenreChange: setGenre
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { ref: observerTarget, className: "h-20 w-full flex justify-center items-center py-8", children: [
          loadingMore && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-purple-400 uppercase tracking-widest", children: "Scanning deeper..." })
          ] }),
          !hasMore && data.length > 0 && /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-terminal-muted opacity-50 uppercase tracking-widest", children: "End of Discovery Constellation" })
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "glass-panel border border-zinc-800/50 shadow-2xl", children: [
        error && /* @__PURE__ */ jsx("div", { className: "p-4 bg-neon-magenta/10 border-b border-neon-magenta/20", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-neon-magenta font-mono", children: [
          "⚠ Error: ",
          error
        ] }) }),
        /* @__PURE__ */ jsxs("table", { className: "w-full table-fixed sm:table-auto", children: [
          /* @__PURE__ */ jsx("thead", { className: "sticky top-[89px] sm:top-[97px] z-20", children: /* @__PURE__ */ jsxs("tr", { className: "bg-[#0A0510] border-b border-zinc-800", children: [
            /* @__PURE__ */ jsx("th", { className: "text-left px-1 sm:px-3 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-tighter w-[5%] sm:w-12", children: "#" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-1 sm:px-3 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-tighter w-[33%] sm:w-[200px]", children: "Artist" }),
            /* @__PURE__ */ jsx("th", { className: "hidden lg:table-cell text-left px-4 py-2.5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest w-auto", children: "Track" }),
            /* @__PURE__ */ jsx("th", { className: "text-right px-1 sm:px-4 py-2 text-[8px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-tighter cursor-pointer hover:text-neon-cyan transition-colors w-[14%] sm:w-auto", onClick: () => toggleSort("delta_streams"), children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-0.5 sm:gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Streams" }),
              /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: "Str" }),
              " ",
              /* @__PURE__ */ jsx(SortIcon, { field: "delta_streams" })
            ] }) }),
            /* @__PURE__ */ jsx("th", { className: "text-right px-1 sm:px-4 py-2 text-[8px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-tighter cursor-pointer hover:text-neon-cyan transition-colors w-[12%] sm:w-auto", onClick: () => toggleSort("follower_count"), children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-0.5 sm:gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Followers" }),
              /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: "Fol" }),
              " ",
              /* @__PURE__ */ jsx(SortIcon, { field: "follower_count" })
            ] }) }),
            /* @__PURE__ */ jsx("th", { className: "text-right px-1 sm:px-4 py-2 text-[8px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-tighter cursor-pointer hover:text-neon-cyan transition-colors w-[12%] sm:w-auto", onClick: () => toggleSort("market_cap"), children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-0.5 sm:gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "MC" }),
              /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: "MC" }),
              " ",
              /* @__PURE__ */ jsx(SortIcon, { field: "market_cap" })
            ] }) }),
            /* @__PURE__ */ jsx("th", { className: "text-right px-1 sm:px-3 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-tighter cursor-pointer hover:text-neon-cyan transition-colors w-[12%] sm:w-auto", onClick: () => toggleSort("alpha_score"), children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-0.5 sm:gap-1", children: [
              /* @__PURE__ */ jsxs("span", { className: "hidden sm:inline", children: [
                /* @__PURE__ */ jsx(Zap, { className: "w-3 h-3" }),
                " Alpha"
              ] }),
              /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: /* @__PURE__ */ jsx(Zap, { className: "w-2.5 h-2.5" }) }),
              " ",
              /* @__PURE__ */ jsx(SortIcon, { field: "alpha_score" })
            ] }) }),
            /* @__PURE__ */ jsx("th", { className: "text-center px-1 sm:px-3 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-tighter w-[12%] sm:w-auto", children: "Act" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: loading && data.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 8, className: "text-center py-20", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-3 text-zinc-500 font-mono text-sm", children: [
            /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" }),
            "Decrypting social signals..."
          ] }) }) }) : displayData.map((artist, idx) => /* @__PURE__ */ jsxs("tr", { className: "table-row-hover border-b border-zinc-800/30 group", onClick: () => setSelectedArtist(artist), children: [
            /* @__PURE__ */ jsx("td", { className: "px-3 py-3 font-mono text-[10px] text-zinc-600", children: idx + 1 }),
            /* @__PURE__ */ jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative shrink-0 flex items-center justify-center", children: [
                artist.alphaScore >= 1e3 && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("div", { className: "absolute -inset-1 rounded-full animate-[spin_2s_linear_infinite] blur-[3px] opacity-70 z-0 pointer-events-none", style: { background: "conic-gradient(from 0deg, #d946ef, #8b5cf6, #d946ef)" }, title: "Top Alpha Score (α ≥ 1000)" }),
                  /* @__PURE__ */ jsx("div", { className: "absolute -inset-[2px] rounded-full animate-[spin_3s_linear_infinite_reverse] opacity-100 z-0 pointer-events-none", style: { background: "conic-gradient(from 0deg, transparent 0%, #d946ef 25%, transparent 50%, #8b5cf6 75%, transparent 100%)" } })
                ] }),
                artist.profilePicture ? /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: artist.profilePicture,
                    alt: artist.name,
                    className: "relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0A0510] object-cover ring-2 ring-[#0A0510]",
                    onError: (e) => {
                      const target = e.target;
                      const mirrors = [
                        "https://audius-creator-10.theblueprint.xyz/content",
                        "https://creatornode2.audius.co/content",
                        "https://audius-content-5.cultur3stake.com/content"
                      ];
                      const attempt = parseInt(target.dataset.retry || "0");
                      if (attempt < mirrors.length && target.src.includes("/content/")) {
                        target.dataset.retry = String(attempt + 1);
                        target.src = target.src.replace(/https:\/\/[^/]+\/content/, mirrors[attempt]);
                      } else {
                        target.style.display = "none";
                        target.parentElement?.querySelector(".avatar-placeholder")?.classList.remove("hidden");
                      }
                    }
                  }
                ) : null,
                /* @__PURE__ */ jsx("div", { className: `avatar-placeholder relative z-10 ${artist.profilePicture ? "hidden" : ""} w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-800 ring-2 ring-[#0A0510] flex items-center justify-center text-[10px] font-bold text-zinc-500`, children: artist.name.charAt(0) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[11px] sm:text-sm font-medium text-zinc-100 truncate group-hover:text-neon-cyan transition-colors w-full", children: artist.name }),
                /* @__PURE__ */ jsxs("p", { className: "text-[9px] sm:text-[10px] text-zinc-500 font-mono truncate opacity-70 w-full", children: [
                  "@",
                  artist.handle
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "hidden lg:table-cell px-4 py-3 text-sm text-zinc-400 truncate max-w-[180px] font-mono", children: artist.topTrackTitle }),
            /* @__PURE__ */ jsx("td", { className: "px-1 sm:px-4 py-2 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[9px] sm:text-sm font-bold text-zinc-200 font-mono italic", children: formatNumber(artist.totalPlays) }),
              /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-0.5 sm:gap-1 text-[7px] sm:text-[10px] font-mono ${artist.deltaStreamsPercent > 0 ? "text-neon-green" : artist.deltaStreamsPercent < 0 ? "text-neon-magenta" : "text-zinc-500"}`, children: [
                artist.deltaStreamsPercent > 0 ? /* @__PURE__ */ jsx(TrendingUp, { className: "hidden sm:block w-2.5 h-2.5" }) : artist.deltaStreamsPercent < 0 ? /* @__PURE__ */ jsx(TrendingDown, { className: "hidden sm:block w-2.5 h-2.5" }) : null,
                artist.deltaStreamsPercent > 0 ? "+" : "",
                artist.deltaStreamsPercent.toFixed(1),
                "%"
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-1 sm:px-4 py-2 text-right font-mono text-[9px] sm:text-sm text-zinc-300", children: formatNumber(artist.followerCount) }),
            /* @__PURE__ */ jsx("td", { className: "px-1 sm:px-4 py-2 text-right font-mono text-[9px] sm:text-sm text-zinc-300", children: formatUSD(artist.marketCap) }),
            /* @__PURE__ */ jsx("td", { className: "px-1 sm:px-3 py-2 text-right", children: /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-0.5 rounded-full font-mono text-[8px] sm:text-xs font-bold border ${getScoreBg(artist.alphaScore)} ${getScoreColor(artist.alphaScore)}`, children: [
              /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: /* @__PURE__ */ jsx(Zap, { className: "w-2.5 h-2.5" }) }),
              " ",
              artist.alphaScore.toFixed(0)
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-1 sm:px-3 py-2 text-center", children: artist.tokenAddress ? /* @__PURE__ */ jsx("a", { href: `https://jup.ag/swap/SOL-${artist.tokenAddress}`, target: "_blank", rel: "noopener noreferrer", className: "btn-buy inline-flex items-center gap-1 py-1 px-2 text-[10px]", onClick: (e) => e.stopPropagation(), children: "BUY" }) : /* @__PURE__ */ jsx("a", { href: `https://audius.co/${artist.handle}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-bold rounded bg-neon-cyan/5 border border-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/20 transition-all shrink-0", onClick: (e) => e.stopPropagation(), children: "PLAY" }) })
          ] }, artist.audiusUserId)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { ref: observerTarget, className: "h-24 w-full flex justify-center items-center py-12 border-t border-zinc-800/10", children: [
          loadingMore && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-zinc-500 font-mono text-sm", children: [
            /* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" }),
            "Fetching deeper signals..."
          ] }),
          !hasMore && data.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 opacity-40", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]", children: "End of Transmission" }),
            /* @__PURE__ */ jsx("div", { className: "w-24 h-[1px] bg-zinc-800 mt-2" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: `flex-shrink-0 ${viewMode === "map" ? "w-full lg:w-64" : "w-full lg:w-80"}`, children: /* @__PURE__ */ jsx("div", { className: "sticky top-6", children: /* @__PURE__ */ jsx(
      EventFeed,
      {
        alerts,
        onArtistClick: (id) => {
          const artist = data.find((a) => a.audiusUserId === id);
          if (artist) setSelectedArtist(artist);
        }
      }
    ) }) }),
    selectedArtist && /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(
      ArtistDetail,
      {
        artist: selectedArtist,
        onClose: () => setSelectedArtist(null)
      }
    ) }),
    /* @__PURE__ */ jsx(
      AboutModal,
      {
        isOpen: isAboutOpen,
        onClose: () => setIsAboutOpen(false)
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
        className: `fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full 
                    bg-white/5 backdrop-blur-xl border border-white/10 
                    shadow-[0_4px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]
                    flex items-center justify-center
                    text-zinc-400 hover:text-white hover:bg-white/10 hover:border-purple-500/30
                    hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]
                    transition-all duration-300
                    ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`,
        "aria-label": "Scroll to top",
        children: /* @__PURE__ */ jsx(ChevronUp, { className: "w-4 h-4" })
      }
    )
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="mb-8"> <div class="flex items-end justify-between"> <div> <h1 class="text-2xl font-bold text-zinc-100 flex items-center gap-3"> <span class="inline-block w-1.5 h-8 rounded-full" style="background: linear-gradient(180deg, #a855f7, #c084fc)"></span> <a href="https://audius.co/" target="_blank" rel="noopener noreferrer" class="text-purple-500 hover:text-purple-400 underline decoration-purple-500/30 underline-offset-4 transition-colors">Audius</a> Alpha Terminal
</h1> <p class="text-sm text-zinc-500 mt-1 font-sans">
Detecting undervalued artists through social-to-market divergence
</p> </div> </div> <div class="mt-4 h-[1px]" style="background: linear-gradient(90deg, #a855f7, transparent 100%)"></div> </div>  ${renderComponent($$result2, "AlphaTable", AlphaTable, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/AlphaTable", "client:component-export": "AlphaTable" })} ` })}`;
}, "D:/Docs/Desktop/webdev/audius_alpha/src/pages/index.astro", void 0);

const $$file = "D:/Docs/Desktop/webdev/audius_alpha/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
