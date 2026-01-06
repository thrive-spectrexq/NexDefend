import { useEffect } from 'react';
import { useRiskStore } from '../stores/riskStore';

export const useGlobalEvents = () => {
  const { calculateRisk } = useRiskStore();

  useEffect(() => {
    if (window.runtime) {
      // Create a persistent listener for security alerts to update risk score
      window.runtime.EventsOn("security-alert", (alert: any) => {
        // In a real app, we might want to accumulate these or fetch the full list
        // For now, we trigger a recalculation with the new alert
        calculateRisk([alert]);
      });

      // Cleanup listener on unmount
      return () => {
        // Wails v2 doesn't have an explicit 'EventsOff' exposed via the runtime object easily in TS types sometimes,
        // but typically EventsOn returns an unsubscribe function or we can use EventsOff if available.
        // Assuming Wails v2 default behavior where EventsOn doesn't return unsubscribe but we should be careful.
        // Actually, looking at Wails docs, EventsOn DOES NOT return an unsubscribe.
        // We need `EventsOff`.
        // If window.runtime.EventsOff exists:
        if ((window.runtime as any).EventsOff) {
            (window.runtime as any).EventsOff("security-alert");
        }
      };
    }
  }, [calculateRisk]);
};
