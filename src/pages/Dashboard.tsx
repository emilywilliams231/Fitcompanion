import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trade, KeyLevel } from "@/types/trading";
import { TrendingUp, TrendingDown, Activity, Calendar, Plus, Trash2, Lock } from "lucide-react";
import { format } from "date-fns";
import { showSuccess, showError } from "@/utils/toast";
import { useLocks } from "@/hooks/useLocks";

const Dashboard = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [keyLevels, setKeyLevels] = useState<KeyLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const { status: lockStatus } = useLocks();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [tradesRes, levelsRes] = await Promise.all([
      supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('key_levels').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ]);

    if (tradesRes.data) setTrades(tradesRes.data);
    if (levelsRes.data) setKeyLevels(levelsRes.data);
    setLoading(false);
  };

  const winRate = trades.length > 0 
    ? (trades.filter(t => t.result === 'win').length / trades.filter(t => t.result !== 'pending').length * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 md:pt-20">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        {lockStatus.locked && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
            <Lock className="w-5 h-5" />
            <span className="font-medium">{lockStatus.message}</span>
          </div>
        )}

        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trading Command Center</h1>
            <p className="text-slate-400">Monitor your performance and key levels.</p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-1.5">
              Win Rate: {winRate}%
            </Badge>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Total Trades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{trades.length}</div>
              <p className="text-xs text-slate-500 mt-1">Across all strategies</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Wins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{trades.filter(t => t.result === 'win').length}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                Losses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{trades.filter(t => t.result === 'loss').length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {trades.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/50 rounded-3xl border border-slate-800 text-slate-500">
                  No trades logged yet.
                </div>
              ) : (
                trades.slice(0, 5).map((trade) => (
                  <Card key={trade.id} className="bg-slate-900 border-slate-800 text-white">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-xl",
                          trade.result === 'win' ? "bg-green-500/10 text-green-500" : 
                          trade.result === 'loss' ? "bg-red-500/10 text-red-500" : "bg-slate-800 text-slate-400"
                        )}>
                          {trade.direction === 'long' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{trade.pair}</span>
                            {trade.isBacktest && <Badge variant="secondary" className="text-[10px] h-4">Backtest</Badge>}
                          </div>
                          <div className="text-xs text-slate-500">
                            {format(new Date(trade.createdAt), 'MMM d, HH:mm')} • {trade.strategyName}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "font-bold",
                          trade.result === 'win' ? "text-green-500" : 
                          trade.result === 'loss' ? "text-red-500" : "text-slate-400"
                        )}>
                          {trade.result.toUpperCase()}
                        </div>
                        <div className="text-xs text-slate-500">{trade.riskPercent}% Risk</div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Key Levels</h2>
              <Button size="sm" variant="ghost" className="text-blue-400"><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-3">
              {keyLevels.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No key levels tracked.</p>
              ) : (
                keyLevels.map(level => (
                  <div key={level.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm">{level.pair}</div>
                      <div className="text-blue-400 font-mono text-xs">{level.price}</div>
                    </div>
                    <div className="text-[10px] text-slate-500">{level.notes}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { cn } from "@/lib/utils";
export default Dashboard;