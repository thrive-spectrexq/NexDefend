import { create } from 'zustand';

export interface Detection {
    id: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    tactic: string;
    technique: string;
    host: string;
    user: string;
    timestamp: string;
    status: 'New' | 'Active' | 'Investigating' | 'Resolved';
}

interface Stats {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
}

interface DetectionState {
    detections: Detection[];
    stats: Stats;
    isLive: boolean;
    setLive: (status: boolean) => void;
    addDetection: (detection: Detection) => void;
    updateStatus: (id: string, status: Detection['status']) => void;
}

const initialDetections: Detection[] = [
    {
        id: 'DET-1024',
        severity: 'Critical',
        tactic: 'Ransomware',
        technique: 'T1486',
        host: 'FIN-WS-004',
        user: 'j.doe',
        timestamp: new Date().toISOString(),
        status: 'New'
    },
    {
        id: 'DET-1023',
        severity: 'High',
        tactic: 'Credential Access',
        technique: 'T1003',
        host: 'HR-LAPTOP-02',
        user: 'SYSTEM',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        status: 'Investigating'
    },
    {
        id: 'DET-1022',
        severity: 'Medium',
        tactic: 'Execution',
        technique: 'T1059',
        host: 'DEV-SRV-01',
        user: 'admin',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        status: 'Resolved'
    },
    {
        id: 'DET-1021',
        severity: 'Low',
        tactic: 'Discovery',
        technique: 'T1082',
        host: 'MKT-MAC-05',
        user: 's.smith',
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
        status: 'Resolved'
    },
    {
        id: 'DET-1020',
        severity: 'Critical',
        tactic: 'Exfiltration',
        technique: 'T1041',
        host: 'DB-PROD-01',
        user: 'postgres',
        timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
        status: 'Active'
    },
];

const calculateStats = (detections: Detection[]): Stats => {
    return detections.reduce((acc, det) => {
        const sev = det.severity.toLowerCase() as keyof Stats;
        if (acc[sev] !== undefined) {
            acc[sev]++;
        }
        acc.total++;
        return acc;
    }, { critical: 0, high: 0, medium: 0, low: 0, total: 0 });
};

export const useDetectionStore = create<DetectionState>((set) => ({
    detections: initialDetections,
    stats: calculateStats(initialDetections),
    isLive: true,
    setLive: (status) => set({ isLive: status }),
    addDetection: (detection) => set((state) => {
        const newDetections = [detection, ...state.detections].slice(0, 100); // Keep last 100
        return {
            detections: newDetections,
            stats: calculateStats(newDetections)
        };
    }),
    updateStatus: (id, status) => set((state) => {
        const newDetections = state.detections.map(d =>
            d.id === id ? { ...d, status } : d
        );
        return { detections: newDetections };
    })
}));
