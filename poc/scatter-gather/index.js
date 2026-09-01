// Demo runner for the Scatter & Gather PoC. Run with: node poc/scatter-gather
const { providers } = require("./providers");
const { scatterGather } = require("./scatterGather");

const TIMEOUT_MS = 1500;
const MAX_RETRIES = 1;

console.log(
  `Scatter & Gather PoC — ${providers.length} static/mock providers, ` +
    `timeout=${TIMEOUT_MS}ms, maxRetries=${MAX_RETRIES}\n`
);

scatterGather(providers, {
  timeoutMs: TIMEOUT_MS,
  maxRetries: MAX_RETRIES,
  onProviderSettled: (r) => {
    const tag = r.status === "fulfilled" ? "OK  " : "FAIL";
    const suffix = r.status === "rejected" ? ` — ${r.reason}` : "";
    console.log(
      `[+${String(r.elapsedMs).padStart(5, " ")}ms] ${tag} ${r.provider} ` +
        `(attempts: ${r.attempts})${suffix}`
    );
  },
}).then(({ succeeded, failed, totalElapsedMs }) => {
  console.log(
    `\n--- Final gathered result after ${totalElapsedMs}ms ` +
      `(had to wait for the slowest/most-retried provider) ---`
  );

  console.log(`Succeeded (${succeeded.length}):`);
  succeeded.forEach((r) => console.log(`  - ${r.provider}:`, r.data.items));

  console.log(`Excluded — Resilience kicked in (${failed.length}):`);
  failed.forEach((r) => console.log(`  - ${r.provider}: ${r.reason}`));

  console.log(
    `\nNote: each provider above was logged the instant IT settled (see the ` +
      `[+Xms] timestamps) — several finished long before the final total. ` +
      `That's the "Partial Response" idea from lesson 0016/0019. This script ` +
      `only demonstrates it by printing progressively to the console; a real ` +
      `HTTP API still needs Polling or SSE to push that same progression to ` +
      `a browser client (open question — see open-questions.md #5).`
  );
});
