import { z } from "zod";

// ─── Audius API Schemas ──────────────────────────────────────
export const AudiusUserSchema = z.object({
    id: z.string(),
    name: z.string(),
    handle: z.string(),
    bio: z.string().nullable().optional(),
    follower_count: z.number(),
    followee_count: z.number(),
    track_count: z.number(),
    repost_count: z.number(),
    is_verified: z.boolean(),
    profile_picture: z
        .object({
            "150x150": z.string().optional(),
            "480x480": z.string().optional(),
            "1000x1000": z.string().optional(),
        })
        .nullable()
        .optional(),
    cover_photo: z
        .object({
            "640x": z.string().optional(),
            "2000x": z.string().optional(),
        })
        .nullable()
        .optional(),
    artist_coin_badge: z
        .object({
            mint: z.string(),
            ticker: z.string(),
        })
        .nullable()
        .optional(),
    spl_wallet: z.string().nullable().optional(),
    erc_wallet: z.string().nullable().optional(),
    supporter_count: z.number().optional(),
    supporting_count: z.number().optional(),
    total_audio_balance: z.number().optional(),
    twitter_handle: z.string().nullable().optional(),
    instagram_handle: z.string().nullable().optional(),
    tiktok_handle: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
});

export type AudiusUser = z.infer<typeof AudiusUserSchema>;

export const AudiusTrackSchema = z.object({
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
    artwork: z
        .object({
            "150x150": z.string().optional(),
            "480x480": z.string().optional(),
            "1000x1000": z.string().optional(),
        })
        .optional(),
    user: AudiusUserSchema,
    release_date: z.string().nullable().optional(),
    tags: z.string().nullable().optional(),
    is_downloadable: z.boolean().optional(),
});

export type AudiusTrack = z.infer<typeof AudiusTrackSchema>;

export const AudiusTrendingResponseSchema = z.object({
    data: z.array(AudiusTrackSchema).nullable().optional(),
});

export const AudiusUserResponseSchema = z.object({
    data: AudiusUserSchema,
});

// ─── Internal Schemas ────────────────────────────────────────
export interface ArtistCoinMapping {
    audiusUserId: string;
    audiusHandle: string;
    tokenAddress: string;
    symbol?: string;
}

export interface ArtistSnapshot {
    id?: number;
    audiusUserId: string;
    handle: string;
    name: string;
    followerCount: number;
    trackCount: number;
    totalPlays: number;
    topTrackId: string;
    topTrackTitle: string;
    topTrackPlays: number;
    topTrackGenre: string;
    profilePicture: string;
    tokenAddress: string | null;
    tokenPrice: number | null;
    marketCap: number | null;
    totalVolumeUsd: number | null;
    holders: number | null;
    timestamp: number;
}

export interface AlphaScoreRecord {
    id?: number;
    audiusUserId: string;
    handle: string;
    name: string;
    profilePicture: string;
    topTrackId: string;
    topTrackTitle: string;
    topTrackGenre: string;
    followerCount: number;
    totalPlays: number;
    topTrackPlays: number;
    deltaStreams24h: number;
    deltaStreamsPercent: number;
    tokenAddress: string | null;
    tokenPrice: number | null;
    marketCap: number | null;
    totalVolumeUsd: number | null;
    holders: number | null;
    alphaScore: number;
    timestamp: number;
}

export interface AlphaAlert {
    type: "gem" | "velocity" | "opportunity" | "info";
    message: string;
    artistId?: string;
    artistName?: string;
    artistHandle?: string;
    profilePicture?: string;
    timestamp: number;
}

export interface AlphaFeedResponse {
    data: AlphaScoreRecord[];
    meta: {
        total: number;
        genres: string[];
        alerts: AlphaAlert[];
        query: any;
        timestamp: number;
    };
}

// ─── API Query Schemas ───────────────────────────────────────
export const AlphaFeedQuerySchema = z.object({
    sort: z
        .enum(["alpha_score", "market_cap", "delta_streams", "delta_streams_pct", "total_plays", "follower_count"])
        .default("alpha_score"),
    order: z.enum(["asc", "desc"]).default("desc"),
    genre: z.string().optional(),
    search: z.string().optional(),
    minMC: z.coerce.number().optional(),
    maxMC: z.coerce.number().optional(),
    limit: z.coerce.number().min(1).max(10000).default(100),
    offset: z.coerce.number().min(0).default(0),
});

export type AlphaFeedQuery = z.infer<typeof AlphaFeedQuerySchema>;
