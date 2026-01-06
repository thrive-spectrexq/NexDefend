import { create } from 'zustand';

export interface RiskFactor {
  assetId: string;
  hostname: string;
  score: number; // 0-100
  trends: 'up' | 'down' | 'stable';
  contributingEvents: number;
}

interface RiskState {
  riskFactors: RiskFactor[];
  globalRiskScore: number;
  calculateRisk: (alerts: any[]) => void;
}

export const useRiskStore = create<RiskState>((set) => ({
  riskFactors: [],
  globalRiskScore: 0,

  // The "SIEM Logic" - Aggregates alerts into Asset Risk Scores
  calculateRisk: (alerts) => {
    const assetRisk: Record<string, number> = {};
    const assetCounts: Record<string, number> = {};

    alerts.forEach(alert => {
      // Weighting: Critical=10, High=5, Medium=2
      const weight = alert.severity === 'CRITICAL' ? 10 : alert.severity === 'HIGH' ? 5 : 2;
      const host = alert.source || 'unknown-host';

      assetRisk[host] = (assetRisk[host] || 0) + weight;
      assetCounts[host] = (assetCounts[host] || 0) + 1;
    });

    // Normalize to 0-100
    const factors: RiskFactor[] = Object.keys(assetRisk).map(host => ({
      assetId: host,
      hostname: host,
      score: Math.min(assetRisk[host], 100),
      trends: (assetRisk[host] > 50 ? 'up' : 'stable') as 'up' | 'down' | 'stable',
      contributingEvents: assetCounts[host]
    })).sort((a, b) => b.score - a.score);

    // Calculate Global Posture (Average of top 5 riskiest assets)
    const topRisks = factors.slice(0, 5).reduce((acc, curr) => acc + curr.score, 0);
    const globalScore = factors.length > 0 ? Math.round(topRisks / Math.min(factors.length, 5)) : 0;

    set({ riskFactors: factors, globalRiskScore: globalScore });
  }
}));
