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
    call: () =>
      delay(400, {
        provider: "MockHotelsA",
        items: ["Hotel Nile View - 120 USD", "Hotel Downtown - 95 USD"],
      }),
  },
  {
    name: "MockHotelsB",
    call: () =>
      delay(900, {
        provider: "MockHotelsB",
        items: ["Sunset Resort - 140 USD"],
      }),
  },
  {
    name: "MockFlightsA-alwaysTooSlow",
    call: () =>
      delay(2500, {
        provider: "MockFlightsA-alwaysTooSlow",
        items: ["EgyptAir CAI-DXB - 210 USD"],
      }),
  },
  {
    name: "MockFlightsB-recoversOnRetry",
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
    call: () => delay(300, new Error("provider unavailable")),
  },
];

module.exports = { providers };
