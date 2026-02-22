import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { X, Headphones, ExternalLink, Zap, Users, TrendingUp, DollarSign, BarChart3, Copy } from 'lucide-react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';

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
  if (n < 0.01 && n > 0) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(2)}`;
}
function generateChartData(artist) {
  if (!artist.tokenAddress) return [];
  return [
    {
      day: "Today",
      streams: artist.totalPlays,
      price: artist.tokenPrice || 0
    }
  ];
}
function ArtistDetail({ artist, onClose }) {
  const chartData = generateChartData(artist);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-40",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "fixed right-0 top-0 bottom-0 w-full sm:max-w-lg z-50 animate-slide-in", children: /* @__PURE__ */ jsxs("div", { className: "h-full glass-panel-strong border-l border-terminal-border overflow-y-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "sticky top-0 z-10 bg-terminal-surface/95 backdrop-blur-sm border-b border-terminal-border p-4 sm:p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            artist.profilePicture ? /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: artist.profilePicture,
                  alt: artist.name,
                  className: "w-14 h-14 rounded-full ring-2 ring-neon-cyan/30 object-cover",
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
              ),
              /* @__PURE__ */ jsx("div", { className: "avatar-placeholder hidden w-14 h-14 rounded-full bg-terminal-bg ring-2 ring-neon-cyan/30 flex items-center justify-center text-xl font-bold text-neon-cyan", children: artist.name.charAt(0) })
            ] }) : /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-full bg-terminal-bg ring-2 ring-neon-cyan/30 flex items-center justify-center text-xl font-bold text-neon-cyan", children: artist.name.charAt(0) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-zinc-100", children: artist.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-terminal-muted font-mono", children: [
                "@",
                artist.handle
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 flex items-center gap-2", children: /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20", children: artist.topTrackGenre }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onClose,
              className: "p-2 rounded-lg hover:bg-terminal-bg transition-colors",
              children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5 text-terminal-muted" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-3", children: [
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: `https://audius.co/${artist.handle}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "btn-primary flex-1 text-center inline-flex items-center justify-center gap-2 !py-1.5 !text-xs",
              children: [
                /* @__PURE__ */ jsx(Headphones, { className: "w-3.5 h-3.5" }),
                "Listen on Audius"
              ]
            }
          ),
          artist.tokenAddress && /* @__PURE__ */ jsxs(
            "a",
            {
              href: `https://jup.ag/swap/SOL-${artist.tokenAddress}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "btn-buy flex-1 text-center inline-flex items-center justify-center gap-2 !py-1.5 !text-xs",
              children: [
                /* @__PURE__ */ jsx(ExternalLink, { className: "w-3.5 h-3.5" }),
                "Buy on Jupiter"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "glass-panel p-4 neon-glow-cyan text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-mono text-terminal-muted uppercase tracking-wider mb-1", children: "Alpha Score" }),
          /* @__PURE__ */ jsxs("p", { className: "text-3xl font-mono font-bold text-neon-cyan flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsx(Zap, { className: "w-6 h-6" }),
            artist.alphaScore.toFixed(4)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsx(
            StatCard,
            {
              icon: /* @__PURE__ */ jsx(Users, { className: "w-4 h-4 text-neon-cyan" }),
              label: "Followers",
              value: formatNumber(artist.followerCount)
            }
          ),
          /* @__PURE__ */ jsx(
            StatCard,
            {
              icon: /* @__PURE__ */ jsx(Headphones, { className: "w-4 h-4 text-neon-green" }),
              label: "Total Plays",
              value: formatNumber(artist.totalPlays)
            }
          ),
          /* @__PURE__ */ jsx(
            StatCard,
            {
              icon: /* @__PURE__ */ jsx(TrendingUp, { className: "w-4 h-4 text-neon-green" }),
              label: "24h Stream Δ",
              value: `+${artist.deltaStreamsPercent.toFixed(1)}%`,
              highlight: artist.deltaStreamsPercent > 10
            }
          ),
          artist.tokenAddress && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              StatCard,
              {
                icon: /* @__PURE__ */ jsx(DollarSign, { className: "w-4 h-4 text-neon-yellow" }),
                label: "Price",
                value: formatUSD(artist.tokenPrice)
              }
            ),
            /* @__PURE__ */ jsx(
              StatCard,
              {
                icon: /* @__PURE__ */ jsx(DollarSign, { className: "w-4 h-4 text-neon-yellow" }),
                label: "Market Cap",
                value: formatUSD(artist.marketCap)
              }
            ),
            /* @__PURE__ */ jsx(
              StatCard,
              {
                icon: /* @__PURE__ */ jsx(BarChart3, { className: "w-4 h-4 text-neon-magenta" }),
                label: "Volume (All-Time)",
                value: formatUSD(artist.totalVolumeUsd)
              }
            ),
            /* @__PURE__ */ jsx(
              StatCard,
              {
                icon: /* @__PURE__ */ jsx(Users, { className: "w-4 h-4 text-blue-400" }),
                label: "Unique Holders",
                value: formatNumber(artist.holders)
              }
            )
          ] })
        ] }),
        artist.topTrackId ? /* @__PURE__ */ jsxs("div", { className: "glass-panel p-4 pb-2", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-mono text-terminal-muted uppercase tracking-wider mb-3", children: "Top Track" }),
          /* @__PURE__ */ jsx(
            "iframe",
            {
              src: artist.topTrackId.startsWith("/") ? `https://audius.co/embed/track${artist.topTrackId}?flavor=compact` : `https://audius.co/embed/track/${artist.topTrackId}?flavor=compact`,
              width: "100%",
              height: "120",
              allow: "encrypted-media",
              style: { border: "none", borderRadius: "8px" }
            }
          )
        ] }) : /* @__PURE__ */ jsxs("div", { className: "glass-panel p-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-mono text-terminal-muted uppercase tracking-wider mb-2", children: "Top Track" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-200 font-medium", children: artist.topTrackTitle || "Unknown Track" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-terminal-muted mt-1", children: [
            formatNumber(artist.topTrackPlays),
            " plays"
          ] })
        ] }),
        artist.tokenAddress ? /* @__PURE__ */ jsxs("div", { className: "glass-panel p-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-mono text-terminal-muted uppercase tracking-wider mb-4", children: "Streams vs Token Price" }),
          /* @__PURE__ */ jsxs("div", { className: "h-48 relative", children: [
            chartData.length === 1 && /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 top-0 text-center z-10 pt-2", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono bg-terminal-surface/90 text-neon-yellow px-2 py-1 rounded border border-neon-yellow/30", children: "⚠ Only 1 snapshot available. Historical charts require more data." }) }),
            /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: chartData, children: [
              /* @__PURE__ */ jsxs("defs", { children: [
                /* @__PURE__ */ jsxs(
                  "linearGradient",
                  {
                    id: "streamsGrad",
                    x1: "0",
                    y1: "0",
                    x2: "0",
                    y2: "1",
                    children: [
                      /* @__PURE__ */ jsx(
                        "stop",
                        {
                          offset: "5%",
                          stopColor: "#00f0ff",
                          stopOpacity: 0.3
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "stop",
                        {
                          offset: "95%",
                          stopColor: "#00f0ff",
                          stopOpacity: 0
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "linearGradient",
                  {
                    id: "priceGrad",
                    x1: "0",
                    y1: "0",
                    x2: "0",
                    y2: "1",
                    children: [
                      /* @__PURE__ */ jsx(
                        "stop",
                        {
                          offset: "5%",
                          stopColor: "#39ff14",
                          stopOpacity: 0.3
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "stop",
                        {
                          offset: "95%",
                          stopColor: "#39ff14",
                          stopOpacity: 0
                        }
                      )
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                CartesianGrid,
                {
                  strokeDasharray: "3 3",
                  stroke: "#1e1e2e",
                  vertical: false
                }
              ),
              /* @__PURE__ */ jsx(
                XAxis,
                {
                  dataKey: "day",
                  stroke: "#6b7280",
                  fontSize: 10,
                  tickLine: false
                }
              ),
              /* @__PURE__ */ jsx(
                YAxis,
                {
                  yAxisId: "left",
                  stroke: "#00f0ff",
                  fontSize: 10,
                  tickLine: false,
                  tickFormatter: (v) => v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : String(v)
                }
              ),
              /* @__PURE__ */ jsx(
                YAxis,
                {
                  yAxisId: "right",
                  orientation: "right",
                  stroke: "#39ff14",
                  fontSize: 10,
                  tickLine: false,
                  tickFormatter: (v) => `$${v}`
                }
              ),
              /* @__PURE__ */ jsx(
                Tooltip,
                {
                  contentStyle: {
                    background: "#12121a",
                    border: "1px solid #1e1e2e",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontFamily: "JetBrains Mono"
                  }
                }
              ),
              /* @__PURE__ */ jsx(
                Area,
                {
                  yAxisId: "left",
                  type: "monotone",
                  dataKey: "streams",
                  stroke: "#00f0ff",
                  fill: "url(#streamsGrad)",
                  strokeWidth: 2
                }
              ),
              /* @__PURE__ */ jsx(
                Area,
                {
                  yAxisId: "right",
                  type: "monotone",
                  dataKey: "price",
                  stroke: "#39ff14",
                  fill: "url(#priceGrad)",
                  strokeWidth: 2
                }
              )
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-6 mt-3 text-xs font-mono", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-neon-cyan" }),
              "Streams"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-neon-green" }),
              "Token Price"
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "glass-panel p-6 flex flex-col items-center justify-center text-center", children: [
          /* @__PURE__ */ jsx(DollarSign, { className: "w-8 h-8 text-terminal-muted mb-2 opacity-30" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-mono text-terminal-muted", children: "No Token Data" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-2 max-w-[200px]", children: "Artist does not have a linked token on Solana yet." })
        ] }),
        artist.tokenAddress && /* @__PURE__ */ jsxs("div", { className: "glass-panel p-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-terminal-muted font-mono uppercase mb-1", children: "Token Contract" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-mono text-neon-cyan truncate max-w-[200px]", children: artist.tokenAddress })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => navigator.clipboard.writeText(artist.tokenAddress),
                className: "p-2 hover:bg-terminal-bg rounded transition-colors text-terminal-muted hover:text-white",
                title: "Copy Address",
                children: /* @__PURE__ */ jsx(Copy, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: `https://dexscreener.com/solana/${artist.tokenAddress}`,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "p-2 hover:bg-terminal-bg rounded transition-colors text-terminal-muted hover:text-white",
                title: "View on DexScreener",
                children: /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4" })
              }
            )
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
function StatCard({
  icon,
  label,
  value,
  highlight = false
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `glass-panel p-3 ${highlight ? "neon-glow-green" : ""}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
          icon,
          /* @__PURE__ */ jsx("span", { className: "text-xs text-terminal-muted font-mono", children: label })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-lg font-mono font-semibold text-zinc-100", children: value })
      ]
    }
  );
}

export { ArtistDetail };
