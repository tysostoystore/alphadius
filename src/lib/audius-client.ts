import {
    AudiusTrendingResponseSchema,
    AudiusUserResponseSchema,
    type AudiusTrack,
    type AudiusUser,
} from "./types";

const AUDIUS_HOST =
    import.meta.env?.AUDIUS_API_HOST ??
    process.env.AUDIUS_API_HOST ??
    "https://discoveryprovider.audius.co";

const AUDIUS_KEY =
    import.meta.env?.AUDIUS_API_KEY ?? process.env.AUDIUS_API_KEY ?? "";

// ─── Retry logic with exponential backoff ────────────────────
async function fetchWithRetry(
    url: string,
    maxRetries: number = 3,
): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const res = await fetch(url, {
                headers: {
                    Accept: "application/json",
                    ...(AUDIUS_KEY ? { "X-API-Key": AUDIUS_KEY } : {}),
                },
            });

            if (res.status === 429) {
                const wait = Math.pow(2, attempt) * 1000 + Math.random() * 500;
                console.warn(
                    `[Audius] Rate limited (429). Retry ${attempt + 1}/${maxRetries} in ${Math.round(wait)}ms`,
                );
                await new Promise((r) => setTimeout(r, wait));
                continue;
            }

            if (res.status >= 500) {
                const wait = Math.pow(2, attempt) * 1000 + Math.random() * 500;
                console.warn(
                    `[Audius] Server error (${res.status}). Retry ${attempt + 1}/${maxRetries} in ${Math.round(wait)}ms`,
                );
                await new Promise((r) => setTimeout(r, wait));
                continue;
            }

            return res;
        } catch (err) {
            lastError = err as Error;
            const wait = Math.pow(2, attempt) * 1000;
            console.warn(
                `[Audius] Fetch error: ${(err as Error).message}. Retry ${attempt + 1}/${maxRetries} in ${wait}ms`,
            );
            await new Promise((r) => setTimeout(r, wait));
        }
    }

    throw lastError ?? new Error("Audius API request failed after retries");
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Get top trending tracks (up to 100).
 */
export async function getTrendingTracks(
    time: "week" | "month" | "year" | "allTime" = "week",
    genre?: string,
    limit: number = 100,
    offset: number = 0
): Promise<AudiusTrack[]> {
    const params = new URLSearchParams({ time, limit: String(limit), offset: String(offset) });
    if (genre) params.set("genre", genre);

    const url = `${AUDIUS_HOST}/v1/tracks/trending?${params}`;
    console.log(`[Audius] Fetching trending tracks: ${url}`);

    const res = await fetchWithRetry(url);
    const json = await res.json();
    const parsed = AudiusTrendingResponseSchema.safeParse(json);

    if (!parsed.success) {
        console.error("[Audius] Invalid trending response:", parsed.error.issues);
        return [];
    }

    return parsed.data.data ?? [];
}

/**
 * Get underground trending tracks.
 */
export async function getUndergroundTrending(
    limit: number = 100,
    offset: number = 0
): Promise<AudiusTrack[]> {
    const url = `${AUDIUS_HOST}/v1/tracks/trending/underground?limit=${limit}&offset=${offset}`;
    console.log(`[Audius] Fetching underground trending: ${url}`);

    try {
        const res = await fetchWithRetry(url);
        const json = await res.json();
        const parsed = AudiusTrendingResponseSchema.safeParse(json);
        if (!parsed.success) return [];
        return parsed.data.data ?? [];
    } catch {
        console.warn("[Audius] Underground trending unavailable, skipping");
        return [];
    }
}

/**
 * Search for tracks by query.
 */
export async function searchTracks(
    query: string,
    limit: number = 50,
): Promise<AudiusTrack[]> {
    const params = new URLSearchParams({ query, limit: String(limit) });
    const url = `${AUDIUS_HOST}/v1/tracks/search?${params}`;

    try {
        const res = await fetchWithRetry(url);
        const json = await res.json();
        const parsed = AudiusTrendingResponseSchema.safeParse(json);
        if (!parsed.success) return [];
        return parsed.data.data ?? [];
    } catch {
        return [];
    }
}

/**
 * Get a user by their Audius ID.
 */
export async function getUser(userId: string): Promise<AudiusUser | null> {
    const url = `${AUDIUS_HOST}/v1/users/${userId}`;
    const res = await fetchWithRetry(url);
    const json = await res.json();
    const parsed = AudiusUserResponseSchema.safeParse(json);

    if (!parsed.success) {
        console.error(`[Audius] Invalid user response for ${userId}:`, parsed.error.issues);
        return null;
    }

    return parsed.data.data;
}

/**
 * Search users by name.
 */
