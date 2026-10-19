/* eslint-env node */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { validateHttpsOrigin } from './production-config.mjs';
import { smokeServer } from './smoke-server.mjs';

const execute = promisify(execFile);

// curl --connect-to changes only the network destination. The URL host remains
// the HTTP Host and TLS SNI, with normal CA/hostname verification enabled.
export const createAlbHttpsFetch = (origin, hostname) => {
  const site = validateHttpsOrigin(origin);
  if (
    !/^[a-z0-9][a-z0-9-]*\.[a-z]{2}(?:-[a-z0-9]+)+-\d+\.elb\.amazonaws\.com$/i.test(
      hostname || ''
    )
  ) {
    throw new Error('ALB_DNS must be an AWS ALB hostname');
  }
  return async (input, { signal } = {}) => {
    const url = new URL(input);
    if (url.origin !== site.origin) {
      throw new Error('HTTPS smoke request must stay on the configured origin');
    }
    const { stdout } = await execute(
      'curl',
      [
        '--silent',
        '--show-error',
        '--max-time',
        '30',
        '--noproxy',
        '*',
        '--proto',
        '=https',
        '--connect-to',
        `${site.hostname}:443:${hostname}:443`,
        '--write-out',
        '\n%{content_type}\n%{http_code}',
        url.href
      ],
      { maxBuffer: 8 * 1024 * 1024, signal }
    );
    const lines = stdout.split('\n');
    const status = Number(lines.pop());
    const contentType = lines.pop();
    return new Response(lines.join('\n'), {
      headers: { 'content-type': contentType || '' },
      status
    });
  };
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    await smokeServer({
      attempts: 1,
      baseUrl: process.env.BASE_URL || process.env.NEXT_PUBLIC_SITE_URL,
      fetchImpl: createAlbHttpsFetch(
        process.env.BASE_URL || process.env.NEXT_PUBLIC_SITE_URL,
        process.env.ALB_DNS
      ),
      requestTimeoutMs: 35000
    });
    console.log(
      'Application HTTPS smoke passed directly against the deployed ALB with normal TLS validation.'
    );
  } catch (error) {
    console.error(`Application HTTPS smoke failed: ${error.message}`);
    process.exitCode = 1;
  }
}
