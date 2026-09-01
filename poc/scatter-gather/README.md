# Scatter & Gather — PoC

Answers the session-21 task *"Scatter & Gather with static data as project"*
(see `sources/Screenshot 2026-08-18 140903.png` in the teaching workspace).
A small, runnable proof of concept — no real providers, no HTTP server, just
plain Node.js and static/mock data — showing the mechanics behind the
concepts documented in [`../../concepts.md`](../../concepts.md).

## Run it

```
node poc/scatter-gather
```

## What it demonstrates

- **Scatter**: all 5 mock providers (`providers.js`) are called in parallel,
  not one after another.
- **Per-provider timeout**: each call is raced against a timeout
  (`withTimeout` in `scatterGather.js`) — one slow provider can't hang the
  whole request.
- **Retry**: a provider that fails once (simulated connection reset) gets a
  second attempt and recovers.
- **Resilience**: a provider that's always too slow, and one that always
  fails, both get excluded from the final result — the other 3 still come
  back successfully. One broken provider never fails the whole search.
- **Partial response (the idea, not the transport)**: `onProviderSettled`
  fires the instant each provider settles, not just at the end — the console
  log shows 3 providers finishing in under a second, while the final
  gathered result only closes ~3s later because of the one provider that
  times out on every retry. That gap is exactly why Partial Response matters:
  a real client shouldn't have to wait for the slowest/most-retried provider
  before seeing anything.

## What it does *not* answer

How to actually push that partial progression to an HTTP client (Polling vs
Server-Sent Events) is still open — see
[`../../open-questions.md`](../../open-questions.md) #5. This PoC only prints
progressively to a local console, which sidesteps the transport question
entirely; a real API endpoint can't.

## Source lessons

Lessons 0016 (Partial Response/Resilience), 0018 (Start Small implementation
roadmap — this PoC is that roadmap's step 3), 0019 (Sequential vs Parallel vs
Scatter & Gather) in the teaching workspace
(`Learn_booking_project/lessons/`).
