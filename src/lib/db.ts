import Database from "better-sqlite3";
import type { Database as DatabaseType } from "better-sqlite3";
import path from "node:path";
import process from "node:process";
import type { ArtistSnapshot, AlphaScoreRecord } from "./types";

import fs from "node:fs";

// Dynamically locate the database file. In Vercel serverless functions, the cwd is different.
const getDbPath = () => {
    // 1. Try process.cwd() (Works locally and in some Vercel build steps)
    let dbPath = path.join(process.cwd(), "audius_alpha.db");
    if (fs.existsSync(dbPath)) return dbPath;

    // 2. Try relative to the current file (Often needed for Vercel Serverless output)
    dbPath = path.join(process.cwd(), "..", "..", "..", "..", "audius_alpha.db");
    if (fs.existsSync(dbPath)) return dbPath;

    // Fallback to the default process.cwd() and let sqlite try to create it if we are just testing
    return path.join(process.cwd(), "audius_alpha.db");
};

let _db: DatabaseType | null = null;

export function getDb(): DatabaseType {
    if (!_db) {
        // fileMustExist: false implicitly means it will create if missing
        _db = new Database(getDbPath());
        _db.pragma("journal_mode = WAL");
        _db.pragma("busy_timeout = 5000");
        initSchema(_db);
    }
    return _db;
}

