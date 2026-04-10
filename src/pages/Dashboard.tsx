import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { LocksAlert } from "@/components/trading/LocksAlert";
import { TradeCard } from "@/components/trading/TradeCard";
import { KeyLevelsManager } from "@/components/trading/KeyLevelsManager";
import { StatsCard } from "@/components/trading/StatsCard";
import { RiskCalculator } from "@/components/trading/RiskCalculator";
import { LossReflectionModal } from "@/components/trading/LossReflectionModal";
import { Badge } from "@/components/ui/badge";
import { Trade } from "@/types/trading";
import { Calendar, Target, TrendingUp, ClipboardList } from "lucide-react";

const Dashboard = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reflectionTradeId, setReflectionTradeId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [tradesRes, profileRes] = await Promise.all([
      supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('id', user.id).single()
    ]);

    if (tradesRes.data) setTrades(tradesRes.data);
    if (profileRes.data) setProfile(profileRes.data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 md:pt-20">
      <Navbar />
      <LocksAlert />
      
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Performance Overview</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">Command Center</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-slate-900 border-slate-800 text-slate-400 px-3 py-1">
              Strategy: <span className="text-white ml-1 capitalize">{profile?.active_strategy || 'None'}</span>
            </Badge>
          </div>
        </header>

        <div className="mb-8">
          <StatsCard trades={trades} maxWeeklyLoss={profile?.max_weekly_loss_percent || 5} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Recent Activity
              </h2>
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
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-500" />
                Daily Trading Plan
              </h2>
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800">
                <p className="text-sm text-slate-400 italic mb-4">"Plan the trade, trade the plan."</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm text-slate-300">Check high-impact news (ForexFactory)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm text-slate-300">Identify HTF bias on primary pairs</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm text-slate-300">Mark out key liquidity zones & OBs</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Risk Management
              </h2>
              <RiskCalculator />
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Key Levels
              </h2>
              <KeyLevelsManager />
            </section>
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