export async function searchUsers(
    query: string,
    limit: number = 50,
    offset: number = 0
): Promise<AudiusUser[]> {
    const params = new URLSearchParams({ query, limit: String(limit), offset: String(offset) });
    const url = `${AUDIUS_HOST}/v1/users/search?${params}`;

    try {
        const res = await fetchWithRetry(url);
        const json = await res.json();
        if (json?.data && Array.isArray(json.data)) {
            return json.data;
        }
    } catch {
        // Ignore search errors
    }
    return [];
}

/**
 * Get tracks for a user.
 */
export async function getUserTracks(
    userId: string,
    limit: number = 10,
    sortMethod: "date" | "plays" = "plays",
): Promise<AudiusTrack[]> {
    const params = new URLSearchParams({
        limit: "50", // Fetch extra to filter out reposts from other artists
        sort_method: sortMethod,
    });
    const url = `${AUDIUS_HOST}/v1/users/${userId}/tracks?${params}`;
    const res = await fetchWithRetry(url);
    const json = await res.json();

    if (json?.data && Array.isArray(json.data)) {
        // Audius API sometimes includes reposts/remixes by other users in this endpoint.
        // We strictly enforce that the track.user.id MUST match the requested userId.
        const ownTracks = json.data.filter((t: any) => t?.user?.id === userId);
        return ownTracks.slice(0, limit);
    }
    return [];
}

/**
 * Fetch undocumented /v1/coins endpoint to get top artist coins.
 */
export async function getTopArtistCoins(limit: number = 50): Promise<any[]> {
    const url = `${AUDIUS_HOST}/v1/coins`;
    console.log(`[Audius] Fetching all artist coins: ${url}`);

    try {
        const res = await fetchWithRetry(url);
        const json = await res.json();

        if (json?.data && Array.isArray(json.data)) {
            // Filter out AUDIO token and coins with 0 market cap
            const coins = json.data.filter((c: any) =>
                c && typeof c.owner_id === 'string' && c.ticker !== "AUDIO" && c.marketCap > 0
            );
            // Sort by Market Cap descending
            coins.sort((a: any, b: any) => (b.marketCap || 0) - (a.marketCap || 0));

            const top = coins.slice(0, limit);
            console.log(`  → Found ${top.length} top artist coins`);
            return top;
        }
    } catch (e) {
        console.warn("[Audius] Error fetching coins:", e);
    }
    return [];
}

/**
 * Extract unique artists from tracks, merging with existing map.
 */
export function extractUniqueArtists(
    tracks: AudiusTrack[],
    existing?: Map<string, { user: AudiusUser; topTrack: AudiusTrack }>,
): Map<string, { user: AudiusUser; topTrack: AudiusTrack }> {
    const artists = existing ?? new Map<string, { user: AudiusUser; topTrack: AudiusTrack }>();

    for (const track of tracks) {
        const current = artists.get(track.user.id);
        if (!current || track.play_count > current.topTrack.play_count) {
            artists.set(track.user.id, {
                user: track.user,
                topTrack: track,
            });
        }
    }

    return artists;
}

// Audius genre slugs for discovery
const AUDIUS_GENRES = [
    "Electronic",
    "Hip-Hop/Rap",
    "Pop",
    "R&B/Soul",
    "House",
    "Dubstep",
    "Rock",
    "Alternative",
    "Trap",
    "Lofi",
    "Techno",
    "Drum & Bass",
    "Experimental",
    "Ambient",
];

/**
 * Aggregate artists from all available sources:
 * - Trending (week, month)
 * - Underground trending
 * - Genre-specific trending
 * Returns a combined, deduplicated map of artists.
 */
export async function fetchAllTrendingArtists(): Promise<
    Map<string, { user: AudiusUser; topTrack: AudiusTrack }>
