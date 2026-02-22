import { Database } from "bun:sqlite";
const db = new Database("audius_alpha.db");
const count = db.prepare("SELECT count(*) as total FROM scores").get() as { total: number };
console.log(`TOTAL_SCORES: ${count.total}`);
