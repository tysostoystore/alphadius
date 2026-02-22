import type { ArtistSnapshot, AlphaScoreRecord, AlphaAlert } from "./types";

/**
 * ═══════════════════════════════════════════════════════════════
 *  ALPHA SCORE — Multi-Factor Discovery Formula
 * ═══════════════════════════════════════════════════════════════
 *
 *  Alpha = Engagement × Momentum × Gravity × MarketBoost
 *
 *  Three pillars measuring musical "alpha":
 *
 *  1. ENGAGEMENT  — "Undervalued" signal
 *     sqrt(totalPlays / (followers + 100))
 *     High ratio = people listen but haven't followed = discovery gold
 *
 *  2. MOMENTUM    — "Growing right now" signal
 *     log2(velocity + 2)
 *     Captures current growth trajectory; log dampens viral spikes
 *
 *  3. GRAVITY     — "Proven mass" signal
 *     log10(totalPlays + 1)
 *     Ensures artists with real listeners outrank zero-play accounts
 *
 *  Bonus: MARKET DIVERGENCE — minor financial "alpha" (max +30%)
 *     When streams dramatically outpace market cap
 *
 *  Design goal: Hidden gems (100K plays / 200 followers) score ~1100,
 *  big established artists (1M plays / 100K followers) score ~300.
 *  ALPHADIUS finds the NEXT star, not the current one.
 * ═══════════════════════════════════════════════════════════════
 */
export function calculateAlphaScore(
    totalPlays: number,
    followerCount: number,
    velocity: number,
    marketCapUsd: number | null,
): number {
    const plays = Math.max(totalPlays, 0);
    const followers = Math.max(followerCount, 0);
    const vel = Math.max(velocity, 0);

    if (plays === 0) return 0;

    // ── Pillar 1: Engagement Ratio ──
    // sqrt compresses the ratio to prevent extreme outliers
    const engagement = Math.sqrt(plays / (followers + 100));

    // ── Pillar 2: Momentum ──
    // log2 for smooth scaling; +2 ensures minimum value of 1
    const momentum = Math.log2(vel + 2);

    // ── Pillar 3: Gravity ──
    // log10 of total plays — proof of real listeners
    const gravity = Math.log10(plays + 1);

    // ── Bonus: Market Cap Divergence ──
    // Slight boost when streams outpace market cap
    // Capped at 1.3x (max 30% bonus) to keep it music-first
    let marketBoost = 1.0;
    if (marketCapUsd != null && marketCapUsd > 0) {
        const divergence = plays / (marketCapUsd + 1000);
        marketBoost = 1 + 0.1 * Math.min(divergence, 3);
    }

    return engagement * momentum * gravity * marketBoost;
}

/**
 * Compute delta streams between two snapshots.
 * On cold start (no previous), uses 5% of totalPlays as a conservative
 * velocity estimate to avoid inflating scores on first ingestion.
 */
export function computeDelta(
    current: ArtistSnapshot,
    previous: ArtistSnapshot | null,
): { deltaStreams24h: number; deltaStreamsPercent: number; isColdStart: boolean } {
    if (!previous) {
        // Cold start: conservative 5% velocity assumption
        return {
            deltaStreams24h: Math.floor(current.totalPlays * 0.05),
            deltaStreamsPercent: 0,
            isColdStart: true,
        };
    }

    const delta = current.totalPlays - previous.totalPlays;
    const percent =
        previous.totalPlays > 0
            ? ((delta / previous.totalPlays) * 100)
            : 0;

    return {
        deltaStreams24h: Math.max(delta, 0),
        deltaStreamsPercent: Number(percent.toFixed(2)),
        isColdStart: false,
    };
}

/**
 * Build a full AlphaScoreRecord from a snapshot and delta data.
 */
