import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LIQUIDITY_CHECKLIST, RETAIL_CHECKLIST, StrategyName } from "@/types/trading";
import { showSuccess, showError } from "@/utils/toast";
import { Loader2, CheckCircle2, Lock } from "lucide-react";
import { useLocks } from "@/hooks/useLocks";

interface TradeFormProps {
  strategyType: StrategyName;
  isBacktest: boolean;
  onSuccess: () => void;
}

export const TradeForm = ({ strategyType, isBacktest, onSuccess }: TradeFormProps) => {
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const { status: lockStatus } = useLocks();
  const [formData, setFormData] = useState({
    pair: "",
    direction: "long",
    entry: "",
    riskPercent: "1.0",
    notes: ""
  });

  const items = strategyType === 'liquidity' ? LIQUIDITY_CHECKLIST : RETAIL_CHECKLIST;
  const allChecked = items.every(item => checklist[item]);
  const isLocked = !isBacktest && lockStatus.locked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecked || isLocked) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('trades').insert({
        user_id: user.id,
        pair: formData.pair.toUpperCase(),
        direction: formData.direction,
        entry: parseFloat(formData.entry),
        risk_percent: parseFloat(formData.riskPercent),
        notes: formData.notes,
        is_backtest: isBacktest,
        strategy_name: strategyType,
        confirmed_checklist: checklist,
        result: 'pending'
      });

      if (error) throw error;

      showSuccess("Trade logged successfully!");
      setFormData({ pair: "", direction: "long", entry: "", riskPercent: "1.0", notes: "" });
      setChecklist({});
      onSuccess();
    } catch (err: any) {
      showError(err.message || "Failed to log trade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isLocked && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <Lock className="w-4 h-4" />
          <span>{lockStatus.message}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Pair</Label>
          <Input 
            placeholder="EURUSD" 
            value={formData.pair} 
            onChange={e => setFormData(p => ({ ...p, pair: e.target.value }))}
            className="bg-slate-800 border-slate-700"
            disabled={isLocked}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Direction</Label>
          <Select value={formData.direction} onValueChange={v => setFormData(p => ({ ...p, direction: v }))} disabled={isLocked}>
            <SelectTrigger className="bg-slate-800 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="short">Short</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Entry Price</Label>
          <Input 
            type="number" 
            step="0.00001" 
            value={formData.entry} 
            onChange={e => setFormData(p => ({ ...p, entry: e.target.value }))}
            className="bg-slate-800 border-slate-700"
            disabled={isLocked}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Risk (%)</Label>
          <Input 
            type="number" 
            step="0.1" 
            value={formData.riskPercent} 
            onChange={e => setFormData(p => ({ ...p, riskPercent: e.target.value }))}
            className="bg-slate-800 border-slate-700"
            disabled={isLocked}
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-blue-400 font-bold">Confirmation Checklist</Label>
        <div className="space-y-2 bg-slate-800/50 p-4 rounded-xl border border-slate-800">
          {items.map((item) => (
            <div key={item} className="flex items-center space-x-3">
              <Checkbox 
                id={item} 
                checked={checklist[item] || false} 
                onCheckedChange={(checked) => setChecklist(prev => ({ ...prev, [item]: !!checked }))}
                className="border-slate-600 data-[state=checked]:bg-blue-500"
                disabled={isLocked}
              />
              <Label htmlFor={item} className="text-sm text-slate-300 cursor-pointer">{item}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea 
          value={formData.notes} 
          onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
          className="bg-slate-800 border-slate-700"
          disabled={isLocked}
        />
      </div>

      <Button 
        type="submit" 
        disabled={loading || !allChecked || isLocked} 
        className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-bold"
      >
        {loading ? <Loader2 className="animate-spin" /> : (
          <>
            <CheckCircle2 className="mr-2 w-5 h-5" />
            Log {isBacktest ? "Backtest" : "Live"} Trade
          </>
        )}
      </Button>
    </form>
  );
};