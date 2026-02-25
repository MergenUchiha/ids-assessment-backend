type EveAlert = {
    timestamp: string;
    event_type: string;
    alert?: {
        signature: string;
        severity: number;
    };
    src_ip?: string;
    dest_ip?: string;
};
export declare class EveJsonReader {
    readAlertsInWindow(evePath: string, start: Date, end: Date): EveAlert[];
}
export {};
