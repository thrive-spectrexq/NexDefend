import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const GlassCard = ({ children, className, title, icon, action }: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={clsx(
        "glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden group",
        className
      )}
    >
      {/* Dynamic Header if title exists */}
      {(title || icon) && (
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2 text-accent">
            {icon && <span className="text-neon-blue drop-shadow-lg">{icon}</span>}
            <h3 className="font-mono text-lg font-bold tracking-wide uppercase text-gray-100">
              {title}
            </h3>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      <div className="relative z-10">
        {children}
      </div>

      {/* Decorative Gradient Background (Appears on Hover) */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
};
