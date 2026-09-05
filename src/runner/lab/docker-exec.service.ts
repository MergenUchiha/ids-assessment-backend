import { Injectable, Logger } from '@nestjs/common';
import { execFile } from 'child_process';

const CONTAINER_NAME = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;

export interface ExecResult {
  stdout: string;
  stderr: string;
}

@Injectable()
export class DockerExecService {
  private readonly logger = new Logger(DockerExecService.name);

  /**
   * Runs a command inside a container.
   *
   * `execFile` takes an argument vector, so nothing here goes through a shell
   * — but that only holds if the caller does not build a shell command as one
   * of the arguments. `RunsProcessor` used to pass
   * `['sh', '-lc', 'msfconsole -x "…"']` with a scenario field interpolated
   * into the quoted part, which put a shell back in the middle of the chain.
   */
  execInContainer(
    containerName: string,
    argv: string[],
    options: { timeoutMs?: number; maxBufferBytes?: number } = {},
  ): Promise<ExecResult> {
    if (!CONTAINER_NAME.test(containerName)) {
      return Promise.reject(
        new Error(`Refusing to exec in a container named "${containerName}"`),
      );
    }
    if (argv.length === 0) {
      return Promise.reject(new Error('No command given'));
    }

    const { timeoutMs = 300_000, maxBufferBytes = 8 * 1024 * 1024 } = options;

    return new Promise((resolve, reject) => {
      execFile(
        'docker',
        ['exec', containerName, ...argv],
        { windowsHide: true, timeout: timeoutMs, maxBuffer: maxBufferBytes },
        (err, stdout, stderr) => {
          if (err) {
            this.logger.warn(
              `docker exec ${containerName} failed: ${err.message}`,
            );
            return reject(
              new Error(
                [
                  'docker exec failed',
                  `container=${containerName}`,
                  `argv=${JSON.stringify(argv)}`,
                  `stderr=${stderr}`,
                ].join('\n'),
              ),
            );
          }
          resolve({ stdout, stderr });
        },
      );
    });
  }
}
