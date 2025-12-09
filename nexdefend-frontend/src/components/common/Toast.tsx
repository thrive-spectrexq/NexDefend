import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useToastStore, type Toast as ToastType } from '../../stores/toastStore';
import { motion } from 'framer-motion';

const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertOctagon,
};

const colors = {
    info: 'border-brand-blue text-brand-blue bg-brand-blue/10',
    success: 'border-brand-green text-brand-green bg-brand-green/10',
    warning: 'border-brand-orange text-brand-orange bg-brand-orange/10',
    error: 'border-brand-red text-brand-red bg-brand-red/10',
};

export function Toast({ id, title, message, type }: ToastType) {
    const removeToast = useToastStore((state) => state.removeToast);
    const Icon = icons[type];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "w-96 rounded-lg border p-4 shadow-lg backdrop-blur-md flex items-start gap-4 mb-3 relative overflow-hidden pointer-events-auto",
                "bg-surface/90 border-surface-highlight",
            )}
        >
            <div className={cn("p-2 rounded-full shrink-0", colors[type])}>
                <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-text text-sm mb-1">{title}</h4>
                <p className="text-text-muted text-xs leading-relaxed break-words">{message}</p>
            </div>
            <button
                onClick={() => removeToast(id)}
                className="text-text-muted hover:text-text transition-colors p-1"
            >
                <X size={16} />
            </button>

            {/* Progress bar could go here */}
            <div className={cn("absolute bottom-0 left-0 h-0.5 bg-current opacity-20 w-full", colors[type].split(' ')[1])} />
        </motion.div>
    );
}
