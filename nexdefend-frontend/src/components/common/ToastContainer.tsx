import { useToastStore } from '../../stores/toastStore';
import { Toast } from './Toast';
import { AnimatePresence } from 'framer-motion';

export function ToastContainer() {
    const toasts = useToastStore((state) => state.toasts);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence mode='popLayout'>
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} />
                ))}
            </AnimatePresence>
        </div>
    );
}
