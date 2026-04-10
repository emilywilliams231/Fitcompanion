import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trade } from "@/types/trading";
import { TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { format, addMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast";

interface TradeCardProps {
  trade: Trade;
  onUpdate: () => void;
  onLoss: (tradeId: number) => void;
}

export const TradeCard = ({ trade, onUpdate, onLoss }: TradeCardProps) => {
  const [loading, setLoading] = useState(false);

  const updateResult = async (result: 'win' | 'loss') => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Update trade result
      const { error: tradeError } = await supabase
        .from('trades')
        .update({ result, exit: trade.entry }) // Simplified exit for now
        .eq('id', trade.id);

      if (tradeError) throw tradeError;

      // 2. If loss and not backtest, apply lock
      if (result === 'loss' && !trade.isBacktest) {
        const lockedUntil = addMinutes(new Date(), 10).toISOString();
        await supabase
          .from('profiles')
          .update({ locked_until: lockedUntil })
          .eq('id', user.id);
        
        onLoss(trade.id);
      }

      showSuccess(`Trade marked as ${result}`);
      onUpdate();
    } catch (err: any) {
      showError(err.message || "Failed to update trade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden hover:border-slate-700 transition-colors">
      <CardContent className="p-0">
        <div className="p-4 flex items-center justify-between border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              trade.direction === 'long' ? "bg-blue-500/10 text-blue-500" : "bg-red-500/10 text-red-500"
            )}>
              {trade.direction === 'long' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{trade.pair}</span>
                {trade.isBacktest && <Badge variant="secondary" className="text-[10px] h-4 bg-slate-800">Backtest</Badge>}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Clock size={10} />
                {format(new Date(trade.createdAt), 'MMM d, HH:mm')}
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge className={cn(
              "capitalize",
              trade.result === 'win' ? "bg-green-500/20 text-green-500 border-green-500/20" :
              trade.result === 'loss' ? "bg-red-500/20 text-red-500 border-red-500/20" :
              "bg-slate-800 text-slate-400 border-slate-700"
            )}>
              {trade.result}
            </Badge>
            <div className="text-xs text-slate-500 mt-1">{trade.riskPercent}% Risk</div>
          </div>
        </div>

        <div className="p-4 grid grid-cols-2 gap-4 bg-slate-900/50">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Strategy</p>
            <p className="text-sm font-medium capitalize">{trade.strategyName}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Entry Price</p>
            <p className="text-sm font-mono">{trade.entry}</p>
          </div>
        </div>

        {trade.notes && (
          <div className="px-4 pb-4">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/30 border border-slate-800/50">
              <MessageSquare size={14} className="text-slate-500 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-400 italic">{trade.notes}</p>
            </div>
          </div>
        )}

        {trade.result === 'pending' && (
          <div className="p-2 bg-slate-800/30 flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 text-green-500 hover:text-green-400 hover:bg-green-500/10"
              onClick={() => updateResult('win')}
              disabled={loading}
            >
              <CheckCircle2 size={16} className="mr-2" />
              Win
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 text-red-500 hover:text-red-400 hover:bg-red-500/10"
              onClick={() => updateResult('loss')}
              disabled={loading}
            >
              <XCircle size={16} className="mr-2" />
              Loss
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};