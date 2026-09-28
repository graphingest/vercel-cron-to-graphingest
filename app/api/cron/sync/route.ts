import { GraphIngestClient } from "graphingest";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const flowId = process.env.GRAPHINGEST_FLOW_ID;
  if (!flowId) {
    return Response.json({ error: "GRAPHINGEST_FLOW_ID is not set" }, { status: 500 });
  }

  const client = new GraphIngestClient();
  const res = await client.triggerFlowRun(flowId, {
    sources: [
      { name: "users", apiUrl: "https://jsonplaceholder.typicode.com/users" },
      { name: "posts", apiUrl: "https://jsonplaceholder.typicode.com/posts" },
    ],
  });

  const runId = (res as { data?: { id?: string } }).data?.id ?? null;
  return Response.json({ runId, status: "dispatched" });
}