> {
    let artists = new Map<string, { user: AudiusUser; topTrack: AudiusTrack }>();

    // 1. Trending by time range (High Quality)
    console.log(`[Audius] Fetching Trending Tracks...`);
    for (const time of ["week", "month"] as const) {
        for (let offset = 0; offset < 500; offset += 100) {
            const tracks = await getTrendingTracks(time, undefined, 100, offset);
            if (tracks.length === 0) break;
            artists = extractUniqueArtists(tracks, artists);
            await new Promise((r) => setTimeout(r, 200));
        }
    }

    // 2. Underground trending (High Discovery)
    console.log(`[Audius] Fetching Underground...`);
    for (let offset = 0; offset < 500; offset += 100) {
        const underground = await getUndergroundTrending(100, offset);
        if (underground.length === 0) break;
        artists = extractUniqueArtists(underground, artists);
        await new Promise((r) => setTimeout(r, 200));
    }



    // 3. Deep Alphabet & Number Search (Massive Scale — Parallelized)
    console.log(`[Audius] Fetching via Deep Alphanumeric Search for massive scale...`);
    const searchChars = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
    for (const char of searchChars) {
        console.log(`  → Searching character: [ ${char.toUpperCase()} ]`);

        // MAXIMUM deep pagination for each character (10 pages * 100 results)
        // Audius API usually caps offset+limit at 1000-2000. We push it to 1000.
        for (let offset = 0; offset <= 1000; offset += 100) {
            const users = await searchUsers(char, 100, offset);
            if (users.length === 0) break; // Exhausted this character

            // Lower threshold to capture maximum emerging artists
            const activeUsers = users.filter(u => u.follower_count > 10 && u.track_count > 0);
            const newUsers = activeUsers.filter(u => !artists.has(u.id));

            // Fetch tracks in larger parallel batches of 10
            for (let i = 0; i < newUsers.length; i += 10) {
                const batch = newUsers.slice(i, i + 10);
                const results = await Promise.allSettled(
                    batch.map(async (user) => {
                        const tracks = await getUserTracks(user.id, 1, "plays");
                        if (tracks && tracks.length > 0) {
                            return { user, topTrack: tracks[0] as unknown as AudiusTrack };
                        }
                        return null;
                    })
                );
                for (const result of results) {
                    if (result.status === "fulfilled" && result.value) {
                        artists.set(result.value.user.id, result.value);
                    }
                }
                // Very short pause to balance speed vs rate-limit
                await new Promise((r) => setTimeout(r, 20));
            }
        }
    }

    // 4. Genre-specific trending — parallel by genre pairs
    console.log(`[Audius] Fetching Genre Trending...`);
    for (let g = 0; g < AUDIUS_GENRES.length; g += 2) {
        const batch = AUDIUS_GENRES.slice(g, g + 2);
        const results = await Promise.allSettled(
            batch.map(async (genre) => {
                const allTracks: AudiusTrack[] = [];
                for (let offset = 0; offset < 200; offset += 100) {
                    const tracks = await getTrendingTracks("week", genre, 100, offset);
                    allTracks.push(...tracks);
                }
                return allTracks;
            })
        );
        for (const result of results) {
            if (result.status === "fulfilled") {
                artists = extractUniqueArtists(result.value, artists);
            }
        }
        await new Promise((r) => setTimeout(r, 200));
    }

    // 4.5 Normalize ALL Aggregated Artists (CRITICAL FIX for Fake +32000% Growth)
    // Trending APIs (Global, Underground, and Genre) return the *specifically trending* track, 
    // which might only have 10 plays.
    // If we don't normalize this, tomorrow the Deep Alphabet Search might find their
    // true all-time top track (e.g. 32k plays), causing a fake +320,000% delta explosion.
    // We MUST normalize ALL trending artists to their true all-time #1 track before saving to DB.
    console.log(`[Audius] Normalizing ${artists.size} aggregated artists to their true all-time top track...`);
    const aggregatedUsers = Array.from(artists.values()).map(a => a.user);
    for (let i = 0; i < aggregatedUsers.length; i += 10) {
        const batch = aggregatedUsers.slice(i, i + 10);
        const results = await Promise.allSettled(
            batch.map(async (user) => {
                const tracks = await getUserTracks(user.id, 1, "plays");
                if (tracks && tracks.length > 0) {
                    return { user, topTrack: tracks[0] as unknown as AudiusTrack };
                }
                return null;
            })
        );
        for (const result of results) {
            if (result.status === "fulfilled" && result.value) {
                // Overwrite the trending track with their true all-time #1 track
                artists.set(result.value.user.id, result.value);
            }
        }
        await new Promise((r) => setTimeout(r, 20));
    }

    // 5. Incorporate Top Artists with Artist Coins — parallel batches
    console.log(`\n[Audius] Fetching Top Artist Coins...`);
    const topCoins = await getTopArtistCoins(250);
    const newCoins = topCoins.filter(c => !artists.has(c.owner_id));
    for (let i = 0; i < newCoins.length; i += 5) {
        const batch = newCoins.slice(i, i + 5);
        const results = await Promise.allSettled(
            batch.map(async (coin) => {
                const user = await getUser(coin.owner_id);
                if (!user) return null;
                const tracks = await getUserTracks(user.id, 1, "plays");
                if (!tracks || tracks.length === 0) return null;
                return { user, topTrack: tracks[0] as unknown as AudiusTrack };
            })
        );
        for (const result of results) {
            if (result.status === "fulfilled" && result.value) {
                artists.set(result.value.user.id, result.value);
            }
        }
        await new Promise(r => setTimeout(r, 100));
    }

    console.log(`\n[Audius] Total unique artists aggregated: ${artists.size}\n`);
    return artists;
}
