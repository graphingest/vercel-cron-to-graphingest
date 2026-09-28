/**
 * Nightly sync that is too long for a Vercel function.
 * Same job as pipeline.py, written in TypeScript.
 *
 *   npm install
 *   npm run deploy
 *
 * Then point app/api/cron/sync/route.ts at the flow id
 * from https://www.graphingest.io/flows
 */

import { node, graph, deploy } from "graphingest";

type Source = { name: string; apiUrl?: string; api_url?: string };
type SyncResult = { source: string; recordsSynced: number };

const syncSource = node(
  { name: "sync-source", cacheTtl: 1800, maxRetries: 3 },
  async (source: Source): Promise<SyncResult> => {
    const apiUrl = source.apiUrl ?? source.api_url;
    if (!apiUrl) throw new Error("Each source needs apiUrl");
    const resp = await fetch(apiUrl);
    const data = await resp.json();
    return {
      source: source.name,
      recordsSynced: Array.isArray(data) ? data.length : 1,
    };
  }
);

const nightlySync = graph(
  {
    name: "nightly-sync",
    timeoutMs: 7_200_000,
    retryPolicy: { maxRetries: 2, delayMs: 30_000, backoffFactor: 2 },
  },
  async (sources: Source[]) => {
    const results = (await syncSource.map(sources)) as SyncResult[];
    const total = results.reduce((sum, row) => sum + row.recordsSynced, 0);
    return { sourcesSynced: results.length, totalRecords: total };
  }
);

await deploy();

const result = await nightlySync([
  { name: "users", apiUrl: "https://jsonplaceholder.typicode.com/users" },
  { name: "posts", apiUrl: "https://jsonplaceholder.typicode.com/posts" },
]);
console.log(result);
