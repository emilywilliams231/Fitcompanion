import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BacktestToggleProps {
  isBacktest: boolean;
  onToggle: (val: boolean) => void;
}

export const BacktestToggle = ({ isBacktest, onToggle }: BacktestToggleProps) => {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all",
      isBacktest ? "bg-purple-500/10 border-purple-500/30" : "bg-slate-900 border-slate-800"
    )}>
      <div className="flex flex-col">
        <Label htmlFor="backtest-mode" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Journal Mode
        </Label>
        <span className="text-xs font-bold">
          {isBacktest ? "Backtesting" : "Live Trading"}
        </span>
      </div>
      <Switch 
        id="backtest-mode" 
        checked={isBacktest} 
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-purple-500"
      />
      {isBacktest && (
        <Badge className="bg-purple-500 text-white border-none animate-pulse">
          SIM
        </Badge>
      )}
    </div>
  );
};