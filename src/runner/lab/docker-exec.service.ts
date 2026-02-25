import { Injectable } from '@nestjs/common';
import { execFile } from 'child_process';

@Injectable()
export class DockerExecService {
  execInContainer(containerName: string, cmd: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      // docker exec <container> <cmd...>
      const args = ['exec', containerName, ...cmd];

      execFile('docker', args, { windowsHide: true }, (err, stdout, stderr) => {
        if (err) {
          const message = [
            'docker exec failed',
            `container=${containerName}`,
            `cmd=${cmd.join(' ')}`,
            `stderr=${stderr}`,
          ].join('\n');
          return reject(new Error(message));
        }
        resolve(stdout || stderr || '');
      });
    });
  }
}