export function buildScoreRecord(
    snapshot: ArtistSnapshot,
    deltaStreams24h: number,
    deltaStreamsPercent: number,
): AlphaScoreRecord {
    const alphaScore = calculateAlphaScore(
        snapshot.totalPlays,
        snapshot.followerCount,
        deltaStreams24h,
        snapshot.marketCap,
    );

    return {
        audiusUserId: snapshot.audiusUserId,
        handle: snapshot.handle,
        name: snapshot.name,
        profilePicture: snapshot.profilePicture,
        topTrackId: snapshot.topTrackId,
        topTrackTitle: snapshot.topTrackTitle,
        topTrackGenre: snapshot.topTrackGenre,
        followerCount: snapshot.followerCount,
        totalPlays: snapshot.totalPlays,
        topTrackPlays: snapshot.topTrackPlays,
        deltaStreams24h,
        deltaStreamsPercent,
        tokenAddress: snapshot.tokenAddress,
        tokenPrice: snapshot.tokenPrice,
        marketCap: snapshot.marketCap,
        totalVolumeUsd: snapshot.totalVolumeUsd,
        holders: snapshot.holders,
        alphaScore: Number(alphaScore.toFixed(4)),
        timestamp: Date.now(),
    };
}

/**
 * Categorize an alpha score into a tier for UI display.
 */
export function getScoreTier(score: number): "high" | "mid" | "low" {
    if (score >= 100) return "high";
    if (score >= 10) return "mid";
    return "low";
}

/**
 * Generate event feed messages from score data.
 */
export function generateAlerts(scores: AlphaScoreRecord[]): AlphaAlert[] {
    const alerts: AlphaAlert[] = [];
    const now = Date.now();

    // Sort by score to highlight top movers
    const sorted = [...scores].sort((a, b) => b.alphaScore - a.alphaScore);

    for (const s of sorted.slice(0, 5)) {
        if (s.totalPlays >= 10000 && s.followerCount < 5000) {
            alerts.push({
                type: "gem",
                message: `${s.name} has ${formatNumber(s.totalPlays)} plays but only ${formatNumber(s.followerCount)} followers — hidden gem!`,
                artistId: s.audiusUserId,
                artistName: s.name,
                artistHandle: s.handle,
                profilePicture: s.profilePicture,
                timestamp: now,
            });
        } else if (s.totalPlays >= 1000) {
            alerts.push({
                type: "velocity",
                message: `${s.name} trending with ${formatNumber(s.totalPlays)} plays (α: ${s.alphaScore.toFixed(1)})`,
                artistId: s.audiusUserId,
                artistName: s.name,
                artistHandle: s.handle,
                profilePicture: s.profilePicture,
                timestamp: now,
            });
        }
    }

    // MC-based alerts (when token data available)
    for (const s of scores) {
        if (s.marketCap !== null && s.marketCap < 10000 && s.totalPlays > 5000) {
            alerts.push({
                type: "opportunity",
                message: `${s.name} has ${formatNumber(s.totalPlays)} streams but MC is only $${formatNumber(s.marketCap)}!`,
                artistId: s.audiusUserId,
                artistName: s.name,
                artistHandle: s.handle,
                profilePicture: s.profilePicture,
                timestamp: now,
            });
        }
    }

    if (alerts.length === 0) {
        alerts.push({
            type: "info",
            message: `📡 Scanned ${scores.length} trending artists on Audius`,
            timestamp: now,
        });
        if (sorted.length > 0 && sorted[0]) {
            alerts.push({
                type: "info",
                message: `🏆 Top alpha: ${sorted[0].name} (α: ${sorted[0].alphaScore.toFixed(1)})`,
                artistId: sorted[0].audiusUserId,
                artistName: sorted[0].name,
                artistHandle: sorted[0].handle,
                profilePicture: sorted[0].profilePicture,
                timestamp: now,
            });
            const totalPlays = scores.reduce((sum, s) => sum + s.totalPlays, 0);
            alerts.push({
                type: "info",
                message: `🎵 Total tracked plays: ${formatNumber(totalPlays)}`,
                timestamp: now,
            });
        }
    }

    return alerts;
}

function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toFixed(0);
}
