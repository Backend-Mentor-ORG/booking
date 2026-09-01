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

async function callWithRetry(provider, timeoutMs, maxRetries) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const data = await withTimeout(() => provider.call(attempt), timeoutMs);
      return { provider: provider.name, status: "fulfilled", data, attempts: attempt };
    } catch (err) {
      lastError = err;
    }
  }
  return {
    provider: provider.name,
    status: "rejected",
    reason: lastError.message,
    attempts: maxRetries + 1,
  };
}

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
