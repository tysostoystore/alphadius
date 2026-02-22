/**
 * Data Ingestion Script
 * Run with: bun run scripts/ingest.ts
 *
 * Fetches trending tracks from Audius, enriches with Birdeye token data,
 * computes Alpha Scores, and stores everything in SQLite.
 */
import { fetchAllTrendingArtists, getTopArtistCoins } from "../src/lib/audius-client";
import { getDb, insertSnapshot, getSnapshotBefore, upsertScore, getLatestSnapshot } from "../src/lib/db";
import { computeDelta, buildScoreRecord } from "../src/lib/scoring";
import type { ArtistSnapshot, ArtistCoinMapping } from "../src/lib/types";
import { readFileSync } from "fs";
import { join } from "path";

// ─── Load artist coin mappings ───────────────────────────────
function loadCoinMappings(): Map<string, ArtistCoinMapping> {
    const map = new Map<string, ArtistCoinMapping>();
    try {
        const raw = readFileSync(
            join(import.meta.dir, "..", "data", "artist_coins.json"),
            "utf-8",
        );
        const mappings: ArtistCoinMapping[] = JSON.parse(raw);
        for (const m of mappings) {
            map.set(m.audiusUserId, m);
            map.set(m.audiusHandle.toLowerCase(), m);
        }
        console.log(`[Ingest] Loaded ${mappings.length} coin mappings`);
    } catch {
        console.warn("[Ingest] No artist_coins.json found. Running without token data.");
    }
    return map;
}

// ─── Main ingestion pipeline ─────────────────────────────────
async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log("  AUDIUS ALPHA SCANNER — Data Ingestion");
    console.log("═══════════════════════════════════════════════\n");

    const db = getDb();
    const coinMappings = loadCoinMappings();
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    // Step 1 & 2: Aggregating artists from multiple sources
    console.log("[Step 1/4] Aggregating artists from Audius...");
    const artists = await fetchAllTrendingArtists();

    // -- INJECT CREATOR --
    console.log("[Step 2.1/4] Injecting creator (toystore) to guarantee presence...");
    try {
        const creatorRes = await fetch("https://api.audius.co/v1/users/QNbNW?app_name=ALPHADIUS");
        const creatorData = await creatorRes.json();
        if (creatorData?.data) {
            const cUser = creatorData.data;
            const tRes = await fetch(`https://api.audius.co/v1/users/${cUser.id}/tracks?app_name=ALPHADIUS&sort_method=plays&limit=1`);
            const tData = await tRes.json();
            if (tData?.data?.[0]) {
                artists.set(cUser.id, {
                    user: cUser,
                    topTrack: tData.data[0]
                });
                console.log(`  → Added toystore (${cUser.id}) to ingestion set`);
            }
        }
    } catch (e) {
        console.warn("  → Failed to inject creator:", e);
    }
    // --------------------

    if (artists.size === 0) {
        console.warn("No trending artists found. Exiting.");
        process.exit(0);
    }

    // Step 2.5: Fetch global Artist Coins map for robust token address matching
    console.log("[Step 2.5/4] Fetching global Artist Coins map...");
    const allCoins = await getTopArtistCoins(1000);
    const audiusCoinMap = new Map<string, any>();
    for (const c of allCoins) {
        if (c.owner_id && c.mint) {
            audiusCoinMap.set(c.owner_id, c);
        }
    }
    console.log(`  → Indexed ${audiusCoinMap.size} native Audius tokens`);

    // Step 3: Enrich with token data & store snapshots
    console.log("\n[Step 3/4] Enriching with token data...");
    let enrichedCount = 0;

    for (const [userId, { user, topTrack }] of artists) {
        const coinMapping =
            coinMappings.get(userId) ??
            coinMappings.get(user.handle.toLowerCase());

        const nativeCoin = audiusCoinMap.get(user.id);
        let tokenAddress: string | null = nativeCoin?.mint ?? user.artist_coin_badge?.mint ?? null;
        if (!tokenAddress && coinMapping) {
            tokenAddress = coinMapping.tokenAddress;
        }

        let tokenPrice: number | null = nativeCoin?.price ?? null;
        let marketCap: number | null = nativeCoin?.marketCap ?? null;
        let totalVolumeUsd: number | null = nativeCoin?.totalVolumeUSD ?? null;
        let holders: number | null = nativeCoin?.holder ?? null;

        if (tokenAddress || nativeCoin) {
            enrichedCount++;
        }

        const snapshot: ArtistSnapshot = {
            audiusUserId: userId,
            handle: user.handle,
            name: user.name,
            followerCount: user.follower_count,
            trackCount: user.track_count,
            totalPlays: topTrack.play_count,
            topTrackId: topTrack.permalink || topTrack.id,
            topTrackTitle: topTrack.title,
            topTrackPlays: topTrack.play_count,
            topTrackGenre: topTrack.genre ?? "Unknown",
            profilePicture: user.profile_picture?.["480x480"] ?? "",
            tokenAddress,
            tokenPrice,
            marketCap,
            totalVolumeUsd,
            holders,
            timestamp: now,
        };

        insertSnapshot(db, snapshot);
    }
    console.log(`  → Enriched ${enrichedCount} artists with token data\n`);

    // Step 4: Compute Alpha Scores
    console.log("[Step 4/4] Computing Alpha Scores...");
    let scoredCount = 0;

    for (const [userId] of artists) {
        const latest = getLatestSnapshot(db, userId);
        if (!latest) continue;

        // Get previous snapshot for delta
        const previous = getSnapshotBefore(db, userId, twentyFourHoursAgo);
        const { deltaStreams24h, deltaStreamsPercent } = computeDelta(latest, previous);

        const scoreRecord = buildScoreRecord(latest, deltaStreams24h, deltaStreamsPercent);
        upsertScore(db, scoreRecord);
        scoredCount++;
    }

    console.log(`  → Computed scores for ${scoredCount} artists\n`);
    console.log("═══════════════════════════════════════════════");
    console.log("  ✅ Ingestion complete!");
    console.log(`  Artists: ${artists.size} | Enriched: ${enrichedCount} | Scored: ${scoredCount}`);
    console.log("═══════════════════════════════════════════════");
}

main().catch((err) => {
    console.error("❌ Ingestion failed:", err);
    process.exit(1);
});
