import type { APIRoute } from "astro";
import { getDb, queryScores, countScores, getDistinctGenres, getAlphaTiers } from "../../lib/db";
import { AlphaFeedQuerySchema } from "../../lib/types";
import { generateAlerts } from "../../lib/scoring";
import fs from "node:fs";

export const GET: APIRoute = async ({ url }) => {
    try {
        const params = Object.fromEntries(url.searchParams.entries());
        const parsed = AlphaFeedQuerySchema.safeParse(params);

        if (!parsed.success) {
            return new Response(
                JSON.stringify({
                    error: "Invalid query parameters",
                    details: parsed.error.issues,
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        const db = getDb();
        const scores = queryScores(db, parsed.data as any);
        const total = countScores(db, parsed.data as any);
        const genres = getDistinctGenres(db);
        const alerts = generateAlerts(scores);
        const tiers = getAlphaTiers(db);

        // Last ingestion timestamp from DB
        const lastRefreshedRow = db
            .prepare(`SELECT MAX(timestamp) as last_refreshed FROM scores`)
            .get() as { last_refreshed: number | null };
        const lastRefreshed = lastRefreshedRow?.last_refreshed ?? Date.now();

        return new Response(
            JSON.stringify({
                data: scores,
                meta: {
                    total,
                    genres,
                    alerts: alerts.slice(0, 10),
                    tiers,
                    query: parsed.data,
                    timestamp: Date.now(),
                    lastRefreshed,
                },
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "public, max-age=30",
                },
            },
        );
    } catch (err: any) {
        console.error("[API] alpha-feed error:", err);

        // Debugging filesystem in Vercel
        let filesInCwd: string[] = [];
        let filesInDistServer: string[] = [];
        try { filesInCwd = fs.readdirSync(process.cwd()); } catch (e) { }
        try { filesInDistServer = fs.readdirSync(process.cwd() + "/dist/server"); } catch (e) { }

        return new Response(
            JSON.stringify({
                error: "Internal server error",
                message: err.message,
                stack: err.stack,
                cwd: process.cwd(),
                filesInCwd,
                filesInDistServer
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
};
