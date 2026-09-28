"""
Nightly sync that is too long for a Vercel function.

Deploy this file, then point app/api/cron/sync/route.ts at the flow id.

    pip install -r requirements.txt
    python pipeline.py
"""

from graphingest import node, graph, deploy, RetryPolicy
import requests


@node(name="sync-source", cache_ttl=1800, max_retries=3)
def sync_source(source: dict) -> dict:
    api_url = source.get("api_url") or source.get("apiUrl")
    resp = requests.get(api_url, timeout=30)
    data = resp.json()
    return {
        "source": source["name"],
        "records_synced": len(data) if isinstance(data, list) else 1,
    }


@graph(
    name="nightly-sync",
    timeout_seconds=7200,
    retry_policy=RetryPolicy(max_retries=2, delay_seconds=30, backoff_factor=2),
)
def nightly_sync(sources: list[dict]):
    results = sync_source.map(sources)
    total = sum(r["records_synced"] for r in results)
    return {"sources_synced": len(results), "total_records": total}


if __name__ == "__main__":
    deploy()
    result = nightly_sync([
        {"name": "users", "api_url": "https://jsonplaceholder.typicode.com/users"},
        {"name": "posts", "api_url": "https://jsonplaceholder.typicode.com/posts"},
    ])
    print(result)
