import { type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
  glow?: boolean;
}

export const NeonButton = ({ children, className, variant = 'primary', glow = false, ...props }: NeonButtonProps) => {
  const baseStyles = "relative px-6 py-2 rounded-lg font-mono font-bold transition-all duration-300 flex items-center gap-2 overflow-hidden cursor-pointer";

  const variants = {
    primary: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]",
    danger: "bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5",
  };

  return (
    <button className={clsx(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};
