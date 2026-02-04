import { type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
  glow?: boolean;
}

export const NeonButton = ({ children, className, variant = 'primary', glow = false, ...props }: NeonButtonProps) => {
  const baseStyles = "relative px-6 py-2 rounded-md font-mono font-black transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden cursor-pointer uppercase tracking-widest text-xs";

  const variants = {
    primary: clsx(
      "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20",
      glow && "hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]"
    ),
    danger: clsx(
      "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20",
      glow && "hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
    ),
    ghost: "text-gray-500 hover:text-white hover:bg-white/5",
  };

  return (
    <button className={clsx(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};
