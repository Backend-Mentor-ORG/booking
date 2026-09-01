// Scatter & Gather engine: fires all providers in parallel ("scatter"),
// applies a per-provider timeout + retry to each one independently, then
// waits for every one of them to settle before returning the combined
// result ("gather"). One slow/broken provider never throws and never stops
// the others — it just ends up in `failed` instead of `succeeded`.
//
// See lessons 0016/0019 and Booking/concepts.md for the concept this
// implements.

function withTimeout(promiseFactory, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`timeout after ${timeoutMs}ms`)),
      timeoutMs
    );
    promiseFactory().then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

// Calls one provider with a timeout, retrying up to maxRetries times on
// failure or timeout. Never throws — always resolves to a result object,
// so one broken provider can't reject the whole Promise.all below.
async function callWithRetry(provider, timeoutMs, maxRetries) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const data = await withTimeout(() => provider.call(attempt), timeoutMs);
      return { provider: provider.name, status: "fulfilled", data, attempts: attempt };
    } catch (err) {
      lastError = err;
      // loop again if attempts remain (this is the Retry)
    }
  }
  return {
    provider: provider.name,
    status: "rejected",
    reason: lastError.message,
    attempts: maxRetries + 1,
  };
}

// options:
//   timeoutMs        - per-provider timeout
//   maxRetries        - retries per provider after the first attempt
//   onProviderSettled - optional callback fired the instant EACH provider
//                        settles (not just at the end). This is what a real
//                        server would use to push a Partial Response update
//                        to the client — over Polling or SSE, since a
//                        single plain REST response can't do it (see
//                        Booking/open-questions.md #5).
async function scatterGather(providers, { timeoutMs, maxRetries, onProviderSettled } = {}) {
  const start = Date.now();

  const tasks = providers.map((p) =>
    callWithRetry(p, timeoutMs, maxRetries).then((result) => {
      const withTiming = { ...result, elapsedMs: Date.now() - start };
      if (onProviderSettled) onProviderSettled(withTiming);
      return withTiming;
    })
  );

  const settled = await Promise.all(tasks);
  const succeeded = settled.filter((r) => r.status === "fulfilled");
  const failed = settled.filter((r) => r.status === "rejected");

  return { succeeded, failed, totalElapsedMs: Date.now() - start };
}

module.exports = { scatterGather, callWithRetry, withTimeout };
