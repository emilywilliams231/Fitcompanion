import { useLocks } from "@/hooks/useLocks";
import { Lock, AlertTriangle, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export const LocksAlert = () => {
  const { status, loading } = useLocks();

  if (loading || !status.locked) return null;

  const getIcon = () => {
    switch (status.reason) {
      case 'loss_lock': return <Lock className="w-5 h-5" />;
      case 'weekly_loss_lock': return <AlertTriangle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-red-500/10 border-b border-red-500/20 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between text-red-400">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-1.5 rounded-lg">
              {getIcon()}
            </div>
            <div>
              <p className="text-sm font-bold leading-none mb-1">{status.message}</p>
              {status.until && (
                <p className="text-[10px] opacity-70">
                  Unlocks in {formatDistanceToNow(new Date(status.until))}
                </p>
              )}
            </div>
          </div>
          <div className="hidden md:block text-[10px] font-mono uppercase tracking-widest opacity-50">
            Trading Restricted
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};