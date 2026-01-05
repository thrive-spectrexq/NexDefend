import React from 'react';
import { cn } from '../../lib/utils';

interface EmbeddedGrafanaPanelProps {
  src: string;
  className?: string;
  title?: string;
}

export const EmbeddedGrafanaPanel: React.FC<EmbeddedGrafanaPanelProps> = ({ src, className, title }) => {
  // Base Grafana URL (can be configured via env var, defaults to localhost:3000 for dev)
  const GRAFANA_BASE_URL = import.meta.env.VITE_GRAFANA_URL || 'http://localhost:3000';

  // Construct the full URL ensuring kiosk mode and theme are set
  // We assume the incoming 'src' is the path like '/d-solo/...'
  // We append &theme=dark to force dark mode to match our UI
  // We append &kiosk to remove Grafana chrome
  const fullUrl = `${GRAFANA_BASE_URL}${src}&theme=dark&kiosk`;

  return (
    <div className={cn("relative w-full h-full overflow-hidden rounded-lg bg-surface-darker", className)}>
      {title && (
          <div className="absolute top-2 left-2 z-10 bg-surface/80 backdrop-blur px-2 py-1 rounded text-xs font-mono text-text-muted border border-white/5">
              {title}
          </div>
      )}
      <iframe
        src={fullUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        className="w-full h-full"
        title={title || "Grafana Panel"}
      />
    </div>
  );
};
