import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
  noPadding?: boolean;
}

export const GlassCard = ({ children, className, title, action, noPadding = false }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "bg-surface/80 backdrop-blur-sm border border-white/5 rounded-lg shadow-xl overflow-hidden flex flex-col relative group hover:border-white/10 transition-colors",
        className
      )}
    >
      {/* Top Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/[0.02]">
          {title && <h3 className="font-semibold text-sm tracking-wide text-text uppercase opacity-90">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}

      <div className={cn("flex-1", !noPadding && "p-5")}>
        {children}
      </div>
    </div>
  );
};
