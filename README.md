# vercel-cron-to-graphingest

Vercel Hobby functions stop at 10 seconds. Pro stops at 60. This route only starts the pipeline. The sync runs on GraphIngest for up to two hours.

## Run

```bash
pip install -r requirements.txt
python pipeline.py
```

Copy the flow id from the dashboard into `GRAPHINGEST_FLOW_ID`.

Copy `app/api/cron/sync/route.ts` into your Next.js app and set:

- `GRAPHINGEST_API_KEY`
- `GRAPHINGEST_FLOW_ID`
- `CRON_SECRET` (optional; Vercel sends it as a bearer token)

`vercel.json` schedules the route at 03:00 UTC.
