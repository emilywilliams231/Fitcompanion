import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { BrainCircuit, Loader2 } from "lucide-react";

interface LossReflectionModalProps {
  tradeId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LossReflectionModal = ({ tradeId, isOpen, onClose, onSuccess }: LossReflectionModalProps) => {
  const [reason, setReason] = useState("");
  const [backtestNote, setBacktestNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!tradeId || !reason) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Save reflection
      const { error: reflectionError } = await supabase.from('loss_reflections').insert({
        trade_id: tradeId,
        user_id: user.id,
        reason,
        backtest_note: backtestNote
      });

      if (reflectionError) throw reflectionError;

      // 2. Clear lock
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ locked_until: null })
        .eq('id', user.id);

      if (profileError) throw profileError;

      showSuccess("Reflection saved. Trading unlocked.");
      onSuccess();
      onClose();
    } catch (err: any) {
      showError(err.message || "Failed to save reflection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BrainCircuit className="w-6 h-6 text-orange-500" />
            Loss Reflection
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Analyze why this trade failed to unlock your journal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Why did this trade fail?</Label>
            <Textarea 
              placeholder="e.g. FOMO, missed HTF bias, news impact..." 
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="bg-slate-800 border-slate-700 min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Backtest Note (Optional)</Label>
            <Textarea 
              placeholder="How would you play this differently next time?" 
              value={backtestNote}
              onChange={e => setBacktestNote(e.target.value)}
              className="bg-slate-800 border-slate-700"
            />
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={loading || !reason} 
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Submit & Unlock"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};