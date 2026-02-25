export declare class DockerExecService {
    execInContainer(containerName: string, cmd: string[]): Promise<string>;
}
