import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { LocksAlert } from "@/components/trading/LocksAlert";
import { TradeCard } from "@/components/trading/TradeCard";
import { KeyLevelsManager } from "@/components/trading/KeyLevelsManager";
import { LossReflectionModal } from "@/components/trading/LossReflectionModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trade } from "@/types/trading";
import { TrendingUp, TrendingDown, Activity, Calendar, Target, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [reflectionTradeId, setReflectionTradeId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setTrades(data);
    setLoading(false);
  };

  const completedTrades = trades.filter(t => t.result !== 'pending');
  const winRate = completedTrades.length > 0 
    ? (trades.filter(t => t.result === 'win').length / completedTrades.length * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 md:pt-20">
      <Navbar />
      <LocksAlert />
      
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Command Center</h1>
            <p className="text-slate-400">Real-time performance and market levels.</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
            <div className="px-4 py-2 text-center border-r border-slate-800">
              <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Win Rate</p>
              <p className="text-xl font-black text-blue-500">{winRate}%</p>
            </div>
            <div className="px-4 py-2 text-center">
              <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Total P/L</p>
              <p className="text-xl font-black text-green-500">+$0.00</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={80} />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{trades.length}</div>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                <ArrowUpRight size={12} className="text-green-500" />
                <span>+0 from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={80} className="text-green-500" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Wins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-green-500">{trades.filter(t => t.result === 'win').length}</div>
              <p className="text-xs text-slate-500 mt-2">Profitable executions</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingDown size={80} className="text-red-500" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Losses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-red-500">{trades.filter(t => t.result === 'loss').length}</div>
              <p className="text-xs text-slate-500 mt-2">Learning opportunities</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Recent Activity
              </h2>
              <Badge variant="outline" className="border-slate-800 text-slate-500">Last 5 Trades</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trades.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-slate-900/30 rounded-3xl border border-slate-800 text-slate-500">
                  No trades logged yet.
                </div>
              ) : (
                trades.slice(0, 4).map((trade) => (
                  <TradeCard 
                    key={trade.id} 
                    trade={trade} 
                    onUpdate={fetchData}
                    onLoss={(id) => setReflectionTradeId(id)}
                  />
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Key Levels
              </h2>
            </div>
            <KeyLevelsManager />
          </div>
        </div>
      </div>

      <LossReflectionModal 
        tradeId={reflectionTradeId}
        isOpen={!!reflectionTradeId}
        onClose={() => setReflectionTradeId(null)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default Dashboard;