import {
  createDockerCommands,
  executeDocker,
  parsePublishedPort,
  smokeContainer
} from './smoke-container.mjs';
import { PUBLIC_ENV_NAMES } from './public-env.mjs';

const configuredEnvironment = Object.fromEntries(
  PUBLIC_ENV_NAMES.map((name) => [name, `private-${name.toLowerCase()}`])
);

describe('container smoke verification', () => {
  it('constructs an amd64 build and loopback-only container commands', () => {
    const commands = createDockerCommands({
      buildArgs: configuredEnvironment,
      containerName: 'cag-smoke-test-container',
      imageName: 'cag-smoke:test-image'
    });

    expect(commands.build.slice(0, 9)).toEqual([
      'buildx',
      'build',
      '--platform',
      'linux/amd64',
      '--load',
      '--target',
      'runner',
      '--tag',
      'cag-smoke:test-image'
    ]);
    expect(
      commands.build.filter((argument) => argument === '--build-arg')
    ).toHaveLength(PUBLIC_ENV_NAMES.length);
    PUBLIC_ENV_NAMES.forEach((name) => {
      expect(commands.build).toContain(
        `${name}=${configuredEnvironment[name]}`
      );
    });
    expect(commands.build.at(-1)).toBe('.');
    expect(commands.run).toEqual([
      'run',
      '--detach',
      '--name',
      'cag-smoke-test-container',
      '--publish',
      '127.0.0.1::3000',
      'cag-smoke:test-image'
    ]);
    expect(commands.imageInspect).toEqual([
      'image',
      'inspect',
      'cag-smoke:test-image',
      '--format',
      '{{.Os}}/{{.Architecture}}'
    ]);
    expect(commands.runtimeIdentity).toEqual([
      'exec',
      'cag-smoke-test-container',
      'node',
      '-e',
      'process.stdout.write(String(process.getuid()) + ":" + String(process.getgid()))'
    ]);

    expect(Object.values(commands).flat()).not.toContain('sh');
    expect(Object.values(commands).flat()).not.toContain('-c');
  });

  it('parses the random loopback host port and rejects unsafe bindings', () => {
    expect(parsePublishedPort('127.0.0.1:49153\n')).toEqual({
      baseUrl: 'http://127.0.0.1:49153',
      port: 49153
    });
    expect(() => parsePublishedPort('0.0.0.0:49153\n')).toThrow(
      'loopback IPv4'
    );
    expect(() => parsePublishedPort('127.0.0.1:not-a-port\n')).toThrow(
      'published port'
    );
  });

  it('fails missing configuration before Docker and never exposes values', async () => {
    const configuredValue = 'configured-value-must-stay-private';
    const runDocker = vi.fn();
    let thrownError: unknown;

    try {
      await smokeContainer({
        environment: {
          NEXT_PUBLIC_FIREBASE_API_KEY: configuredValue
        },
        idFactory: () => 'missing-config',
        runDocker
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(Error);
    expect((thrownError as Error).message).toContain(
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
    );
    expect((thrownError as Error).message).not.toContain(configuredValue);
    expect(runDocker).not.toHaveBeenCalled();
  });

  it('classifies an unavailable daemon without exposing command values', async () => {
    const configuredValue = 'configured-value-must-stay-private';
    const execFileImpl = vi.fn(async () => {
      throw Object.assign(new Error(`docker build ${configuredValue}`), {
        code: 1,
        stderr: `Cannot connect to the Docker daemon. ${configuredValue}`,
        stdout: ''
      });
    });
    let thrownError: unknown;

    try {
      await executeDocker(['buildx', 'build', configuredValue], {
        execFileImpl,
        label: 'Docker image build',
        sensitiveValues: [configuredValue]
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(Error);
    expect((thrownError as Error).message).toContain(
      'Docker daemon is unavailable'
    );
    expect((thrownError as Error).message).toContain('Docker Desktop');
    expect((thrownError as Error).message).not.toContain(configuredValue);
  });

  it('surfaces redacted Docker output for an actionable build failure', async () => {
    const configuredValue = 'configured-value-must-stay-private';
    const execFileImpl = vi.fn(async () => {
      throw Object.assign(new Error('Docker build failed'), {
        code: 2,
        stderr: `The application build failed near ${configuredValue}.`,
        stdout: ''
      });
    });
    let thrownError: unknown;

    try {
      await executeDocker(['buildx', 'build', configuredValue], {
        execFileImpl,
        label: 'Docker image build',
        sensitiveValues: [configuredValue]
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(Error);
    expect((thrownError as Error).message).toContain(
      'The application build failed near [redacted].'
    );
    expect((thrownError as Error).message).not.toContain(configuredValue);
  });

  it('preserves a safe build diagnostic and cleans up the unique names', async () => {
    const calls: string[][] = [];
    const runDocker = vi.fn(async (arguments_: string[]) => {
      calls.push(arguments_);

      if (arguments_[0] === 'buildx') {
        throw new Error(
          'Docker daemon is unavailable. Start Docker Desktop and wait for docker info to succeed.'
        );
      }

      return { stderr: '', stdout: '' };
    });

    await expect(
      smokeContainer({
        environment: configuredEnvironment,
        idFactory: () => 'build-failure',
        runDocker
      })
    ).rejects.toThrow('Docker daemon is unavailable');

    expect(calls).not.toContainEqual(['logs', 'cag-local-smoke-build-failure']);
    expect(calls).toContainEqual([
      'rm',
      '--force',
      'cag-local-smoke-build-failure'
    ]);
    expect(calls).toContainEqual([
      'image',
      'rm',
      'cag-local-smoke:build-failure'
    ]);
  });

  it('checks platform and runtime identity, smokes the random port, logs, and cleans up on failure', async () => {
    const calls: string[][] = [];
    const errorOutput: string[] = [];
    const runDocker = vi.fn(async (arguments_: string[]) => {
      calls.push(arguments_);

      if (arguments_[0] === 'image' && arguments_[1] === 'inspect') {
        return { stderr: '', stdout: 'linux/amd64\n' };
      }
      if (arguments_[0] === 'exec') {
        return { stderr: '', stdout: '1001:1001' };
      }
      if (arguments_[0] === 'port') {
        return { stderr: '', stdout: '127.0.0.1:49154\n' };
      }
      if (arguments_[0] === 'logs') {
        return { stderr: '', stdout: 'container failed safely\n' };
      }

      return { stderr: '', stdout: '' };
    });
    const smokeServerImpl = vi.fn(async () => {
      throw new Error('application smoke failed');
    });

    await expect(
      smokeContainer({
        environment: configuredEnvironment,
        idFactory: () => 'failure-path',
        runDocker,
        smokeServerImpl,
        writeError: (message) => errorOutput.push(message)
      })
    ).rejects.toThrow('application smoke failed');

    expect(smokeServerImpl).toHaveBeenCalledWith({
      baseUrl: 'http://127.0.0.1:49154'
    });
    expect(calls).toContainEqual(['logs', 'cag-local-smoke-failure-path']);
    expect(calls).toContainEqual([
      'rm',
      '--force',
      'cag-local-smoke-failure-path'
    ]);
    expect(calls).toContainEqual([
      'image',
      'rm',
      'cag-local-smoke:failure-path'
    ]);
    expect(errorOutput.join('\n')).toContain('container failed safely');

    const visibleOutput = errorOutput.join('\n');
    Object.values(configuredEnvironment).forEach((value) => {
      expect(visibleOutput).not.toContain(value);
    });
  });

  it('cleans up when the runtime identity contract fails', async () => {
    const calls: string[][] = [];
    const runDocker = vi.fn(async (arguments_: string[]) => {
      calls.push(arguments_);

      if (arguments_[0] === 'image' && arguments_[1] === 'inspect') {
        return { stderr: '', stdout: 'linux/amd64\n' };
      }
      if (arguments_[0] === 'exec') {
        return { stderr: '', stdout: '0:0' };
      }
      if (arguments_[0] === 'logs') {
        return { stderr: '', stdout: '' };
      }

      return { stderr: '', stdout: '' };
    });

    await expect(
      smokeContainer({
        environment: configuredEnvironment,
        idFactory: () => 'identity-failure',
        runDocker,
        smokeServerImpl: vi.fn()
      })
    ).rejects.toThrow('1001:1001');

    expect(calls).toContainEqual([
      'rm',
      '--force',
      'cag-local-smoke-identity-failure'
    ]);
  });
});
