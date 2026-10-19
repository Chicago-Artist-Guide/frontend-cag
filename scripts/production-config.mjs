/* eslint-env node */
import { pathToFileURL } from 'node:url';

export const validateHttpsOrigin = (value) => {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('NEXT_PUBLIC_SITE_URL must be an absolute HTTPS origin');
  }
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('NEXT_PUBLIC_SITE_URL must be an absolute HTTPS origin');
  }
  return url;
};

export const validateProductionConfiguration = (environment) => {
  if (
    environment.CERTIFICATE_ARN &&
    !/^arn:aws:acm:[a-z0-9-]+:\d{12}:certificate\/[a-f0-9-]{36}$/.test(
      environment.CERTIFICATE_ARN || ''
    )
  ) {
    throw new Error('CERTIFICATE_ARN must be an ACM certificate ARN');
  }
  return validateHttpsOrigin(environment.NEXT_PUBLIC_SITE_URL);
};

export const resolveProductionBrowserOrigin = (environment) => {
  const origin = validateProductionConfiguration(environment);
  const hostname = environment.ALB_DNS || '';
  if (
    !/^[a-z0-9][a-z0-9-]*\.[a-z]{2}(?:-[a-z0-9]+)+-\d+\.elb\.amazonaws\.com$/i.test(
      hostname
    )
  ) {
    throw new Error('ALB_DNS must be an AWS ALB hostname');
  }
  return environment.CERTIFICATE_ARN ? origin : new URL(`http://${hostname}`);
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    validateProductionConfiguration(process.env);
    console.log(
      'Production configuration verified; TLS is optional before cutover.'
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
