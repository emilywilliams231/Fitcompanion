import { Card, CardContent } from "@/components/ui/card";
import { Trade } from "@/types/trading";
import { TrendingUp, TrendingDown, Percent, Target, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  trades: Trade[];
  maxWeeklyLoss: number;
}

export const StatsCard = ({ trades, maxWeeklyLoss }: StatsCardProps) => {
  const completedTrades = trades.filter(t => t.result !== 'pending' && !t.isBacktest);
  const wins = completedTrades.filter(t => t.result === 'win');
  const losses = completedTrades.filter(t => t.result === 'loss');
  
  const winRate = completedTrades.length > 0 
    ? (wins.length / completedTrades.length * 100).toFixed(1) 
    : "0";

  // Calculate current weekly loss (simplified as sum of risk of losses)
  const currentWeeklyLoss = losses.reduce((acc, t) => acc + t.riskPercent, 0);
  const weeklyLossRemaining = Math.max(0, maxWeeklyLoss - currentWeeklyLoss).toFixed(1);

  const stats = [
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: Target,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      label: "Weekly Loss Left",
      value: `${weeklyLossRemaining}%`,
      icon: AlertCircle,
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    {
      label: "Profit Factor",
      value: losses.length > 0 ? (wins.length / losses.length).toFixed(2) : wins.length > 0 ? "∞" : "0.00",
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      label: "Avg Risk",
      value: completedTrades.length > 0 
        ? (completedTrades.reduce((acc, t) => acc + t.riskPercent, 0) / completedTrades.length).toFixed(2) + "%"
        : "0%",
      icon: Percent,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{stat.label}</span>
            </div>
            <div className="text-2xl font-black">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};