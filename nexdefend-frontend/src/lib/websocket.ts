import { useDetectionStore, type Detection } from '../stores/detectionStore';
import { useToastStore } from '../stores/toastStore';

// Mock data generators
const tactics = ['Initial Access', 'Execution', 'Persistence', 'Privilege Escalation', 'Defense Evasion', 'Credential Access', 'Discovery', 'Lateral Movement', 'Collection', 'Command and Control', 'Exfiltration', 'Impact'];
const techniques = ['T1059', 'T1053', 'T1003', 'T1021', 'T1041', 'T1486', 'T1082'];
const hosts = ['FIN-WS-004', 'HR-LAPTOP-02', 'DEV-SRV-01', 'MKT-MAC-05', 'DB-PROD-01', 'DC-01', 'EXCH-01'];
const users = ['j.doe', 'SYSTEM', 'admin', 's.smith', 'postgres', 'network_service', 'backup_svc'];

function generateRandomDetection(): Detection {
    const id = `DET-${Math.floor(Math.random() * 9000) + 1000}`;
    const severityRoll = Math.random();
    let severity: Detection['severity'] = 'Low';
    if (severityRoll > 0.95) severity = 'Critical';
    else if (severityRoll > 0.8) severity = 'High';
    else if (severityRoll > 0.6) severity = 'Medium';

    return {
        id,
        severity,
        tactic: tactics[Math.floor(Math.random() * tactics.length)],
        technique: techniques[Math.floor(Math.random() * techniques.length)],
        host: hosts[Math.floor(Math.random() * hosts.length)],
        user: users[Math.floor(Math.random() * users.length)],
        timestamp: new Date().toISOString(),
        status: 'New'
    };
}

class SimulatedWebsocketService {
    private intervalId: any;
    private isRunning = false;

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        // Simulate incoming detection every 8 seconds
        this.intervalId = setInterval(() => {
            const detection = generateRandomDetection();
            useDetectionStore.getState().addDetection(detection);

            // Trigger Toast
            const isUrgent = detection.severity === 'Critical' || detection.severity === 'High';
            useToastStore.getState().addToast({
                title: `${detection.severity} Alert Detected`,
                message: `${detection.tactic} on ${detection.host} (${detection.id})`,
                type: isUrgent ? 'error' : 'warning',
                duration: 6000
            });

            console.log(`[WS-SIM] New Detection received: ${detection.id}`);
        }, 8000);

        console.log('[WS-SIM] Connection established');
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('[WS-SIM] Connection closed');
    }
}

export const wsService = new SimulatedWebsocketService();
