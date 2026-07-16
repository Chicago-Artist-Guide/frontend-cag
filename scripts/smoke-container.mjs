/* eslint-env node */

import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

import { PUBLIC_ENV_NAMES, requirePublicBuildArgs } from './public-env.mjs';
import { smokeServer } from './smoke-server.mjs';

const execFileAsync = promisify(execFile);

const errorMessage = (error) =>
  error instanceof Error ? error.message : String(error);

const failureOutput = (error, field) =>
  error && typeof error === 'object' && field in error
    ? String(error[field] || '')
    : '';

const redactValues = (output, configuredValues) => {
  let redactedOutput = output;
  const valuesByLength = configuredValues
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);

  valuesByLength.forEach((value) => {
    redactedOutput = redactedOutput.replaceAll(value, '[redacted]');
  });

  return redactedOutput;
};

const commandFailureMessage = (label, error, sensitiveValues) => {
  if (error && typeof error === 'object' && error.code === 'ENOENT') {
    return `${label} failed because the Docker CLI was not found. Install Docker Desktop and ensure docker is on PATH.`;
  }

  const diagnosticOutput = [
    failureOutput(error, 'stderr'),
    failureOutput(error, 'stdout')
  ]
    .filter(Boolean)
    .join('\n')
    .trim();
  const daemonUnavailable =
    /cannot connect to the docker daemon|is the docker daemon running|error during connect|permission denied while trying to connect to the docker api/i.test(
      diagnosticOutput
    );

  if (daemonUnavailable) {
    return `${label} failed because the Docker daemon is unavailable. Start Docker Desktop and wait for docker info to succeed.`;
  }

  const exitCode =
    error && typeof error === 'object' && 'code' in error
      ? String(error.code)
      : 'unknown';
  const redactedDiagnostic = redactValues(
    diagnosticOutput,
    sensitiveValues
  ).slice(-4000);

  return [
    `${label} failed with exit code ${exitCode}.`,
    redactedDiagnostic && `Docker output:\n${redactedDiagnostic}`
  ]
    .filter(Boolean)
    .join('\n');
};

export const executeDocker = async (
  arguments_,
  {
    allowFailure = false,
    execFileImpl = execFileAsync,
    label = 'Docker command',
    sensitiveValues = []
  } = {}
) => {
  try {
    const { stderr = '', stdout = '' } = await execFileImpl(
      'docker',
      arguments_,
      {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024
      }
    );

    return { stderr, stdout };
  } catch (error) {
    if (allowFailure) {
      return {
        stderr: failureOutput(error, 'stderr'),
        stdout: failureOutput(error, 'stdout')
      };
    }

    throw new Error(commandFailureMessage(label, error, sensitiveValues));
  }
};

export const createDockerCommands = ({
  buildArgs,
  containerName,
  imageName
}) => {
  const buildArgumentFlags = PUBLIC_ENV_NAMES.flatMap((name) => [
    '--build-arg',
    `${name}=${buildArgs[name]}`
  ]);

  return {
    build: [
      'buildx',
      'build',
      '--platform',
      'linux/amd64',
      '--load',
      '--target',
      'runner',
      '--tag',
      imageName,
      ...buildArgumentFlags,
      '.'
    ],
    imageInspect: [
      'image',
      'inspect',
      imageName,
      '--format',
      '{{.Os}}/{{.Architecture}}'
    ],
    imageRemove: ['image', 'rm', imageName],
    logs: ['logs', containerName],
    port: ['port', containerName, '3000/tcp'],
    remove: ['rm', '--force', containerName],
    run: [
      'run',
      '--detach',
      '--name',
      containerName,
      '--publish',
      '127.0.0.1::3000',
      imageName
    ],
    runtimeIdentity: [
      'exec',
      containerName,
      'node',
      '-e',
      'process.stdout.write(String(process.getuid()) + ":" + String(process.getgid()))'
    ]
  };
};

export const parsePublishedPort = (output) => {
  const publishedAddress = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (publishedAddress && !publishedAddress.startsWith('127.0.0.1:')) {
    throw new Error(
      `Expected a loopback IPv4 binding; received ${JSON.stringify(publishedAddress)}`
    );
  }

  const match = publishedAddress?.match(/^127\.0\.0\.1:(\d+)$/);
  const port = Number(match?.[1]);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      'Docker did not return a valid published port for 3000/tcp.'
    );
  }

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    port
  };
};

const normalizeSmokeId = (value) => {
  const normalized = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  if (!normalized) {
    throw new Error(
      'The container smoke identifier must contain a letter or number.'
    );
  }

  return normalized;
};

const ignoreCleanupFailure = async (operation) => {
  try {
    await operation();
  } catch {
    // Cleanup is best-effort and must not hide the verification failure.
  }
};

export const smokeContainer = async ({
  environment = process.env,
  idFactory = randomUUID,
  runDocker = executeDocker,
  smokeServerImpl = smokeServer,
  writeError = console.error
} = {}) => {
  const buildArgs = requirePublicBuildArgs(environment);
  const smokeId = normalizeSmokeId(idFactory());
  const containerName = `cag-local-smoke-${smokeId}`;
  const imageName = `cag-local-smoke:${smokeId}`;
  const commands = createDockerCommands({
    buildArgs,
    containerName,
    imageName
  });
  let containerStarted = false;

  try {
    await runDocker(commands.build, {
      label: 'Docker image build',
      sensitiveValues: Object.values(buildArgs)
    });

    const imageInspection = await runDocker(commands.imageInspect, {
      label: 'Docker image platform inspection'
    });
    if (imageInspection.stdout.trim() !== 'linux/amd64') {
      throw new Error(
        `Container image platform was ${JSON.stringify(imageInspection.stdout.trim())}; expected "linux/amd64".`
      );
    }

    await runDocker(commands.run, { label: 'Docker container start' });
    containerStarted = true;

    const runtimeIdentity = await runDocker(commands.runtimeIdentity, {
      label: 'Docker runtime identity inspection'
    });
    if (runtimeIdentity.stdout.trim() !== '1001:1001') {
      throw new Error(
        `Container runtime identity was ${JSON.stringify(runtimeIdentity.stdout.trim())}; expected "1001:1001".`
      );
    }

    const publishedPort = await runDocker(commands.port, {
      label: 'Docker published port inspection'
    });
    const { baseUrl, port } = parsePublishedPort(publishedPort.stdout);

    await smokeServerImpl({ baseUrl });

    return { baseUrl, port };
  } catch (error) {
    if (containerStarted) {
      const logs = await runDocker(commands.logs, {
        allowFailure: true,
        label: 'Docker container logs'
      });
      const combinedLogs = [logs.stdout, logs.stderr]
        .filter(Boolean)
        .join('\n');

      if (combinedLogs.trim()) {
        writeError(
          `Container logs:\n${redactValues(combinedLogs.trim(), Object.values(buildArgs))}`
        );
      }
    }

    throw error;
  } finally {
    await ignoreCleanupFailure(() =>
      runDocker(commands.remove, {
        allowFailure: true,
        label: 'Docker container cleanup'
      })
    );
    await ignoreCleanupFailure(() =>
      runDocker(commands.imageRemove, {
        allowFailure: true,
        label: 'Docker image cleanup'
      })
    );
  }
};

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  smokeContainer()
    .then(({ baseUrl }) => {
      console.log(`Container smoke test passed at ${baseUrl}.`);
    })
    .catch((error) => {
      console.error(`Container smoke test failed: ${errorMessage(error)}`);
      process.exitCode = 1;
    });
}