function initSchema(db: DatabaseType): void {
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

// ─── Snapshot Operations ─────────────────────────────────────
export function insertSnapshot(db: DatabaseType, s: ArtistSnapshot): void {
    const stmt = db.prepare(`
    INSERT INTO snapshots (
      audius_user_id, handle, name, follower_count, track_count,
      total_plays, top_track_id, top_track_title, top_track_plays, top_track_genre,
      profile_picture, token_address, token_price, market_cap,
      total_volume_usd, holders, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    stmt.run(
        s.audiusUserId, s.handle, s.name, s.followerCount, s.trackCount,
        s.totalPlays, s.topTrackId, s.topTrackTitle, s.topTrackPlays, s.topTrackGenre,
        s.profilePicture, s.tokenAddress, s.tokenPrice, s.marketCap,
        s.totalVolumeUsd, s.holders, s.timestamp,
    );
}

export function getLatestSnapshot(
    db: DatabaseType,
    userId: string,
): ArtistSnapshot | null {
    const row = db
        .prepare(
            `SELECT * FROM snapshots WHERE audius_user_id = ? ORDER BY timestamp DESC LIMIT 1`,
        )
        .get(userId) as Record<string, unknown> | null;
    if (!row) return null;
    return rowToSnapshot(row);
}

export function getSnapshotBefore(
    db: DatabaseType,
    userId: string,
    beforeTimestamp: number,
): ArtistSnapshot | null {
    const row = db
        .prepare(
            `SELECT * FROM snapshots WHERE audius_user_id = ? AND timestamp <= ? ORDER BY timestamp DESC LIMIT 1`,
        )
        .get(userId, beforeTimestamp) as Record<string, unknown> | null;
    if (!row) return null;
    return rowToSnapshot(row);
}

function rowToSnapshot(row: Record<string, unknown>): ArtistSnapshot {
    return {
        id: row.id as number,
        audiusUserId: row.audius_user_id as string,
        handle: row.handle as string,
        name: row.name as string,
        followerCount: row.follower_count as number,
        trackCount: row.track_count as number,
        totalPlays: row.total_plays as number,
        topTrackId: row.top_track_id as string,
        topTrackTitle: row.top_track_title as string,
        topTrackPlays: row.top_track_plays as number,
        topTrackGenre: row.top_track_genre as string,
        profilePicture: row.profile_picture as string,
        tokenAddress: row.token_address as string | null,
        tokenPrice: row.token_price as number | null,
        marketCap: row.market_cap as number | null,
        totalVolumeUsd: row.total_volume_usd as number | null,
        holders: row.holders as number | null,
        timestamp: row.timestamp as number,
    };
}

// ─── Score Operations ────────────────────────────────────────
export function upsertScore(db: DatabaseType, s: AlphaScoreRecord): void {
    // Delete old score for this user, keep only latest
    db.prepare(`DELETE FROM scores WHERE audius_user_id = ?`).run(s.audiusUserId);

    const stmt = db.prepare(`
    INSERT INTO scores (
      audius_user_id, handle, name, profile_picture,
      top_track_id, top_track_title, top_track_genre,
      follower_count, total_plays, top_track_plays,
      delta_streams_24h, delta_streams_percent,
      token_address, token_price, market_cap,
      total_volume_usd, holders,
      alpha_score, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    stmt.run(
        s.audiusUserId, s.handle, s.name, s.profilePicture,
        s.topTrackId, s.topTrackTitle, s.topTrackGenre,
        s.followerCount, s.totalPlays, s.topTrackPlays,
        s.deltaStreams24h, s.deltaStreamsPercent,
        s.tokenAddress, s.tokenPrice, s.marketCap,
        s.totalVolumeUsd, s.holders,
        s.alphaScore, s.timestamp,
    );
}

export function queryScores(
    db: DatabaseType,
    options: {
        sort?: string;
        order?: string;
        genre?: string;
        search?: string;
        minMC?: number;
        maxMC?: number;
        limit?: number;
        offset?: number;
    } = {},
): AlphaScoreRecord[] {
    const {
        sort = "alpha_score",
        order = "desc",
        genre,
        search,
        minMC,
        maxMC,
        limit = 100,
        offset = 0,
    } = options;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (genre) {
        conditions.push("top_track_genre = ?");
        params.push(genre);
    }
    if (search) {
        conditions.push("(name LIKE ? OR handle LIKE ?)");
        const likeTerm = `%${search}%`;
        params.push(likeTerm, likeTerm);
    }
    if (minMC !== undefined) {
        conditions.push("(market_cap IS NULL OR market_cap >= ?)");
        params.push(minMC);
    }
    if (maxMC !== undefined) {
        conditions.push("(market_cap IS NULL OR market_cap <= ?)");
        params.push(maxMC);
    }

    const columnMap: Record<string, string> = {
        alpha_score: "alpha_score",
        market_cap: "market_cap",
        delta_streams: "delta_streams_24h",
        follower_count: "follower_count",
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

    const rows = db.prepare(sql).all(...(params as any[])) as Record<string, unknown>[];
    return rows.map(rowToScore);
}

function rowToScore(row: Record<string, unknown>): AlphaScoreRecord {
    return {
        id: row.id as number,
        audiusUserId: row.audius_user_id as string,
        handle: row.handle as string,
        name: row.name as string,
        profilePicture: row.profile_picture as string,
        topTrackId: row.top_track_id as string,
        topTrackTitle: row.top_track_title as string,
        topTrackGenre: row.top_track_genre as string,
        followerCount: row.follower_count as number,
        totalPlays: row.total_plays as number,
        topTrackPlays: row.top_track_plays as number,
        deltaStreams24h: row.delta_streams_24h as number,
        deltaStreamsPercent: row.delta_streams_percent as number,
        tokenAddress: row.token_address as string | null,
        tokenPrice: row.token_price as number | null,
        marketCap: row.market_cap as number | null,
        totalVolumeUsd: row.total_volume_usd as number | null,
        holders: row.holders as number | null,
        alphaScore: row.alpha_score as number,
        timestamp: row.timestamp as number,
    };
}

export function getDistinctGenres(db: DatabaseType): string[] {
    const rows = db
        .prepare(
            `SELECT DISTINCT top_track_genre FROM scores WHERE top_track_genre != '' ORDER BY top_track_genre`,
        )
        .all() as Record<string, unknown>[];
    return rows.map((r) => r.top_track_genre as string);
}
