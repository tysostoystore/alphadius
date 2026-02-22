import Database from 'better-sqlite3';
import nodePath from 'node:path';
import process from 'node:process';
import { z } from 'zod';
export { renderers } from '../../renderers.mjs';

const DB_PATH = nodePath.join(process.cwd(), "audius_alpha.db");
let _db = null;
function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("busy_timeout = 5000");
    initSchema(_db);
  }
  return _db;
}
function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audius_user_id TEXT NOT NULL,
      handle TEXT NOT NULL,
      name TEXT NOT NULL,
      follower_count INTEGER NOT NULL DEFAULT 0,
      track_count INTEGER NOT NULL DEFAULT 0,
      total_plays INTEGER NOT NULL DEFAULT 0,
      top_track_id TEXT NOT NULL DEFAULT '',
      top_track_title TEXT NOT NULL DEFAULT '',
      top_track_plays INTEGER NOT NULL DEFAULT 0,
      top_track_genre TEXT NOT NULL DEFAULT '',
      profile_picture TEXT NOT NULL DEFAULT '',
      token_address TEXT,
      token_price REAL,
      market_cap REAL,
      total_volume_usd REAL,
      holders INTEGER,
      timestamp INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_user_id ON snapshots(audius_user_id);
    CREATE INDEX IF NOT EXISTS idx_snapshots_timestamp ON snapshots(timestamp);
    CREATE INDEX IF NOT EXISTS idx_snapshots_user_time ON snapshots(audius_user_id, timestamp);

    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audius_user_id TEXT NOT NULL,
      handle TEXT NOT NULL,
      name TEXT NOT NULL,
      profile_picture TEXT NOT NULL DEFAULT '',
      top_track_id TEXT NOT NULL DEFAULT '',
      top_track_title TEXT NOT NULL DEFAULT '',
      top_track_genre TEXT NOT NULL DEFAULT '',
      follower_count INTEGER NOT NULL DEFAULT 0,
      total_plays INTEGER NOT NULL DEFAULT 0,
      top_track_plays INTEGER NOT NULL DEFAULT 0,
      delta_streams_24h INTEGER NOT NULL DEFAULT 0,
      delta_streams_percent REAL NOT NULL DEFAULT 0,
      token_address TEXT,
      token_price REAL,
      market_cap REAL,
      total_volume_usd REAL,
      holders INTEGER,
      alpha_score REAL NOT NULL DEFAULT 0,
      timestamp INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_scores_alpha ON scores(alpha_score DESC);
    CREATE INDEX IF NOT EXISTS idx_scores_timestamp ON scores(timestamp);
    CREATE INDEX IF NOT EXISTS idx_scores_genre ON scores(top_track_genre);
    CREATE INDEX IF NOT EXISTS idx_scores_name ON scores(name);
    CREATE INDEX IF NOT EXISTS idx_scores_handle ON scores(handle);
  `);
}
function queryScores(db, options = {}) {
  const {
    sort = "alpha_score",
    order = "desc",
    genre,
    search,
    minMC,
    maxMC,
    limit = 100,
    offset = 0
  } = options;
  const conditions = [];
  const params = [];
  if (genre) {
    conditions.push("top_track_genre = ?");
    params.push(genre);
  }
  if (search) {
    conditions.push("(name LIKE ? OR handle LIKE ?)");
    const likeTerm = `%${search}%`;
    params.push(likeTerm, likeTerm);
  }
  if (minMC !== void 0) {
    conditions.push("(market_cap IS NULL OR market_cap >= ?)");
    params.push(minMC);
  }
  if (maxMC !== void 0) {
    conditions.push("(market_cap IS NULL OR market_cap <= ?)");
    params.push(maxMC);
  }
  const columnMap = {
    alpha_score: "alpha_score",
    market_cap: "market_cap",
    delta_streams: "delta_streams_24h",
    follower_count: "follower_count"
  };
  const sortColumn = columnMap[sort] || "alpha_score";
  const sortOrder = order === "asc" ? "ASC" : "DESC";
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT * FROM scores
    ${where}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);
  const rows = db.prepare(sql).all(...params);
  return rows.map(rowToScore);
}
function rowToScore(row) {
  return {
    id: row.id,
    audiusUserId: row.audius_user_id,
    handle: row.handle,
    name: row.name,
    profilePicture: row.profile_picture,
    topTrackId: row.top_track_id,
    topTrackTitle: row.top_track_title,
    topTrackGenre: row.top_track_genre,
    followerCount: row.follower_count,
    totalPlays: row.total_plays,
    topTrackPlays: row.top_track_plays,
    deltaStreams24h: row.delta_streams_24h,
    deltaStreamsPercent: row.delta_streams_percent,
    tokenAddress: row.token_address,
    tokenPrice: row.token_price,
    marketCap: row.market_cap,
    totalVolumeUsd: row.total_volume_usd,
    holders: row.holders,
    alphaScore: row.alpha_score,
    timestamp: row.timestamp
  };
}
function getDistinctGenres(db) {
  const rows = db.prepare(
    `SELECT DISTINCT top_track_genre FROM scores WHERE top_track_genre != '' ORDER BY top_track_genre`
  ).all();
  return rows.map((r) => r.top_track_genre);
}

const AudiusUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  bio: z.string().nullable().optional(),
  follower_count: z.number(),
  followee_count: z.number(),
  track_count: z.number(),
  repost_count: z.number(),
  is_verified: z.boolean(),
  profile_picture: z.object({
    "150x150": z.string().optional(),
    "480x480": z.string().optional(),
    "1000x1000": z.string().optional()
  }).nullable().optional(),
  cover_photo: z.object({
    "640x": z.string().optional(),
    "2000x": z.string().optional()
  }).nullable().optional(),
  artist_coin_badge: z.object({
    mint: z.string(),
    ticker: z.string()
  }).nullable().optional(),
  spl_wallet: z.string().nullable().optional(),
  erc_wallet: z.string().nullable().optional(),
  supporter_count: z.number().optional(),
  supporting_count: z.number().optional(),
  total_audio_balance: z.number().optional(),
  twitter_handle: z.string().nullable().optional(),
  instagram_handle: z.string().nullable().optional(),
  tiktok_handle: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  website: z.string().nullable().optional()
});
const AudiusTrackSchema = z.object({
  id: z.string(),
  title: z.string(),
  genre: z.string().optional(),
  mood: z.string().nullable().optional(),
  play_count: z.number(),
  repost_count: z.number(),
  favorite_count: z.number(),
  comment_count: z.number().optional(),
  duration: z.number().nullable().optional(),
  permalink: z.string().optional(),
  artwork: z.object({
    "150x150": z.string().optional(),
    "480x480": z.string().optional(),
    "1000x1000": z.string().optional()
  }).optional(),
  user: AudiusUserSchema,
  release_date: z.string().nullable().optional(),
  tags: z.string().nullable().optional(),
  is_downloadable: z.boolean().optional()
});
z.object({
  data: z.array(AudiusTrackSchema).nullable().optional()
});
z.object({
  data: AudiusUserSchema
});
const AlphaFeedQuerySchema = z.object({
  sort: z.enum(["alpha_score", "market_cap", "delta_streams", "follower_count"]).default("alpha_score"),
  order: z.enum(["asc", "desc"]).default("desc"),
  genre: z.string().optional(),
  search: z.string().optional(),
  minMC: z.coerce.number().optional(),
  maxMC: z.coerce.number().optional(),
  limit: z.coerce.number().min(1).max(1e4).default(100),
  offset: z.coerce.number().min(0).default(0)
});

function generateAlerts(scores) {
  const alerts = [];
  const now = Date.now();
  const sorted = [...scores].sort((a, b) => b.alphaScore - a.alphaScore);
  for (const s of sorted.slice(0, 5)) {
    if (s.totalPlays >= 1e4 && s.followerCount < 5e3) {
      alerts.push({
        type: "gem",
        message: `${s.name} has ${formatNumber(s.totalPlays)} plays but only ${formatNumber(s.followerCount)} followers — hidden gem!`,
        artistId: s.audiusUserId,
        artistName: s.name,
        artistHandle: s.handle,
        profilePicture: s.profilePicture,
        timestamp: now
      });
    } else if (s.totalPlays >= 1e3) {
      alerts.push({
        type: "velocity",
        message: `${s.name} trending with ${formatNumber(s.totalPlays)} plays (α: ${s.alphaScore.toFixed(1)})`,
        artistId: s.audiusUserId,
        artistName: s.name,
        artistHandle: s.handle,
        profilePicture: s.profilePicture,
        timestamp: now
      });
    }
  }
  for (const s of scores) {
    if (s.marketCap !== null && s.marketCap < 1e4 && s.totalPlays > 5e3) {
      alerts.push({
        type: "opportunity",
        message: `${s.name} has ${formatNumber(s.totalPlays)} streams but MC is only $${formatNumber(s.marketCap)}!`,
        artistId: s.audiusUserId,
        artistName: s.name,
        artistHandle: s.handle,
        profilePicture: s.profilePicture,
        timestamp: now
      });
    }
  }
  if (alerts.length === 0) {
    alerts.push({
      type: "info",
      message: `📡 Scanned ${scores.length} trending artists on Audius`,
      timestamp: now
    });
    if (sorted.length > 0 && sorted[0]) {
      alerts.push({
        type: "info",
        message: `🏆 Top alpha: ${sorted[0].name} (α: ${sorted[0].alphaScore.toFixed(1)})`,
        artistId: sorted[0].audiusUserId,
        artistName: sorted[0].name,
        artistHandle: sorted[0].handle,
        profilePicture: sorted[0].profilePicture,
        timestamp: now
      });
      const totalPlays = scores.reduce((sum, s) => sum + s.totalPlays, 0);
      alerts.push({
        type: "info",
        message: `🎵 Total tracked plays: ${formatNumber(totalPlays)}`,
        timestamp: now
      });
    }
  }
  return alerts;
}
function formatNumber(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
}

const GET = async ({ url }) => {
  try {
    const params = Object.fromEntries(url.searchParams.entries());
    const parsed = AlphaFeedQuerySchema.safeParse(params);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: parsed.error.issues
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const db = getDb();
    const scores = queryScores(db, parsed.data);
    const genres = getDistinctGenres(db);
    const alerts = generateAlerts(scores);
    return new Response(
      JSON.stringify({
        data: scores,
        meta: {
          total: scores.length,
          genres,
          alerts: alerts.slice(0, 10),
          query: parsed.data,
          timestamp: Date.now()
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=30"
        }
      }
    );
  } catch (err) {
    console.error("[API] alpha-feed error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
