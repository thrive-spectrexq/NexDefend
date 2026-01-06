export {};

declare global {
  interface Window {
    runtime: {
      EventsOn: (event: string, callback: (data: any) => void) => void;
    };
    go: {
      main: {
        App: {
          SearchLogs: (query: string) => Promise<any>;
          GetSystemInfo: () => Promise<Record<string, string>>;
          GetSettings: () => Promise<any>;
          SaveSettings: (cfg: any) => Promise<string>;
          GetRunningProcesses: () => Promise<any[]>;
          GetProcessDetail: (pid: number) => Promise<any>;
          KillProcess: (pid: number) => Promise<string>;
          AskSentinel: (query: string) => Promise<string>;
        }
      }
    }
  }
}
