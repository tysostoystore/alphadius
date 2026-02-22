import { jsxs, jsx } from 'react/jsx-runtime';
import { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, XAxis, YAxis, ZAxis, Tooltip, Scatter, Cell } from 'recharts';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Zap, SlidersHorizontal, Minimize2, Maximize2 } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const artist = payload[0].payload;
    return /* @__PURE__ */ jsxs("div", { className: "glass-panel p-3 border-purple-500/30 bg-[#1A1A1F]/95 max-w-[250px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        artist.profilePicture ? /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: artist.profilePicture,
              alt: artist.name,
              className: "w-8 h-8 rounded-full border border-purple-500/50",
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
          /* @__PURE__ */ jsx("div", { className: "avatar-placeholder hidden w-8 h-8 rounded-full bg-zinc-800 border border-purple-500/50 flex items-center justify-center text-[10px] font-bold text-zinc-400", children: artist.name.charAt(0) })
        ] }) : /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-zinc-800 border border-purple-500/50 flex items-center justify-center text-[10px] font-bold text-zinc-400", children: artist.name.charAt(0) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "font-bold text-zinc-100 truncate text-sm", children: artist.name }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500 font-mono", children: [
            "@",
            artist.handle
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1 mt-2 border-t border-zinc-800 pt-2", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400 font-mono flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { children: "Followers:" }),
          /* @__PURE__ */ jsxs("span", { className: "text-zinc-200", children: [
            (artist.followerCount / 1e3).toFixed(1),
            "k"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400 font-mono flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { children: "24h Grow:" }),
          /* @__PURE__ */ jsxs("span", { className: "text-neon-green", children: [
            "+",
            artist.deltaStreams24h,
            " streams"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400 font-mono flex justify-between items-center mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "Alpha:" }),
          /* @__PURE__ */ jsxs("span", { className: "text-fuchsia-400 font-bold flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Zap, { className: "w-3 h-3" }),
            " ",
            artist.alphaScore.toFixed(1)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-2 text-[10px] text-zinc-500 text-center uppercase tracking-widest border-t border-zinc-800 pt-2", children: "Click to Play Track" })
    ] });
  }
  return null;
};
const ConstellationMap = memo(function ConstellationMap2({ data, onArtistClick, onArtistHover, genres, selectedGenre, onGenreChange }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [limit, setLimit] = useState(300);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") setIsFullscreen(false);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (isFullscreen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullscreen, handleKeyDown]);
  const chartData = useMemo(() => {
    const filtered = data.filter((d) => d.followerCount > 0 && d.totalPlays > 0 && d.deltaStreams24h > 0).map((d) => ({
      ...d,
      x: Math.max(1, d.followerCount * (1 + (Math.random() * 0.1 - 0.05))),
      y: Math.max(1, d.deltaStreams24h * (1 + (Math.random() * 0.1 - 0.05))),
      z: Math.max(1, d.alphaScore)
    }));
    return filtered.slice(0, limit);
  }, [data, limit]);
  const handleMouseEnter = (node) => {
    setHoveredNode(node.audiusUserId);
    if (onArtistHover) onArtistHover(node);
  };
  const handleMouseLeave = () => {
    setHoveredNode(null);
    if (onArtistHover) onArtistHover(null);
  };
  const containerClass = isFullscreen ? "fixed inset-0 z-50 bg-[#0A0510] map-container-fullscreen" : "w-full h-[400px] sm:h-[calc(100vh-180px)] glass-panel relative overflow-hidden group map-container-snapped";
  return /* @__PURE__ */ jsxs("div", { className: containerClass, children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 opacity-20 pointer-events-none",
        style: { backgroundImage: "radial-gradient(circle at center, #A855F7 1px, transparent 1px)", backgroundSize: "40px 40px" }
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "absolute top-3 sm:top-4 left-3 sm:left-4 z-10 pr-4 pointer-events-none", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-[10px] sm:text-sm font-bold text-zinc-200 uppercase tracking-widest flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Zap, { className: "w-3.5 h-3.5 sm:w-4 sm:h-4 text-fuchsia-500" }),
        "Discovery Constellation"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-[9px] sm:text-xs text-zinc-500 font-mono mt-0.5 sm:mt-1 leading-tight", children: "X=Followers(Log) | Y=Stream Growth(Log) | Size=Alpha" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 pointer-events-auto flex flex-col gap-1.5 w-[180px] sm:w-[220px]", children: [
        isFullscreen && genres && onGenreChange && /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(SlidersHorizontal, { className: "absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: selectedGenre || "",
              onChange: (e) => onGenreChange(e.target.value),
              className: "w-full pl-6 pr-6 py-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg text-[10px] font-mono text-zinc-200 focus:outline-none focus:border-purple-500/40 appearance-none cursor-pointer transition-all",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All Genres" }),
                genres.map((g) => /* @__PURE__ */ jsx("option", { value: g, children: g }, g))
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute right-2 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none opacity-40", children: "▼" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-zinc-400 font-medium", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Render Limit: ",
            /* @__PURE__ */ jsx("span", { className: "text-zinc-200", children: limit })
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Total: ",
            data.length
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: "1",
            max: Math.max(1, data.length),
            value: limit,
            onChange: (e) => setLimit(Number(e.target.value)),
            className: "w-full accent-purple-500 h-1 sm:h-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-lg appearance-none cursor-pointer backdrop-blur transition-all",
            title: "Adjust number of rendered stars"
          }
        ),
        limit > 500 && /* @__PURE__ */ jsx("span", { className: "text-[8px] sm:text-[9px] text-neon-magenta mt-1 opacity-80 animate-pulse hidden sm:block", children: "⚠ High limits may cause rendering lag" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setIsFullscreen((prev) => !prev),
        className: "absolute top-3 sm:top-4 right-3 sm:right-4 z-10\r\n                    w-8 h-8 sm:w-9 sm:h-9 rounded-lg\r\n                    bg-white/5 backdrop-blur-xl border border-white/10\r\n                    shadow-[0_4px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]\r\n                    flex items-center justify-center\r\n                    text-zinc-400 hover:text-white hover:bg-white/10 hover:border-purple-500/30\r\n                    hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]\r\n                    transition-all duration-300",
        title: isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen",
        children: isFullscreen ? /* @__PURE__ */ jsx(Minimize2, { className: "w-3.5 h-3.5 sm:w-4 sm:h-4" }) : /* @__PURE__ */ jsx(Maximize2, { className: "w-3.5 h-3.5 sm:w-4 sm:h-4" })
      }
    ),
    isFullscreen && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 z-10 \r\n                    px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10\r\n                    text-[10px] font-mono text-zinc-500 pointer-events-none", children: [
      "Press ",
      /* @__PURE__ */ jsx("span", { className: "text-zinc-300 font-bold", children: "ESC" }),
      " to exit fullscreen"
    ] }),
    /* @__PURE__ */ jsx(
      TransformWrapper,
      {
        disabled: !isFullscreen,
        initialScale: 1,
        minScale: 1,
        maxScale: 5,
        centerZoomedOut: true,
        wheel: { step: 0.1 },
        pinch: { step: 5 },
        doubleClick: { disabled: true },
        panning: { disabled: !isFullscreen },
        children: /* @__PURE__ */ jsx("div", { className: "w-full h-full flex-1 [&_.react-transform-wrapper]:w-full [&_.react-transform-wrapper]:h-full [&_.react-transform-component]:w-full [&_.react-transform-component]:h-full", children: /* @__PURE__ */ jsx(TransformComponent, { wrapperClass: "w-full h-full transition-none", contentClass: "w-full h-full transition-none", wrapperStyle: { width: "100%", height: "100%" }, contentStyle: { width: "100%", height: "100%" }, children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "99.9%", height: "100%", children: /* @__PURE__ */ jsxs(ScatterChart, { margin: { top: 50, right: 10, bottom: isFullscreen ? 30 : 10, left: 10 }, children: [
          /* @__PURE__ */ jsx(
            XAxis,
            {
              type: "number",
              dataKey: "x",
              name: "Followers",
              scale: "log",
              domain: ["auto", "auto"],
              tick: { fill: "#52525b", fontSize: 10, fontFamily: "monospace" },
              tickFormatter: (v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}k` : Number(v).toFixed(0),
              axisLine: { stroke: "#27272a" },
              tickLine: false
            }
          ),
          /* @__PURE__ */ jsx(
            YAxis,
            {
              type: "number",
              dataKey: "y",
              name: "24h Stream Growth",
              scale: "log",
              domain: ["auto", "auto"],
              tick: { fill: "#52525b", fontSize: 10, fontFamily: "monospace" },
              tickFormatter: (v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}k` : Number(v).toFixed(0),
              axisLine: { stroke: "#27272a" },
              tickLine: false
            }
          ),
          /* @__PURE__ */ jsx(
            ZAxis,
            {
              type: "number",
              dataKey: "z",
              range: [20, 600],
              name: "Alpha Score"
            }
          ),
          /* @__PURE__ */ jsx(
            Tooltip,
            {
              content: /* @__PURE__ */ jsx(CustomTooltip, {}),
              cursor: { strokeDasharray: "3 3", stroke: "#52525b" }
            }
          ),
          /* @__PURE__ */ jsx(
            Scatter,
            {
              data: chartData,
              onClick: (node) => onArtistClick(node),
              onMouseEnter: handleMouseEnter,
              onMouseLeave: handleMouseLeave,
              animationDuration: isFullscreen ? 1e3 : 0,
              isAnimationActive: true,
              children: chartData.map((entry, index) => {
                const isHighAlpha = entry.alphaScore >= 100;
                const isMidAlpha = entry.alphaScore >= 10 && entry.alphaScore < 100;
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
                return /* @__PURE__ */ jsx(
                  Cell,
                  {
                    fill,
                    stroke,
                    strokeWidth: isHovered ? 2 : 0,
                    style: {
                      transition: "all 0.3s ease",
                      filter: isHighAlpha ? "drop-shadow(0 0 8px rgba(217,70,239,0.8))" : "none",
                      cursor: "pointer"
                    },
                    opacity
                  },
                  `cell-${index}`
                );
              })
            }
          )
        ] }) }, isFullscreen ? "full" : "normal") }) })
      }
    )
  ] });
});

export { ConstellationMap };
