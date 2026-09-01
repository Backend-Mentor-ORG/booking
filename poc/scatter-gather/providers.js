// Static/mock provider list for the Scatter & Gather PoC.
// No real network calls — every "provider" is a Promise that resolves or
// rejects after a fixed delay, simulating the range of things a real
// external API can do: answer fast, answer slow, time out, fail once then
// recover, or fail every time.

function delay(ms, valueOrError) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (valueOrError instanceof Error) reject(valueOrError);
      else resolve(valueOrError);
    }, ms);
  });
}

const providers = [
  {
    name: "MockHotelsA",
    // Fast, always succeeds.
    call: () =>
      delay(400, {
        provider: "MockHotelsA",
        items: ["Hotel Nile View - 120 USD", "Hotel Downtown - 95 USD"],
      }),
  },
  {
    name: "MockHotelsB",
    // Slower, but still under the timeout — always succeeds.
    call: () =>
      delay(900, {
        provider: "MockHotelsB",
        items: ["Sunset Resort - 140 USD"],
      }),
  },
  {
    name: "MockFlightsA-alwaysTooSlow",
    // Exceeds the timeout on every attempt (2500ms vs a 1500ms timeout).
    // Demonstrates: per-provider timeout + retry cost, then Resilience
    // (this provider gets dropped, everyone else still comes back).
    call: () =>
      delay(2500, {
        provider: "MockFlightsA-alwaysTooSlow",
        items: ["EgyptAir CAI-DXB - 210 USD"],
      }),
  },
  {
    name: "MockFlightsB-recoversOnRetry",
    // Fails on the first attempt (simulated connection reset), succeeds
    // on the second. Demonstrates: Retry recovering a transient failure.
    call: (attempt) =>
      attempt === 1
        ? delay(300, new Error("connection reset"))
        : delay(500, {
            provider: "MockFlightsB-recoversOnRetry",
            items: ["Emirates CAI-DXB - 260 USD"],
          }),
  },
  {
    name: "MockFlightsC-alwaysFails",
    // Fails every attempt (simulated persistent error). Demonstrates:
    // Resilience — dropped from the final result, doesn't block the rest.
    call: () => delay(300, new Error("provider unavailable")),
  },
];

module.exports = { providers };
