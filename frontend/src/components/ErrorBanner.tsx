import { motion, AnimatePresence } from "framer-motion";

interface ErrorBannerProps {
  message: string | null;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="flex items-start gap-3 overflow-hidden rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3.5 text-sm text-red-200"
        >
          <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="flex-1">{message}</p>
          <button type="button" onClick={onDismiss} aria-label="Dismiss" className="text-red-300/70 hover:text-red-100">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
