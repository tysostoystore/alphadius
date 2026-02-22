import type { APIRoute } from "astro";
import { getDb, queryScores, getDistinctGenres } from "../../lib/db";
import { AlphaFeedQuerySchema } from "../../lib/types";
import { generateAlerts } from "../../lib/scoring";

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
                    timestamp: Date.now(),
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
    } catch (err) {
        console.error("[API] alpha-feed error:", err);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
};
