// Mock transport used by every *Api.js module until a real backend is
// connected. Keeping this as its own module means swapping mock ->
// real HTTP later is a one-line change per service function (replace
// `mockRequest(fixture)` with `apiClient.get(url)`), not a rewrite.

const DEFAULT_LATENCY_MS = 350;

function simulateLatency(ms = DEFAULT_LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolves with a deep-cloned copy of the given fixture data, after a
 * simulated network delay. Accepts either a plain value or a producer
 * function so callers can filter/transform fixture data per-call.
 */
export async function mockRequest(dataOrFn, { latency = DEFAULT_LATENCY_MS, failRate = 0 } = {}) {
  await simulateLatency(latency);

  if (failRate > 0 && Math.random() < failRate) {
    const error = new Error('Simulated network error');
    error.response = { status: 500, data: { message: 'Simulated failure' } };
    throw error;
  }

  const data = typeof dataOrFn === 'function' ? dataOrFn() : dataOrFn;
  return typeof structuredClone === 'function' ? structuredClone(data) : JSON.parse(JSON.stringify(data));
}
