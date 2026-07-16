/* eslint-env node */
/* global globalThis */

import { pathToFileURL } from 'node:url';

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const errorMessage = (error) =>
  error instanceof Error ? error.message : String(error);

const requestWithRetry = async ({
  attempts,
  baseUrl,
  delayMs,
  fetchImpl,
  path,
  requestTimeoutMs
}) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetchImpl(new URL(path, `${baseUrl}/`), {
        signal: AbortSignal.timeout(requestTimeoutMs)
      });
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        await wait(delayMs);
      }
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
  requestTimeoutMs = 5000
} = {}) => {
  const options = {
    attempts,
    baseUrl: baseUrl.replace(/\/$/, ''),
    delayMs,
    fetchImpl,
    requestTimeoutMs
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
