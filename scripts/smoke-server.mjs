/* eslint-env node */
/* global globalThis */

import { pathToFileURL } from 'node:url';

const errorMessage = (error) =>
  error instanceof Error ? error.message : String(error);

const abortError = (signal) =>
  signal.reason instanceof Error
    ? signal.reason
    : new Error('Server smoke verification was aborted.');

const wait = (milliseconds, signal) => {
  if (!signal) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
  if (signal.aborted) {
    return Promise.reject(abortError(signal));
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', handleAbort);
      resolve();
    }, milliseconds);
    const handleAbort = () => {
      clearTimeout(timer);
      reject(abortError(signal));
    };
    signal.addEventListener('abort', handleAbort, { once: true });
  });
};

const combineSignals = (signals) => {
  const controller = new AbortController();
  const listeners = new Map();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      break;
    }

    const handleAbort = () => controller.abort(signal.reason);
    listeners.set(signal, handleAbort);
    signal.addEventListener('abort', handleAbort, { once: true });
  }

  return {
    dispose: () => {
      for (const [signal, handleAbort] of listeners) {
        signal.removeEventListener('abort', handleAbort);
      }
    },
    signal: controller.signal
  };
};

const requestWithRetry = async ({
  attempts,
  baseUrl,
  delayMs,
  fetchImpl,
  path,
  requestTimeoutMs,
  signal
}) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    if (signal?.aborted) {
      throw abortError(signal);
    }

    const timeoutSignal = AbortSignal.timeout(requestTimeoutMs);
    const requestSignal = signal
      ? combineSignals([signal, timeoutSignal])
      : { dispose: () => undefined, signal: timeoutSignal };

    try {
      return await fetchImpl(new URL(path, `${baseUrl}/`), {
        signal: requestSignal.signal
      });
    } catch (error) {
      if (signal?.aborted) {
        throw abortError(signal);
      }
      lastError = error;

      if (attempt < attempts) {
        await wait(delayMs, signal);
      }
    } finally {
      requestSignal.dispose();
    }
  }

  throw new Error(
    `${path} was unreachable after ${attempts} attempts: ${errorMessage(lastError)}`
  );
};

const requireSuccess = (path, response) => {
  if (!response.ok) {
    throw new Error(
      `${path} returned ${response.status} ${response.statusText}`.trim()
    );
  }
};

const checkHealth = async (options, path, expectedStatus) => {
  const response = await requestWithRetry({ ...options, path });
  requireSuccess(path, response);

  const body = await response.json();
  if (body.status !== expectedStatus) {
    throw new Error(
      `${path} returned status ${JSON.stringify(body.status)}; expected ${JSON.stringify(expectedStatus)}`
    );
  }
};

const checkHtml = async (options, path) => {
  const response = await requestWithRetry({ ...options, path });
  requireSuccess(path, response);

  const contentType = response.headers.get('content-type') || '';
  const body = await response.text();
  if (!contentType.includes('text/html') || !/<html[\s>]/i.test(body)) {
    throw new Error(`${path} did not return an HTML application shell`);
  }

  return body;
};

const findStaticPath = (html) => {
  const match = html.match(
    /(?:^|[\s<])(?:src|href)\s*=\s*(["'])(\/_next\/static\/[^"']+)\1/i
  );

  return match?.[2];
};

/**
 * Verify the contracts required by the container health check and ALB target.
 * Connection errors are retried; completed HTTP failures fail immediately.
 */
export const smokeServer = async ({
  attempts = 20,
  baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000',
  delayMs = 500,
  fetchImpl = globalThis.fetch,
  requestTimeoutMs = 5000,
  signal
} = {}) => {
  const options = {
    attempts,
    baseUrl: baseUrl.replace(/\/$/, ''),
    delayMs,
    fetchImpl,
    requestTimeoutMs,
    signal
  };

  await checkHealth(options, '/api/health/live', 'ok');
  await checkHealth(options, '/api/health/ready', 'ready');

  const homePath = '/home';
  const homeHtml = await checkHtml(options, homePath);
  await checkHtml(options, '/about-us');

  const staticPath = findStaticPath(homeHtml);
  if (!staticPath) {
    throw new Error(
      `${homePath} did not reference a root-relative /_next/static/ asset`
    );
  }

  const staticResponse = await requestWithRetry({
    ...options,
    path: staticPath
  });
  requireSuccess(staticPath, staticResponse);
};

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  smokeServer()
    .then(() => {
      console.log('Server smoke test passed.');
    })
    .catch((error) => {
      console.error(`Server smoke test failed: ${errorMessage(error)}`);
      process.exitCode = 1;
    });
}
