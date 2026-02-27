import type { ArtistSnapshot, AlphaScoreRecord, AlphaAlert } from "./types";

/**
 * ═══════════════════════════════════════════════════════════════
 *  ALPHA SCORE — True Alpha Formula v4
 * ═══════════════════════════════════════════════════════════════
 *
 *  α = log₁₀(Plays/(Followers+100) + 1)
 *      × log₁₀(Plays+1)
 *      × 10
 *      × [1 + log1p(Δ% / 10)]
 *      × MarketBoost
 *
 *  Designed around the financial definition of "alpha":
 *  unexplained outperformance above what the market predicts.
 *
 *  ─────────────────────────────────────────────────
 *  BASE SIGNAL = Undervaluation × Credibility × 10
 *  ─────────────────────────────────────────────────
 *
 *  Undervaluation = log₁₀(plays/(followers+100) + 1)
 *    The core alpha metric. Answers: "does this artist have far
 *    more plays than their social footprint would predict?"
 *    log-compression prevents extreme outliers from dominating.
 *    Artist with 100K plays / 500 followers:  log₁₀(201) = 2.30
 *    Artist with 100K plays / 100K followers: log₁₀(1.99) = 0.30
 *    → 7.7× advantage for the undervalued artist. Correct.
 *
 *  Credibility = log₁₀(plays+1)
 *    Proof of real listeners. Multiplicative with Undervaluation,
 *    so BOTH a strong ratio AND real plays are required.
 *    Strongly suppresses ghost accounts (2 plays → 0.48,
 *    vs 100K plays → 5.0 = 10× amplification).
 *
 *  ─────────────────────────────────────────────────
 *  MOMENTUM MULTIPLIER = 1 + log1p(Δ% / 10)
 *  ─────────────────────────────────────────────────
 *    Multiplicative boost for artists actively growing:
 *    0% growth  → ×1.0  (baseline, no penalty)
 *    +10% growth → ×1.7 (+70% bonus)
 *    +42% growth → ×2.7 (+170% bonus)
 *    +100% growth → ×3.4 (+240% bonus)
 *    +1000% growth → ×5.6 (+460% bonus, log caps viral spikes)
 *
 *    Momentum multiplies the base quality of the artist —
 *    a great hidden gem that's now growing is peak alpha.
 *
 *  Result: Hidden gems without current growth still rank well.
 *  Growing artists with good efficiency rank highest.
 *  Ghost accounts are strongly suppressed.
 * ═══════════════════════════════════════════════════════════════
 */
export function calculateAlphaScore(
    totalPlays: number,
    followerCount: number,
    deltaStreams24h: number,
    marketCapUsd: number | null,
): number {
    const plays = Math.max(totalPlays, 0);
    const followers = Math.max(followerCount, 0);
    const delta = Math.max(deltaStreams24h, 0);

    if (plays === 0) return 0;

    // ── Undervaluation: core "alpha" signal ──
    // Plays-per-(follower+baseline) ratio, log-compressed.
    // High = artist reaching far more people than their social proof suggests.
    const ratio = plays / (followers + 100);
    const undervaluation = Math.log10(ratio + 1);

    // ── Credibility: scale filter ──
    // Ensures genuine play counts. Multiplicative with undervaluation
    // so BOTH a strong ratio AND real listeners are required.
    const credibility = Math.log10(plays + 1);

    // ── Base Score ──
    const baseScore = undervaluation * credibility * 10;

    // ── Momentum Multiplier ──
    // Growth % based on previous plays (current - delta = previous).
    // 0% growth → 1.0 (no penalty). Acts as amplifier not primary signal.
    const prevPlays = Math.max(plays - delta, 1);
    const growthPct = (delta / prevPlays) * 100;
    const momentumBoost = 1 + Math.log1p(growthPct / 10);

    // ── Market Cap Divergence (minor bonus, max +30%) ──
    let marketBoost = 1.0;
    if (marketCapUsd != null && marketCapUsd > 0) {
        const divergence = plays / (marketCapUsd + 1000);
        marketBoost = 1 + 0.15 * Math.min(divergence, 2);
    }

    return baseScore * momentumBoost * marketBoost;
}

/**
 * Compute delta streams between two snapshots.
 * On cold start (no previous snapshot) delta is 0 — the artist gets
 * a pure Undervaluation × Credibility baseline (momentum = 1.0).
 */
export function computeDelta(
    current: ArtistSnapshot,
    previous: ArtistSnapshot | null,
): { deltaStreams24h: number; deltaStreamsPercent: number; isColdStart: boolean } {
    if (!previous) {
        return {
            deltaStreams24h: 0,
            deltaStreamsPercent: 0,
            isColdStart: true,
        };
    }

    const delta = current.totalPlays - previous.totalPlays;

    // Smooth the percentage for very small starting numbers (e.g. going from 1 to 500 isn't +49900%)
    const base = Math.max(previous.totalPlays, 100);
    const percent = (delta / base) * 100;

    // ── Anomaly Guard (Fix for Trending -> All-Time Track Glitch) ──
    // The glitch we are fixing is when an artist is stored with a trending 
    // track (e.g. 15 plays) and the next day we fetch their all-time portfolio (e.g. 25,000 plays).
    // We catch two specific shapes of this ingestion artifact:
    // 1. Massive volume jump: > 4,000 streams AND > 400% growth  (e.g., 1000 -> 6000)
    // 2. Mathematically absurd jump: > 1000% growth (e.g., 20 -> 500)
    if ((percent > 400 && delta > 4000) || percent > 1000) {
        return {
            deltaStreams24h: 0,
            deltaStreamsPercent: 0,
            isColdStart: true,
        };
    }

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

    const sorted = [...scores].sort((a, b) => b.alphaScore - a.alphaScore);

    for (const s of sorted.slice(0, 5)) {
        if (s.deltaStreamsPercent > 20 && s.totalPlays >= 5000) {
            alerts.push({
                type: "velocity",
                message: `⚡ ${s.name} gaining fast — +${s.deltaStreamsPercent.toFixed(1)}% stream growth (α: ${s.alphaScore.toFixed(1)})`,
                artistId: s.audiusUserId,
                artistName: s.name,
                artistHandle: s.handle,
                profilePicture: s.profilePicture,
                timestamp: now,
            });
        } else if (s.totalPlays >= 10000 && s.followerCount < 5000) {
            alerts.push({
                type: "gem",
                message: `💎 ${s.name} — ${formatNumber(s.totalPlays)} plays with only ${formatNumber(s.followerCount)} followers`,
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
