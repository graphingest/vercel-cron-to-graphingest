# A nightly job that is allowed to take hours

Your website host starts a timer every time a page or a scheduled task runs. On Vercel that timer stops the work at 10 seconds on the free plan and at 60 seconds on the paid plan. A real nightly job is longer than that. Pulling yesterday’s orders, updating a catalog, or building a report can take twenty minutes. The timer wins, the job dies, and you find out in the morning.

This starter is for that situation. The schedule still lives on Vercel. The long work lives on [GraphIngest](https://www.graphingest.io).

## When this fits

Use it when all of these are true:

- Your site is a Next.js app on Vercel.
- Something has to happen on a clock: every night, every hour, every Monday.
- That something takes longer than the host allows, or you are tired of guessing whether it will finish in time.

Everyday cases:

- A shop syncs orders, refunds, and inventory at 3 a.m.
- A team builds a morning report from several spreadsheets.
- A membership site refreshes profiles from an outside system once a day.
- A cleanup walks a long list of old files and cannot finish in one minute.

The schedule in this starter rings at 3:00 UTC. Change the clock in `vercel.json` to the hour you actually want. The job itself is registered on [graphingest.io](https://www.graphingest.io), so the clock on Vercel only has to ring the bell.

## What happens, in order

1. Vercel’s clock calls one small address on your site, `/api/cron/sync`.
2. That address asks [graphingest.io](https://www.graphingest.io) to start the job, then answers immediately. The answer includes an id you can look up later.
3. GraphIngest keeps working after your site has already replied. In this starter the job may run for up to two hours. You watch it on [the runs page](https://www.graphingest.io/runs).
4. Each source in the list is handled at the same time. If one source hiccups, that source is tried again. The others keep going.
5. When it finishes, the run is on your [GraphIngest dashboard](https://www.graphingest.io/dashboard), with the log of what happened.

You pay for the time the job is actually running. A quiet night, after the job is done, does not keep a machine switched on. Pricing and the rest of the product live at [graphingest.io](https://www.graphingest.io).

## What you need before you start

- A GraphIngest account. Create one at [graphingest.io/signup](https://www.graphingest.io/signup).
- An API key from [Settings](https://www.graphingest.io/settings). You will see the key once. Store it in Vercel’s environment settings. Do not put it in the code, and do not commit it.
- A Next.js project that is already deployed to Vercel.

This folder is the Python starter. It gives you two pieces:

- `pipeline.py` is the long job. You run it from your own computer once, to register it on [graphingest.io](https://www.graphingest.io).
- `app/api/cron/sync/route.ts` is the doorbell. Copy that file into your Next.js app.

More on how jobs are written is in the [docs](https://www.graphingest.io/docs).

## How to run it

Register the job:

```bash
pip install -r requirements.txt
python pipeline.py
```

That registers `nightly-sync` on [graphingest.io](https://www.graphingest.io). Open [your flows on graphingest.io](https://www.graphingest.io/flows) and copy the flow id of `nightly-sync`.

In the Vercel project, set these names. The values come from your [graphingest.io](https://www.graphingest.io) account, not from this page.

- `GRAPHINGEST_API_KEY` is the key from [Settings](https://www.graphingest.io/settings).
- `GRAPHINGEST_FLOW_ID` is the flow id from [the flows page](https://www.graphingest.io/flows).
- `CRON_SECRET` is optional. If you set it, Vercel sends it with the scheduled call, and the doorbell ignores anyone who does not have it.

Copy `app/api/cron/sync/route.ts` into your app at the same path. `vercel.json` tells Vercel to call that path at 3:00 UTC.

Trigger the schedule once by hand, or wait for the clock. The site answers right away. [The dashboard](https://www.graphingest.io/dashboard) shows the run while the sync continues.
